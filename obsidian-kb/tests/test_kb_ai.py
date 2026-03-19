import tempfile
import unittest
from pathlib import Path
from unittest import mock

from kb_ai import config, core


class KBAITest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.vault = self.root / "vault"
        self.vault.mkdir()
        self.data = self.root / "data"
        self.export_dir = self.root / "exports"

        patches = [
            mock.patch.object(config, "VAULT_PATH", self.vault),
            mock.patch.object(config, "AI_KB_DIR", self.vault / "AI-KB"),
            mock.patch.object(config, "SKILLS_DIR", self.vault / "AI-KB" / "Skills"),
            mock.patch.object(config, "PROJECTS_DIR", self.vault / "AI-KB" / "Projects"),
            mock.patch.object(config, "DECISIONS_DIR", self.vault / "AI-KB" / "Decisions"),
            mock.patch.object(config, "PREFERENCES_DIR", self.vault / "AI-KB" / "Preferences"),
            mock.patch.object(config, "ARTIFACTS_DIR", self.vault / "AI-KB" / "Artifacts"),
            mock.patch.object(config, "SOURCES_DIR", self.vault / "AI-KB" / "Sources"),
            mock.patch.object(config, "SESSIONS_DIR", self.vault / "AI-KB" / "Sessions"),
            mock.patch.object(config, "MEMORY_CANDIDATES_DIR", self.vault / "AI-KB" / "Memory-Candidates"),
            mock.patch.object(config, "EXPORT_NOTES_DIR", self.vault / "AI-KB" / "Exports"),
            mock.patch.object(config, "AI_KB_SUBDIRS", [
                self.vault / "AI-KB" / "Skills",
                self.vault / "AI-KB" / "Projects",
                self.vault / "AI-KB" / "Decisions",
                self.vault / "AI-KB" / "Preferences",
                self.vault / "AI-KB" / "Artifacts",
                self.vault / "AI-KB" / "Sources",
                self.vault / "AI-KB" / "Sessions",
                self.vault / "AI-KB" / "Memory-Candidates",
                self.vault / "AI-KB" / "Exports",
            ]),
            mock.patch.object(config, "DATA_DIR", self.data),
            mock.patch.object(config, "INDEX_DB", self.data / "kb_ai.sqlite3"),
            mock.patch.object(config, "EXPORT_DIR", self.export_dir),
            mock.patch.object(core, "VAULT_PATH", self.vault),
            mock.patch.object(core, "AI_KB_DIR", self.vault / "AI-KB"),
            mock.patch.object(core, "SKILLS_DIR", self.vault / "AI-KB" / "Skills"),
            mock.patch.object(core, "PROJECTS_DIR", self.vault / "AI-KB" / "Projects"),
            mock.patch.object(core, "DECISIONS_DIR", self.vault / "AI-KB" / "Decisions"),
            mock.patch.object(core, "PREFERENCES_DIR", self.vault / "AI-KB" / "Preferences"),
            mock.patch.object(core, "ARTIFACTS_DIR", self.vault / "AI-KB" / "Artifacts"),
            mock.patch.object(core, "SOURCES_DIR", self.vault / "AI-KB" / "Sources"),
            mock.patch.object(core, "SESSIONS_DIR", self.vault / "AI-KB" / "Sessions"),
            mock.patch.object(core, "MEMORY_CANDIDATES_DIR", self.vault / "AI-KB" / "Memory-Candidates"),
            mock.patch.object(core, "EXPORT_NOTES_DIR", self.vault / "AI-KB" / "Exports"),
            mock.patch.object(core, "AI_KB_SUBDIRS", [
                self.vault / "AI-KB" / "Skills",
                self.vault / "AI-KB" / "Projects",
                self.vault / "AI-KB" / "Decisions",
                self.vault / "AI-KB" / "Preferences",
                self.vault / "AI-KB" / "Artifacts",
                self.vault / "AI-KB" / "Sources",
                self.vault / "AI-KB" / "Sessions",
                self.vault / "AI-KB" / "Memory-Candidates",
                self.vault / "AI-KB" / "Exports",
            ]),
            mock.patch.object(core, "DATA_DIR", self.data),
            mock.patch.object(core, "INDEX_DB", self.data / "kb_ai.sqlite3"),
            mock.patch.object(core, "EXPORT_DIR", self.export_dir),
        ]
        self.patchers = patches
        for patcher in self.patchers:
            patcher.start()

    def tearDown(self):
        for patcher in reversed(self.patchers):
            patcher.stop()
        self.tmp.cleanup()

    def test_ingest_skills_and_search(self):
        skills_dir = self.root / "skills"
        (skills_dir / "prd-development").mkdir(parents=True)
        (skills_dir / "prd-development" / "SKILL.md").write_text(
            """---
name: prd-development
description: Build a PRD
---
# Ignore

## Purpose
Write a PRD with problem and users.

## Application
Use it during engineering handoff.
""",
            encoding="utf-8",
        )
        result = core.ingest_skills(skills_dir)
        self.assertEqual(result["skills"], 1)
        core.rebuild_index()
        results = core.query_chunks("PRD")
        self.assertTrue(results)
        self.assertTrue(any("prd-development" in item.title for item in results))

    def test_ingest_notes_and_memory_approval(self):
        prefs_dir = self.vault / "个人知识库"
        prefs_dir.mkdir()
        (prefs_dir / "产品心法.md").write_text(
            """# 原则

效率优先于易用性。
""",
            encoding="utf-8",
        )
        result = core.ingest_notes("个人知识库")
        self.assertEqual(result["notes"], 1)

        transcript = self.root / "session.txt"
        transcript.write_text(
            "项目A 需要统一 PRD 模板\n我们决定先做 CLI\n我偏好简洁输出\n",
            encoding="utf-8",
        )
        summary = core.session_summarize(str(transcript))
        approve = core.approve_candidate(summary["id"])
        self.assertGreaterEqual(approve["created"], 1)

    def test_doctor_and_index_state(self):
        skills_dir = self.root / "skills"
        (skills_dir / "company-research").mkdir(parents=True)
        (skills_dir / "company-research" / "SKILL.md").write_text(
            """---
name: company-research
description: Research companies
---
## Purpose
Research executive strategy.
""",
            encoding="utf-8",
        )
        core.ingest_skills(skills_dir)
        core.rebuild_index()
        report = core.doctor_report()
        self.assertIn("## Index", report)

    def test_context_and_export_targets(self):
        skills_dir = self.root / "skills"
        (skills_dir / "roadmap-planning").mkdir(parents=True)
        (skills_dir / "roadmap-planning" / "SKILL.md").write_text(
            """---
name: roadmap-planning
description: Plan the roadmap
---
## Purpose
Plan roadmap outcomes and decision checkpoints.
""",
            encoding="utf-8",
        )
        core.ingest_skills(skills_dir)
        core.rebuild_index()
        context = core.context_output("roadmap", "qclaw", limit=5)
        self.assertIn("## System Hint", context)
        self.assertIn("qclaw", context)
        exported = core.export_bundle("openclaw")
        self.assertEqual(exported["target"], "openclaw")
        self.assertTrue((self.export_dir / "openclaw" / "MEMORY.md").exists())

    def test_session_import_creates_session_and_candidate(self):
        transcript = self.root / "codex-session.md"
        transcript.write_text(
            """user: 我们决定先把知识库做成 Obsidian 主库
assistant: 建议先做 CLI 和 RAG
user: 我偏好先沉淀项目决策
""",
            encoding="utf-8",
        )
        result = core.import_session(source=str(transcript), tool="codex", project="ai-kb")
        self.assertIn("session_id", result)
        self.assertTrue((self.vault / result["session_path"]).exists())
        self.assertTrue((self.vault / result["candidate_path"]).exists())

    def test_collect_session_from_file_and_render_recent_sessions(self):
        transcript = self.root / "claude-session.md"
        transcript.write_text("user: 需要沉淀项目上下文\nassistant: 先写入候选记忆\n", encoding="utf-8")
        result = core.collect_session_source(
            source_type="file",
            value=str(transcript),
            tool="claude",
            project="shared",
            title="Claude 文件会话",
        )
        self.assertTrue((self.vault / result["session_path"]).exists())

        session_index = self.root / "session_index.jsonl"
        session_index.write_text(
            '{"id":"abc","thread_name":"最近会话","updated_at":"2026-03-19T10:00:00Z"}\n',
            encoding="utf-8",
        )
        rendered = core.render_codex_recent_sessions(limit=5, index_path=session_index)
        self.assertIn("最近会话", rendered)


if __name__ == "__main__":
    unittest.main()
