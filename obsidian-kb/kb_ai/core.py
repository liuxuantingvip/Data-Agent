import hashlib
import json
import math
import re
import sqlite3
import sys
from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Sequence, Tuple

from .config import (
    AI_KB_DIR,
    AI_KB_SUBDIRS,
    ARTIFACTS_DIR,
    DATA_DIR,
    DECISIONS_DIR,
    EXPORT_DIR,
    EXPORT_NOTES_DIR,
    INDEX_DB,
    MEMORY_CANDIDATES_DIR,
    PREFERENCES_DIR,
    PROJECTS_DIR,
    SKILLS_DIR,
    SOURCES_DIR,
    SESSIONS_DIR,
    VAULT_PATH,
)
from .frontmatter import dump_markdown, parse_markdown


HEADING_RE = re.compile(r"^(#{1,6})\s+(.*)$", re.MULTILINE)
TOKEN_RE = re.compile(r"[A-Za-z0-9_\-\u4e00-\u9fff]+")
SKILL_SECTION_TYPE_RULES = {
    "purpose": ("concept", "fact"),
    "key concepts": ("concept", "fact"),
    "application": ("workflow", "fact"),
    "facilitation source of truth": ("workflow", "fact"),
    "phase": ("workflow", "fact"),
    "template": ("template", "fact"),
    "example": ("example", "fact"),
}
PREFERENCE_HINTS = ("偏好", "原则", "心法", "不喜欢", "习惯", "风格")
DECISION_HINTS = ("决定", "选择", "取舍", "原因", "为什么", "方案")
SUPPORTED_TARGETS = ("codex", "claude", "opencode", "qclaw", "arkclaw", "openclaw", "generic")
TARGET_ALIASES = {
    "codex": "codex",
    "claude": "claude",
    "opencode": "opencode",
    "qclaw": "qclaw",
    "arkclaw": "arkclaw",
    "openclaw": "openclaw",
    "generic": "generic",
}
TARGET_STYLE_LINES = {
    "codex": "Prefer concise, direct, implementation-first responses with explicit file paths and decisions.",
    "claude": "Prefer structured reasoning, slightly richer explanation, and explicit assumptions.",
    "opencode": "Prefer compact technical context, source-backed summaries, and clear next actions.",
    "qclaw": "Prefer short, tool-ready context with product intent, project state, and decision history.",
    "arkclaw": "Prefer structured context packets that separate facts, decisions, and constraints.",
    "openclaw": "Prefer neutral markdown packets with explicit sources and minimal extra narration.",
    "generic": "Prefer concise structured output, explicit assumptions, and source-aware reasoning.",
}
TARGET_SYSTEM_HINTS = {
    "codex": "Use this packet as execution context. Favor concrete edits, exact paths, and decisions already made.",
    "claude": "Use this packet as long-context grounding. Preserve nuance, assumptions, and rationale.",
    "opencode": "Use this packet as compact technical memory. Keep output operational and source-aware.",
    "qclaw": "Use this packet as product-and-project memory. Surface past decisions before suggesting new ones.",
    "arkclaw": "Use this packet as a structured planning substrate. Separate what is true from what is preferred.",
    "openclaw": "Use this packet as neutral shared memory across tools. Preserve source traceability.",
    "generic": "Use this packet as shared working memory and cite source references when making decisions.",
}


@dataclass
class SearchResult:
    chunk_id: int
    doc_path: str
    title: str
    heading: str
    memory_type: str
    entity_type: str
    project: str
    score: float
    excerpt: str


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def slugify(value: str) -> str:
    cleaned = re.sub(r"[^\w\u4e00-\u9fff-]+", "-", value.strip().lower())
    cleaned = re.sub(r"-{2,}", "-", cleaned).strip("-")
    return cleaned or "untitled"


def ensure_environment() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    EXPORT_DIR.mkdir(parents=True, exist_ok=True)
    for path in AI_KB_SUBDIRS:
        path.mkdir(parents=True, exist_ok=True)


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def enumerate_markdown_files(root: Path) -> Iterable[Path]:
    for path in sorted(root.rglob("*.md")):
        if ".obsidian" in path.parts:
            continue
        if "AI-KB" in path.parts:
            continue
        yield path


def split_sections(body: str) -> List[Tuple[str, str]]:
    matches = list(HEADING_RE.finditer(body))
    if not matches:
        stripped = body.strip()
        return [("Overview", stripped)] if stripped else []
    sections: List[Tuple[str, str]] = []
    for idx, match in enumerate(matches):
        start = match.end()
        end = matches[idx + 1].start() if idx + 1 < len(matches) else len(body)
        heading = match.group(2).strip()
        content = body[start:end].strip()
        if content:
            sections.append((heading, content))
    return sections


def summarize_text(text: str, limit: int = 240) -> str:
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= limit:
        return text
    return text[: limit - 3].rstrip() + "..."


def canonical_target(target: str) -> str:
    normalized = target.strip().lower()
    if normalized not in TARGET_ALIASES:
        raise ValueError(f"Unsupported target: {target}")
    return TARGET_ALIASES[normalized]


def normalize_list(value) -> List[str]:
    if value is None:
        return []
    if isinstance(value, list):
        return [str(item) for item in value if str(item).strip()]
    if isinstance(value, str):
        return [part.strip() for part in value.split(",") if part.strip()]
    return [str(value)]


def guess_memory_type(title: str, body: str, default: str = "fact") -> str:
    haystack = f"{title}\n{body}"
    if any(token in haystack for token in PREFERENCE_HINTS):
        return "preference"
    if any(token in haystack for token in DECISION_HINTS):
        return "decision"
    return default


def classify_note(source_path: Path, body: str) -> Tuple[Path, str, str]:
    rel = source_path.relative_to(VAULT_PATH)
    first = rel.parts[0] if rel.parts else ""
    if first == "个人知识库":
        return PREFERENCES_DIR, "artifact", "preference"
    if first == "工作":
        return ARTIFACTS_DIR, "artifact", guess_memory_type(source_path.stem, body, "decision")
    return SOURCES_DIR, "source", "fact"


def split_skill_sections(body: str) -> List[Tuple[str, str, str]]:
    sections = split_sections(body)
    typed_sections = []
    for heading, content in sections:
        lower = heading.lower()
        card_type = "concept"
        memory_type = "fact"
        for key, value in SKILL_SECTION_TYPE_RULES.items():
            if key in lower:
                card_type, memory_type = value
                break
        typed_sections.append((heading, card_type, content if content else "", memory_type))
    return typed_sections


def render_index_body(title: str, summary: str, cards: Sequence[Dict[str, str]], source: str) -> str:
    lines = [
        f"# {title}",
        "",
        "## Summary",
        summary or "No summary available.",
        "",
        "## Source",
        f"- {source}",
        "",
        "## Linked Cards",
    ]
    if not cards:
        lines.append("- None")
    for card in cards:
        lines.append(f"- [[{card['path']}|{card['title']}]]")
    lines.append("")
    return "\n".join(lines)


def build_card_frontmatter(
    *,
    title: str,
    memory_type: str,
    entity_type: str,
    project: str,
    source_refs: Sequence[str],
    tags: Sequence[str],
    export_targets: Sequence[str],
    kb_type: str,
    confidence: str = "medium",
    visibility: str = "shared",
) -> Dict[str, object]:
    return {
        "id": slugify(f"{title}-{hashlib.sha1('|'.join(source_refs).encode('utf-8')).hexdigest()[:8]}"),
        "title": title,
        "memory_type": memory_type,
        "entity_type": entity_type,
        "project": project,
        "source_refs": list(source_refs),
        "tags": list(tags),
        "updated_at": now_iso(),
        "confidence": confidence,
        "visibility": visibility,
        "export_targets": list(export_targets),
        "kb_type": kb_type,
    }


def ingest_skills(source_dir: Path) -> Dict[str, int]:
    ensure_environment()
    count_skills = 0
    count_cards = 0
    for skill_dir in sorted(source_dir.iterdir()):
        if not skill_dir.is_dir():
            continue
        skill_file = skill_dir / "SKILL.md"
        if not skill_file.exists():
            continue
        count_skills += 1
        frontmatter, body = parse_markdown(read_text(skill_file))
        skill_name = str(frontmatter.get("name") or skill_dir.name)
        skill_title = str(frontmatter.get("description") or skill_name)
        skill_root = SKILLS_DIR / skill_name
        cards_root = skill_root / "cards"
        cards_root.mkdir(parents=True, exist_ok=True)

        linked_cards: List[Dict[str, str]] = []
        for idx, (heading, kb_type, content, memory_type) in enumerate(split_skill_sections(body), start=1):
            title = f"{skill_name} - {heading}"
            card_frontmatter = build_card_frontmatter(
                title=title,
                memory_type=memory_type,
                entity_type="skill",
                project="shared",
                source_refs=[str(skill_file)],
                tags=[skill_name, kb_type, "skill"],
                export_targets=["codex", "claude", "generic"],
                kb_type=kb_type,
            )
            body_text = "\n".join(
                [
                    f"# {title}",
                    "",
                    f"## Skill",
                    f"- {skill_name}",
                    "",
                    f"## Section Type",
                    f"- {kb_type}",
                    "",
                    f"## Content",
                    content.strip(),
                    "",
                ]
            )
            card_path = cards_root / f"{idx:02d}-{slugify(heading)}.md"
            write_text(card_path, dump_markdown(card_frontmatter, body_text))
            linked_cards.append(
                {
                    "title": title,
                    "path": str(card_path.relative_to(VAULT_PATH)),
                }
            )
            count_cards += 1

        index_frontmatter = {
            "id": slugify(f"{skill_name}-index"),
            "title": skill_name,
            "memory_type": "fact",
            "entity_type": "skill",
            "project": "shared",
            "source_refs": [str(skill_file)],
            "tags": [skill_name, "skill-index"],
            "updated_at": now_iso(),
            "confidence": "high",
            "visibility": "shared",
            "export_targets": ["codex", "claude", "generic"],
            "kb_type": "index-note",
        }
        summary = str(frontmatter.get("intent") or frontmatter.get("description") or skill_title)
        index_body = render_index_body(skill_name, summary, linked_cards, str(skill_file))
        write_text(skill_root / "index.md", dump_markdown(index_frontmatter, index_body))
    return {"skills": count_skills, "cards": count_cards}


def ingest_notes(source: str) -> Dict[str, int]:
    ensure_environment()
    source_path = Path(source)
    if not source_path.is_absolute():
        source_path = VAULT_PATH / source
    if not source_path.exists():
        raise FileNotFoundError(f"Source not found: {source}")

    files = [source_path] if source_path.is_file() else list(enumerate_markdown_files(source_path))
    note_count = 0
    card_count = 0
    for path in files:
        if not path.name.endswith(".md"):
            continue
        note_count += 1
        frontmatter, body = parse_markdown(read_text(path))
        base_dir, entity_type, default_memory_type = classify_note(path, body)
        note_slug = slugify(path.stem)
        note_root = base_dir / note_slug
        cards_root = note_root / "cards"
        cards_root.mkdir(parents=True, exist_ok=True)
        sections = split_sections(body) or [("Overview", body.strip())]
        linked_cards: List[Dict[str, str]] = []
        for idx, (heading, content) in enumerate(sections, start=1):
            if not content.strip():
                continue
            title = f"{path.stem} - {heading}"
            memory_type = guess_memory_type(heading, content, default_memory_type)
            tags = normalize_list(frontmatter.get("tags")) or [entity_type, memory_type]
            project = str(frontmatter.get("project") or path.parent.name)
            kb_type = "memory-card"
            card_frontmatter = build_card_frontmatter(
                title=title,
                memory_type=memory_type,
                entity_type=entity_type,
                project=project,
                source_refs=[str(path)],
                tags=tags,
                export_targets=["codex", "claude", "generic"],
                kb_type=kb_type,
            )
            body_text = "\n".join(
                [
                    f"# {title}",
                    "",
                    "## Source",
                    f"- {path.relative_to(VAULT_PATH)}",
                    "",
                    "## Content",
                    content.strip(),
                    "",
                ]
            )
            card_path = cards_root / f"{idx:02d}-{slugify(heading)}.md"
            write_text(card_path, dump_markdown(card_frontmatter, body_text))
            linked_cards.append({"title": title, "path": str(card_path.relative_to(VAULT_PATH))})
            card_count += 1

        index_frontmatter = {
            "id": slugify(f"{path.stem}-index"),
            "title": path.stem,
            "memory_type": default_memory_type,
            "entity_type": entity_type,
            "project": str(frontmatter.get("project") or path.parent.name),
            "source_refs": [str(path)],
            "tags": normalize_list(frontmatter.get("tags")) or [entity_type],
            "updated_at": now_iso(),
            "confidence": "medium",
            "visibility": "shared",
            "export_targets": ["codex", "claude", "generic"],
            "kb_type": "index-note",
        }
        index_body = render_index_body(path.stem, summarize_text(body), linked_cards, str(path))
        write_text(note_root / "index.md", dump_markdown(index_frontmatter, index_body))
    return {"notes": note_count, "cards": card_count}


def connect_db() -> sqlite3.Connection:
    ensure_environment()
    conn = sqlite3.connect(INDEX_DB)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS docs (
            id INTEGER PRIMARY KEY,
            path TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            memory_type TEXT NOT NULL,
            entity_type TEXT NOT NULL,
            project_name TEXT NOT NULL,
            kb_type TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            metadata_json TEXT NOT NULL,
            content TEXT NOT NULL
        )
        """
    )
    conn.execute(
        """
        CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts USING fts5(
            doc_path,
            title,
            heading,
            body,
            tokenize='unicode61 remove_diacritics 2'
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS chunks (
            id INTEGER PRIMARY KEY,
            doc_path TEXT NOT NULL,
            title TEXT NOT NULL,
            heading TEXT NOT NULL,
            memory_type TEXT NOT NULL,
            entity_type TEXT NOT NULL,
            project_name TEXT NOT NULL,
            kb_type TEXT NOT NULL,
            body TEXT NOT NULL,
            embedding_json TEXT NOT NULL
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS index_state (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )
        """
    )
    return conn


def iter_ai_kb_markdown() -> Iterable[Path]:
    for path in sorted(AI_KB_DIR.rglob("*.md")):
        if ".obsidian" in path.parts:
            continue
        yield path


def tokenize(text: str) -> List[str]:
    return [token.lower() for token in TOKEN_RE.findall(text)]


def build_embedding(text: str, dimensions: int = 128) -> List[float]:
    vector = [0.0] * dimensions
    for token in tokenize(text):
        digest = hashlib.sha1(token.encode("utf-8")).hexdigest()
        idx = int(digest[:8], 16) % dimensions
        vector[idx] += 1.0
    norm = math.sqrt(sum(value * value for value in vector))
    if norm == 0:
        return vector
    return [value / norm for value in vector]


def cosine_similarity(a: Sequence[float], b: Sequence[float]) -> float:
    if not a or not b:
        return 0.0
    return sum(x * y for x, y in zip(a, b))


def rebuild_index() -> Dict[str, int]:
    conn = connect_db()
    try:
        conn.execute("DELETE FROM docs")
        conn.execute("DELETE FROM chunks")
        conn.execute("DELETE FROM chunks_fts")
        doc_count = 0
        chunk_count = 0
        for path in iter_ai_kb_markdown():
            text = read_text(path)
            frontmatter, body = parse_markdown(text)
            rel_path = str(path.relative_to(VAULT_PATH))
            title = str(frontmatter.get("title") or path.stem)
            memory_type = str(frontmatter.get("memory_type") or "fact")
            entity_type = str(frontmatter.get("entity_type") or "artifact")
            project_name = str(frontmatter.get("project") or "shared")
            kb_type = str(frontmatter.get("kb_type") or "memory-card")
            updated_at = str(frontmatter.get("updated_at") or now_iso())
            conn.execute(
                """
                INSERT INTO docs(path, title, memory_type, entity_type, project_name, kb_type, updated_at, metadata_json, content)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    rel_path,
                    title,
                    memory_type,
                    entity_type,
                    project_name,
                    kb_type,
                    updated_at,
                    json.dumps(frontmatter, ensure_ascii=False),
                    body,
                ),
            )
            doc_count += 1
            sections = split_sections(body) or [("Overview", body.strip())]
            for heading, content in sections:
                if not content.strip():
                    continue
                embedding = build_embedding(f"{title}\n{heading}\n{content}")
                conn.execute(
                    """
                    INSERT INTO chunks(doc_path, title, heading, memory_type, entity_type, project_name, kb_type, body, embedding_json)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        rel_path,
                        title,
                        heading,
                        memory_type,
                        entity_type,
                        project_name,
                        kb_type,
                        content,
                        json.dumps(embedding),
                    ),
                )
                conn.execute(
                    """
                    INSERT INTO chunks_fts(doc_path, title, heading, body)
                    VALUES (?, ?, ?, ?)
                    """,
                    (rel_path, title, heading, content),
                )
                chunk_count += 1
        conn.execute(
            "INSERT OR REPLACE INTO index_state(key, value) VALUES ('last_built_at', ?)",
            (now_iso(),),
        )
        conn.commit()
        return {"docs": doc_count, "chunks": chunk_count}
    finally:
        conn.close()


def query_chunks(query: str, limit: int = 8, memory_filter: Optional[str] = None) -> List[SearchResult]:
    conn = connect_db()
    try:
        where = ""
        params: List[object] = []
        if memory_filter and memory_filter != "all":
            where = "AND c.memory_type = ?"
            params.append(memory_filter.rstrip("s"))
        try:
            fts_rows = conn.execute(
                f"""
                SELECT c.id, c.doc_path, c.title, c.heading, c.memory_type, c.entity_type, c.project_name, c.body,
                       bm25(chunks_fts) AS rank
                FROM chunks_fts
                JOIN chunks c ON c.doc_path = chunks_fts.doc_path AND c.heading = chunks_fts.heading AND c.body = chunks_fts.body
                WHERE chunks_fts MATCH ?
                {where}
                ORDER BY rank
                LIMIT ?
                """,
                [query] + params + [limit * 3],
            ).fetchall()
        except sqlite3.OperationalError:
            fts_rows = conn.execute(
                f"""
                SELECT c.id, c.doc_path, c.title, c.heading, c.memory_type, c.entity_type, c.project_name, c.body, 0.0 AS rank
                FROM chunks c
                WHERE (c.title LIKE ? OR c.heading LIKE ? OR c.body LIKE ?)
                {where}
                LIMIT ?
                """,
                [f"%{query}%"] * 3 + params + [limit * 3],
            ).fetchall()

        query_embedding = build_embedding(query)
        scored: List[SearchResult] = []
        seen = set()
        for row in fts_rows:
            embedding = json.loads(
                conn.execute("SELECT embedding_json FROM chunks WHERE id = ?", (row["id"],)).fetchone()[0]
            )
            semantic = cosine_similarity(query_embedding, embedding)
            lexical = max(0.0, -float(row["rank"])) if row["rank"] is not None else 0.0
            score = lexical + semantic
            key = (row["doc_path"], row["heading"])
            if key in seen:
                continue
            seen.add(key)
            scored.append(
                SearchResult(
                    chunk_id=row["id"],
                    doc_path=row["doc_path"],
                    title=row["title"],
                    heading=row["heading"],
                    memory_type=row["memory_type"],
                    entity_type=row["entity_type"],
                    project=row["project_name"],
                    score=score,
                    excerpt=summarize_text(row["body"], 220),
                )
            )

        if not scored:
            all_rows = conn.execute(
                "SELECT id, doc_path, title, heading, memory_type, entity_type, project_name, body, embedding_json FROM chunks"
            ).fetchall()
            for row in all_rows:
                if memory_filter and memory_filter != "all" and row["memory_type"] != memory_filter.rstrip("s"):
                    continue
                semantic = cosine_similarity(query_embedding, json.loads(row["embedding_json"]))
                if semantic <= 0:
                    continue
                scored.append(
                    SearchResult(
                        chunk_id=row["id"],
                        doc_path=row["doc_path"],
                        title=row["title"],
                        heading=row["heading"],
                        memory_type=row["memory_type"],
                        entity_type=row["entity_type"],
                        project=row["project_name"],
                        score=semantic,
                        excerpt=summarize_text(row["body"], 220),
                    )
                )

        scored.sort(key=lambda item: item.score, reverse=True)
        return scored[:limit]
    finally:
        conn.close()


def _result_bucket(groups: Dict[str, List[SearchResult]], key: str) -> List[SearchResult]:
    return groups.get(key, [])


def _render_result_lines(items: Sequence[SearchResult]) -> List[str]:
    lines: List[str] = []
    for item in items:
        lines.append(f"- {item.title}: {item.excerpt}")
        lines.append(f"  Source: {item.doc_path}")
    return lines


def render_yaml_block(data: Dict[str, object]) -> str:
    lines = ["---"]
    for key, value in data.items():
        if isinstance(value, list):
            lines.append(f"{key}:")
            for item in value:
                lines.append(f"  - {item}")
        else:
            lines.append(f"{key}: {value}")
    lines.append("---")
    return "\n".join(lines)


def search_output(query: str, limit: int = 8) -> str:
    results = query_chunks(query, limit=limit)
    lines = [f"# Search Results", "", f"- Query: {query}", f"- Hits: {len(results)}", ""]
    for item in results:
        lines.extend(
            [
                f"## {item.title} / {item.heading}",
                f"- score: {item.score:.4f}",
                f"- memory_type: {item.memory_type}",
                f"- entity_type: {item.entity_type}",
                f"- project: {item.project}",
                f"- source: {item.doc_path}",
                "",
                item.excerpt,
                "",
            ]
        )
    return "\n".join(lines).rstrip() + "\n"


def recall_output(query: str, memory: str = "all", limit: int = 8) -> str:
    results = query_chunks(query, limit=limit, memory_filter=memory)
    groups: Dict[str, List[SearchResult]] = defaultdict(list)
    for item in results:
        groups[item.memory_type].append(item)
    yaml_block = render_yaml_block(
        {
            "query": query,
            "memory": memory,
            "hits": len(results),
            "sources": [item.doc_path for item in results],
        }
    )
    lines = [yaml_block, ""]
    for key in ["fact", "decision", "preference"]:
        title = {
            "fact": "Relevant Facts",
            "decision": "Relevant Decisions",
            "preference": "Relevant Preferences",
        }[key]
        lines.extend([f"## {title}", ""])
        items = groups.get(key, [])
        if not items:
            lines.append("- None")
            lines.append("")
            continue
        for item in items:
            lines.append(f"- {item.title} [{item.heading}] ({item.doc_path})")
            lines.append(f"  {item.excerpt}")
        lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def context_output(query: str, target: str, limit: int = 10) -> str:
    target = canonical_target(target)
    results = query_chunks(query, limit=limit)
    groups: Dict[str, List[SearchResult]] = defaultdict(list)
    for item in results:
        groups[item.memory_type].append(item)
    style_line = TARGET_STYLE_LINES[target]
    system_hint = TARGET_SYSTEM_HINTS[target]
    yaml_block = render_yaml_block(
        {
            "query": query,
            "target": target,
            "projects": sorted({item.project for item in results}),
            "memory_mix": [f"{key}:{len(value)}" for key, value in groups.items()],
            "source_list": [item.doc_path for item in results],
        }
    )
    lines = [yaml_block, ""]
    lines.extend(["## System Hint", "", f"- {system_hint}", ""])
    for key, label in [
        ("fact", "Relevant Facts"),
        ("decision", "Relevant Decisions"),
        ("preference", "Relevant Preferences"),
    ]:
        lines.extend([f"## {label}", ""])
        if not _result_bucket(groups, key):
            lines.extend(["- None", ""])
            continue
        lines.extend(_render_result_lines(_result_bucket(groups, key)))
        lines.append("")
    lines.extend(["## Recommended Working Style", "", f"- {style_line}", "", "## Source References", ""])
    if results:
        for item in results:
            lines.append(f"- {item.doc_path}")
    else:
        lines.append("- None")
    lines.append("")
    return "\n".join(lines)


def session_summarize(source: str) -> Dict[str, str]:
    ensure_environment()
    source_path = Path(source)
    if not source_path.is_absolute():
        source_path = Path.cwd() / source
    if not source_path.exists():
        raise FileNotFoundError(f"Conversation source not found: {source}")
    frontmatter, body = parse_markdown(read_text(source_path))
    transcript_lines, projects, title = _extract_session_payload(source_path, frontmatter, body)
    lines = transcript_lines
    facts: List[str] = []
    decisions: List[str] = []
    preferences: List[str] = []
    low_confidence: List[str] = []
    for line in lines[:60]:
        if any(token in line for token in PREFERENCE_HINTS):
            preferences.append(line)
        elif any(token in line for token in DECISION_HINTS):
            decisions.append(line)
        elif len(facts) < 8:
            facts.append(line)
        else:
            low_confidence.append(line)
    candidate_id = slugify(f"{source_path.stem}-{datetime.now().strftime('%Y%m%d%H%M%S')}")
    frontmatter = {
        "id": candidate_id,
        "title": title,
        "memory_type": "fact",
        "entity_type": "session",
        "project": "shared",
        "source_refs": [str(source_path)],
        "tags": ["session-summary", "candidate"],
        "updated_at": now_iso(),
        "confidence": "low",
        "visibility": "private",
        "export_targets": ["codex", "claude", "generic"],
        "kb_type": "session-candidate",
        "status": "pending",
    }
    body_lines = [
        f"# {title}",
        "",
        "## Session Topic",
        title,
        "",
        "## Projects",
    ]
    body_lines.extend(f"- {item}" for item in (projects or ["shared"]))
    body_lines.extend(["", "## Facts"])
    body_lines.extend(f"- {item}" for item in (facts or ["None identified"]))
    body_lines.extend(["", "## Decisions"])
    body_lines.extend(f"- {item}" for item in (decisions or ["None identified"]))
    body_lines.extend(["", "## Preferences"])
    body_lines.extend(f"- {item}" for item in (preferences or ["None identified"]))
    body_lines.extend(["", "## Suggested Cards"])
    suggested = [f"fact: {item}" for item in facts[:3]] + [f"decision: {item}" for item in decisions[:3]] + [
        f"preference: {item}" for item in preferences[:3]
    ]
    body_lines.extend(f"- {item}" for item in (suggested or ["None identified"]))
    body_lines.extend(["", "## Low Confidence Items"])
    body_lines.extend(f"- {item}" for item in (low_confidence[:8] or ["None"]))
    body_lines.append("")
    out_path = MEMORY_CANDIDATES_DIR / f"{candidate_id}.md"
    write_text(out_path, dump_markdown(frontmatter, "\n".join(body_lines)))
    return {"id": candidate_id, "path": str(out_path.relative_to(VAULT_PATH))}


def collect_session_source(
    *,
    source_type: str,
    value: Optional[str],
    tool: str,
    project: str,
    title: Optional[str] = None,
) -> Dict[str, str]:
    ensure_environment()
    tool = canonical_target(tool)
    payload_title, content = _collect_session_payload(
        source_type=source_type,
        value=value,
        tool=tool,
        project=project,
        title=title,
    )
    temp_dir = DATA_DIR / "incoming"
    temp_dir.mkdir(parents=True, exist_ok=True)
    temp_name = slugify(f"{tool}-{payload_title}-{datetime.now().strftime('%Y%m%d%H%M%S')}") + ".md"
    temp_path = temp_dir / temp_name
    write_text(temp_path, content)
    return import_session(source=str(temp_path), tool=tool, project=project, title=payload_title)


def list_codex_recent_sessions(limit: int = 10, index_path: Optional[Path] = None) -> List[Dict[str, str]]:
    index_path = index_path or Path("/Users/sensen/.codex/session_index.jsonl")
    if not index_path.exists():
        return []
    sessions: List[Dict[str, str]] = []
    for raw_line in read_text(index_path).splitlines():
        raw_line = raw_line.strip()
        if not raw_line:
            continue
        try:
            item = json.loads(raw_line)
        except json.JSONDecodeError:
            continue
        sessions.append(
            {
                "id": str(item.get("id", "")),
                "thread_name": str(item.get("thread_name", "")),
                "updated_at": str(item.get("updated_at", "")),
            }
        )
    sessions.sort(key=lambda item: item.get("updated_at", ""), reverse=True)
    return sessions[:limit]


def render_codex_recent_sessions(limit: int = 10, index_path: Optional[Path] = None) -> str:
    sessions = list_codex_recent_sessions(limit=limit, index_path=index_path)
    lines = ["# Recent Codex Sessions", ""]
    if not sessions:
        lines.append("- None")
        lines.append("")
        return "\n".join(lines)
    for item in sessions:
        lines.append(f"- {item['id']} | {item['updated_at']} | {item['thread_name']}")
    lines.append("")
    return "\n".join(lines)


def _collect_session_payload(
    *,
    source_type: str,
    value: Optional[str],
    tool: str,
    project: str,
    title: Optional[str],
) -> Tuple[str, str]:
    normalized = source_type.strip().lower()
    if normalized == "file":
        if not value:
            raise ValueError("file source requires a path")
        source_path = Path(value)
        if not source_path.is_absolute():
            source_path = Path.cwd() / value
        if not source_path.exists():
            raise FileNotFoundError(f"Transcript file not found: {value}")
        return title or source_path.stem, read_text(source_path)
    if normalized == "stdin":
        content = sys.stdin.read()
        if not content.strip():
            raise ValueError("stdin source is empty")
        return title or f"{tool} stdin session", content
    if normalized == "clipboard":
        clipboard = _read_clipboard()
        if not clipboard.strip():
            raise ValueError("clipboard is empty")
        return title or f"{tool} clipboard session", clipboard
    if normalized == "codex-session-index":
        sessions = list_codex_recent_sessions(limit=20)
        if not sessions:
            raise FileNotFoundError("No Codex session_index.jsonl entries found")
        selected = sessions[0]
        if value:
            matched = [item for item in sessions if item["id"] == value]
            if matched:
                selected = matched[0]
        content = "\n".join(
            [
                f"Codex thread id: {selected['id']}",
                f"Codex thread name: {selected['thread_name']}",
                f"Updated at: {selected['updated_at']}",
                "This is metadata-only capture from session_index.jsonl.",
            ]
        )
        return title or selected["thread_name"] or selected["id"], content
    if normalized == "qclaw-memory":
        qclaw_path = Path(value) if value else Path("/Users/sensen/.qclaw/workspace/memory") / f"{datetime.now().strftime('%Y-%m-%d')}.md"
        if not qclaw_path.exists():
            raise FileNotFoundError(f"QClaw memory note not found: {qclaw_path}")
        return title or qclaw_path.stem, read_text(qclaw_path)
    raise ValueError(f"Unsupported session source type: {source_type}")


def _read_clipboard() -> str:
    import subprocess

    completed = subprocess.run(["pbpaste"], capture_output=True, text=True, check=False)
    if completed.returncode != 0:
        raise RuntimeError("pbpaste failed")
    return completed.stdout


def _extract_session_payload(
    source_path: Path,
    frontmatter: Dict[str, object],
    body: str,
) -> Tuple[List[str], List[str], str]:
    title = str(frontmatter.get("title") or source_path.stem)
    project = str(frontmatter.get("project") or "shared")
    transcript = extract_bullets(body, "Transcript")
    if transcript:
        clean = [_normalize_session_line(line) for line in transcript]
        clean = [line for line in clean if line]
        return clean, [project], title

    lines = [_normalize_session_line(line) for line in body.splitlines()]
    lines = [line for line in lines if line]
    inferred_projects: List[str] = [project] if project != "shared" else []
    for line in lines[:20]:
        if "项目" in line or "project" in line.lower():
            inferred_projects.append(line)
    if not inferred_projects:
        inferred_projects = ["shared"]
    return lines, inferred_projects, (lines[0][:80] if lines else title)


def import_session(
    *,
    source: str,
    tool: str,
    project: str = "shared",
    title: Optional[str] = None,
) -> Dict[str, str]:
    ensure_environment()
    source_path = Path(source)
    if not source_path.is_absolute():
        source_path = Path.cwd() / source
    if not source_path.exists():
        raise FileNotFoundError(f"Conversation source not found: {source}")

    tool = canonical_target(tool)
    raw_text = read_text(source_path)
    normalized_lines = [_normalize_session_line(line) for line in raw_text.splitlines()]
    normalized_lines = [line for line in normalized_lines if line]
    session_title = title or (normalized_lines[0][:80] if normalized_lines else source_path.stem)
    session_id = slugify(f"{tool}-{source_path.stem}-{datetime.now().strftime('%Y%m%d%H%M%S')}")
    session_frontmatter = {
        "id": session_id,
        "title": session_title,
        "memory_type": "fact",
        "entity_type": "session",
        "project": project,
        "source_refs": [str(source_path)],
        "tags": ["session", tool, project],
        "updated_at": now_iso(),
        "confidence": "medium",
        "visibility": "private",
        "export_targets": list(SUPPORTED_TARGETS),
        "kb_type": "session-log",
        "tool": tool,
    }
    session_body_lines = [
        f"# {session_title}",
        "",
        "## Tool",
        f"- {tool}",
        "",
        "## Project",
        f"- {project}",
        "",
        "## Source",
        f"- {source_path}",
        "",
        "## Transcript",
        "",
    ]
    session_body_lines.extend(f"- {line}" for line in normalized_lines)
    session_body_lines.append("")
    session_path = SESSIONS_DIR / tool / f"{session_id}.md"
    write_text(session_path, dump_markdown(session_frontmatter, "\n".join(session_body_lines)))

    summary = session_summarize(str(session_path))
    return {
        "session_id": session_id,
        "session_path": str(session_path.relative_to(VAULT_PATH)),
        "candidate_id": summary["id"],
        "candidate_path": summary["path"],
    }


def _normalize_session_line(line: str) -> str:
    line = re.sub(r"^\s*(user|assistant|system|human|ai)\s*:\s*", "", line, flags=re.IGNORECASE)
    line = re.sub(r"^\s*[-*#>\d\.\)\(]+\s*", "", line)
    return line.strip()


def list_candidates() -> str:
    ensure_environment()
    candidates = sorted(MEMORY_CANDIDATES_DIR.glob("*.md"))
    lines = ["# Memory Candidates", ""]
    for path in candidates:
        frontmatter, body = parse_markdown(read_text(path))
        title = str(frontmatter.get("title") or path.stem)
        status = str(frontmatter.get("status") or "pending")
        lines.extend([f"- {frontmatter.get('id', path.stem)} | {status} | {title} | {path.relative_to(VAULT_PATH)}"])
    if not candidates:
        lines.append("- None")
    lines.append("")
    return "\n".join(lines)


def extract_bullets(body: str, heading: str) -> List[str]:
    pattern = re.compile(rf"^##\s+{re.escape(heading)}\s*$", re.MULTILINE)
    match = pattern.search(body)
    if not match:
        return []
    start = match.end()
    next_heading = re.search(r"^##\s+", body[start:], re.MULTILINE)
    end = start + next_heading.start() if next_heading else len(body)
    section = body[start:end]
    bullets = []
    for line in section.splitlines():
        stripped = line.strip()
        if stripped.startswith("- "):
            value = stripped[2:].strip()
            if value and value.lower() != "none":
                bullets.append(value)
    return bullets


def approve_candidate(candidate_id: str) -> Dict[str, int]:
    ensure_environment()
    candidate_path = MEMORY_CANDIDATES_DIR / f"{candidate_id}.md"
    if not candidate_path.exists():
        raise FileNotFoundError(f"Candidate not found: {candidate_id}")
    frontmatter, body = parse_markdown(read_text(candidate_path))
    title = str(frontmatter.get("title") or candidate_id)
    project_items = extract_bullets(body, "Projects")
    project = project_items[0] if project_items else "shared"
    created = 0
    for section, base_dir, memory_type in [
        ("Facts", ARTIFACTS_DIR / "Facts", "fact"),
        ("Decisions", DECISIONS_DIR / "Approved", "decision"),
        ("Preferences", PREFERENCES_DIR / "Approved", "preference"),
    ]:
        for idx, item in enumerate(extract_bullets(body, section), start=1):
            entry_title = f"{title} - {section[:-1]} {idx}"
            card_frontmatter = build_card_frontmatter(
                title=entry_title,
                memory_type=memory_type,
                entity_type="session",
                project=project,
                source_refs=[str(candidate_path)],
                tags=["approved-memory", memory_type],
                export_targets=["codex", "claude", "generic"],
                kb_type="memory-card",
                confidence="medium",
                visibility="shared",
            )
            card_body = "\n".join([f"# {entry_title}", "", item, ""])
            path = base_dir / f"{slugify(entry_title)}.md"
            write_text(path, dump_markdown(card_frontmatter, card_body))
            created += 1
    frontmatter["status"] = "approved"
    frontmatter["updated_at"] = now_iso()
    write_text(candidate_path, dump_markdown(frontmatter, body))
    return {"created": created}


def export_bundle(target: str) -> Dict[str, str]:
    ensure_environment()
    target = canonical_target(target)
    target_dir = EXPORT_DIR / target
    target_dir.mkdir(parents=True, exist_ok=True)
    docs = []
    for path in iter_ai_kb_markdown():
        frontmatter, body = parse_markdown(read_text(path))
        export_targets = normalize_list(frontmatter.get("export_targets")) or ["generic"]
        if target not in export_targets and "generic" not in export_targets:
            continue
        rel = path.relative_to(VAULT_PATH)
        out_path = target_dir / rel
        write_text(out_path, dump_markdown(frontmatter, body))
        docs.append(str(rel))
    memory_packet = _build_memory_packet(target)
    write_text(target_dir / "MEMORY.md", memory_packet)
    write_text(target_dir / "CONTEXT.md", _build_context_packet(target))
    manifest = {
        "target": target,
        "generated_at": now_iso(),
        "documents": docs,
        "system_hint": TARGET_SYSTEM_HINTS[target],
        "count": len(docs),
    }
    manifest_path = target_dir / "manifest.json"
    write_text(manifest_path, json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    note_body = "\n".join(
        [
            f"# Export - {target}",
            "",
            f"- Generated at: {manifest['generated_at']}",
            f"- Count: {manifest['count']}",
            f"- Output: {target_dir}",
            "",
        ]
    )
    note_frontmatter = {
        "id": slugify(f"export-{target}"),
        "title": f"Export {target}",
        "memory_type": "fact",
        "entity_type": "artifact",
        "project": "shared",
        "source_refs": [str(manifest_path)],
        "tags": ["export", target],
        "updated_at": now_iso(),
        "confidence": "high",
        "visibility": "shared",
        "export_targets": [target],
        "kb_type": "export-note",
    }
    write_text(EXPORT_NOTES_DIR / f"{target}.md", dump_markdown(note_frontmatter, note_body))
    return {"target": target, "output_dir": str(target_dir), "count": str(len(docs))}


def _build_memory_packet(target: str, limit: int = 20) -> str:
    conn = connect_db()
    try:
        docs = conn.execute(
            """
            SELECT path, title, memory_type, entity_type, project_name, updated_at
            FROM docs
            ORDER BY updated_at DESC, path ASC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()
    finally:
        conn.close()
    lines = [
        f"# Shared Memory Packet - {target}",
        "",
        f"- Generated at: {now_iso()}",
        f"- System hint: {TARGET_SYSTEM_HINTS[target]}",
        "",
        "## Recent Memory Documents",
        "",
    ]
    for row in docs:
        lines.append(
            f"- [{row['memory_type']}] {row['title']} | {row['entity_type']} | {row['project_name']} | {row['path']}"
        )
    if not docs:
        lines.append("- None")
    lines.append("")
    return "\n".join(lines)


def _build_context_packet(target: str) -> str:
    lines = [
        f"# Context Contract - {target}",
        "",
        "## Use This Memory",
        f"- {TARGET_SYSTEM_HINTS[target]}",
        "",
        "## Expected Sections",
        "- Relevant Facts",
        "- Relevant Decisions",
        "- Relevant Preferences",
        "- Recommended Working Style",
        "- Source References",
        "",
        "## Output Preference",
        f"- {TARGET_STYLE_LINES[target]}",
        "",
    ]
    return "\n".join(lines)


def doctor_report() -> str:
    ensure_environment()
    lines = ["# kb-ai doctor", ""]
    missing_dirs = [str(path.relative_to(VAULT_PATH)) for path in AI_KB_SUBDIRS if not path.exists()]
    if missing_dirs:
        lines.append("## Missing Directories")
        lines.extend(f"- {item}" for item in missing_dirs)
        lines.append("")
    else:
        lines.extend(["## Directories", "- OK", ""])

    problems: List[str] = []
    for path in iter_ai_kb_markdown():
        frontmatter, _ = parse_markdown(read_text(path))
        required = [
            "id",
            "title",
            "memory_type",
            "entity_type",
            "project",
            "source_refs",
            "tags",
            "updated_at",
            "confidence",
            "visibility",
            "export_targets",
        ]
        for key in required:
            if key not in frontmatter:
                problems.append(f"{path.relative_to(VAULT_PATH)} missing frontmatter: {key}")
        for source_ref in normalize_list(frontmatter.get("source_refs")):
            if source_ref.startswith("/Users/") and not Path(source_ref).exists():
                problems.append(f"{path.relative_to(VAULT_PATH)} missing source ref: {source_ref}")

    lines.append("## Metadata Checks")
    if problems:
        lines.extend(f"- {item}" for item in problems[:50])
    else:
        lines.append("- OK")
    lines.append("")

    if INDEX_DB.exists():
        conn = connect_db()
        try:
            state = conn.execute("SELECT value FROM index_state WHERE key = 'last_built_at'").fetchone()
            indexed_docs = conn.execute("SELECT COUNT(*) FROM docs").fetchone()[0]
            indexed_chunks = conn.execute("SELECT COUNT(*) FROM chunks").fetchone()[0]
            lines.extend(
                [
                    "## Index",
                    f"- last_built_at: {state[0] if state else 'unknown'}",
                    f"- docs: {indexed_docs}",
                    f"- chunks: {indexed_chunks}",
                    "",
                ]
            )
        finally:
            conn.close()
    else:
        lines.extend(["## Index", "- Missing index database", ""])

    pending = list(MEMORY_CANDIDATES_DIR.glob("*.md"))
    lines.extend(["## Memory Candidates", f"- pending_files: {len(pending)}", ""])
    return "\n".join(lines)
