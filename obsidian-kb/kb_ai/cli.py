import argparse
from pathlib import Path

from .core import (
    SUPPORTED_TARGETS,
    approve_candidate,
    collect_session_source,
    context_output,
    doctor_report,
    export_bundle,
    ingest_notes,
    ingest_skills,
    import_session,
    render_codex_recent_sessions,
    list_candidates,
    rebuild_index,
    recall_output,
    search_output,
    session_summarize,
)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="kb-ai", description="Personal AI knowledge base CLI for Obsidian.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    ingest_parser = subparsers.add_parser("ingest", help="Ingest source content into AI-KB.")
    ingest_subparsers = ingest_parser.add_subparsers(dest="ingest_command", required=True)

    ingest_skills_parser = ingest_subparsers.add_parser("skills", help="Ingest skill directories.")
    ingest_skills_parser.add_argument("--from", dest="source", required=True)

    ingest_notes_parser = ingest_subparsers.add_parser("notes", help="Ingest notes or folders.")
    ingest_notes_parser.add_argument("--from", dest="source", required=True)

    index_parser = subparsers.add_parser("index", help="Index operations.")
    index_subparsers = index_parser.add_subparsers(dest="index_command", required=True)
    index_subparsers.add_parser("build", help="Rebuild the local search index.")

    search_parser = subparsers.add_parser("search", help="Search indexed content.")
    search_parser.add_argument("query")
    search_parser.add_argument("--limit", type=int, default=8)

    recall_parser = subparsers.add_parser("recall", help="Recall content by memory type.")
    recall_parser.add_argument("query")
    recall_parser.add_argument("--memory", default="all", choices=["facts", "decisions", "preferences", "all"])
    recall_parser.add_argument("--limit", type=int, default=8)

    context_parser = subparsers.add_parser("context", help="Build an AI-ready context packet.")
    context_parser.add_argument("query")
    context_parser.add_argument("--target", default="generic", choices=SUPPORTED_TARGETS)
    context_parser.add_argument("--limit", type=int, default=10)

    session_parser = subparsers.add_parser("session", help="Session memory workflow.")
    session_subparsers = session_parser.add_subparsers(dest="session_command", required=True)
    recent_parser = session_subparsers.add_parser("recent", help="List recent Codex sessions from local index.")
    recent_parser.add_argument("--limit", type=int, default=10)
    collect_parser = session_subparsers.add_parser("collect", help="Collect a session from stdin, clipboard, local file, or adapter source.")
    collect_parser.add_argument("--source-type", required=True, choices=["file", "stdin", "clipboard", "codex-session-index", "qclaw-memory"])
    collect_parser.add_argument("--value")
    collect_parser.add_argument("--tool", required=True, choices=SUPPORTED_TARGETS)
    collect_parser.add_argument("--project", default="shared")
    collect_parser.add_argument("--title")
    import_parser = session_subparsers.add_parser("import", help="Import a raw conversation into AI-KB sessions and create a candidate summary.")
    import_parser.add_argument("--from", dest="source", required=True)
    import_parser.add_argument("--tool", required=True, choices=SUPPORTED_TARGETS)
    import_parser.add_argument("--project", default="shared")
    import_parser.add_argument("--title")
    summarize_parser = session_subparsers.add_parser("summarize", help="Create a candidate memory summary from a transcript.")
    summarize_parser.add_argument("--from", dest="source", required=True)

    memory_parser = subparsers.add_parser("memory", help="Memory candidate workflow.")
    memory_subparsers = memory_parser.add_subparsers(dest="memory_command", required=True)
    memory_subparsers.add_parser("candidates", help="List pending candidates.")
    approve_parser = memory_subparsers.add_parser("approve", help="Approve a candidate into durable memory cards.")
    approve_parser.add_argument("id")

    export_parser = subparsers.add_parser("export", help="Export AI-KB bundles.")
    export_parser.add_argument("--target", default="generic", choices=SUPPORTED_TARGETS)

    subparsers.add_parser("doctor", help="Validate metadata, index state, and candidate state.")
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    if args.command == "ingest":
        if args.ingest_command == "skills":
            result = ingest_skills(Path(args.source))
            print(f"ingested_skills={result['skills']}")
            print(f"generated_cards={result['cards']}")
            return 0
        if args.ingest_command == "notes":
            result = ingest_notes(args.source)
            print(f"ingested_notes={result['notes']}")
            print(f"generated_cards={result['cards']}")
            return 0

    if args.command == "index" and args.index_command == "build":
        result = rebuild_index()
        print(f"indexed_docs={result['docs']}")
        print(f"indexed_chunks={result['chunks']}")
        return 0

    if args.command == "search":
        print(search_output(args.query, limit=args.limit))
        return 0

    if args.command == "recall":
        print(recall_output(args.query, memory=args.memory, limit=args.limit))
        return 0

    if args.command == "context":
        print(context_output(args.query, target=args.target, limit=args.limit))
        return 0

    if args.command == "session" and args.session_command == "summarize":
        result = session_summarize(args.source)
        print(f"candidate_id={result['id']}")
        print(f"path={result['path']}")
        return 0
    if args.command == "session" and args.session_command == "recent":
        print(render_codex_recent_sessions(limit=args.limit))
        return 0
    if args.command == "session" and args.session_command == "collect":
        result = collect_session_source(
            source_type=args.source_type,
            value=args.value,
            tool=args.tool,
            project=args.project,
            title=args.title,
        )
        print(f"session_id={result['session_id']}")
        print(f"session_path={result['session_path']}")
        print(f"candidate_id={result['candidate_id']}")
        print(f"candidate_path={result['candidate_path']}")
        return 0
    if args.command == "session" and args.session_command == "import":
        result = import_session(source=args.source, tool=args.tool, project=args.project, title=args.title)
        print(f"session_id={result['session_id']}")
        print(f"session_path={result['session_path']}")
        print(f"candidate_id={result['candidate_id']}")
        print(f"candidate_path={result['candidate_path']}")
        return 0

    if args.command == "memory":
        if args.memory_command == "candidates":
            print(list_candidates())
            return 0
        if args.memory_command == "approve":
            result = approve_candidate(args.id)
            print(f"created_cards={result['created']}")
            return 0

    if args.command == "export":
        result = export_bundle(args.target)
        print(f"target={result['target']}")
        print(f"output_dir={result['output_dir']}")
        print(f"count={result['count']}")
        return 0

    if args.command == "doctor":
        print(doctor_report())
        return 0

    parser.error("Unhandled command")
    return 1
