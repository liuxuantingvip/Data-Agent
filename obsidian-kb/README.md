# Obsidian KB

Local knowledge tooling for the Obsidian vault `森林公园`.

## Files

- `obs-kb`: shell wrapper for official Obsidian CLI CRUD and search operations
- `kb-ai`: personal AI knowledge-base CLI for ingest, indexing, recall, context packing, and memory approval
- `kb_ai/`: Python implementation of the `kb-ai` workflow
- `bin/`: convenience wrappers for `codex`, `claude`, `opencode`, `qclaw`, `arkclaw`, `openclaw`
- `integrations/`: integration contract for transcript import and shared memory usage

## Vault Assumptions

- Obsidian vault path: `/Users/sensen/Documents/Obsidian/森林公园`
- AI knowledge root inside the vault: `AI-KB/`
- Local index/export data: `/Users/sensen/Desktop/codex/obsidian-kb/data/`

## `obs-kb` Usage

```bash
/Users/sensen/Desktop/codex/obsidian-kb/obs-kb help
/Users/sensen/Desktop/codex/obsidian-kb/obs-kb files
/Users/sensen/Desktop/codex/obsidian-kb/obs-kb read "欢迎.md"
/Users/sensen/Desktop/codex/obsidian-kb/obs-kb search "关键词"
/Users/sensen/Desktop/codex/obsidian-kb/obs-kb create "Inbox/Test.md" "hello"
/Users/sensen/Desktop/codex/obsidian-kb/obs-kb append "Inbox/Test.md" "more"
```

## `kb-ai` Usage

```bash
/Users/sensen/Desktop/codex/obsidian-kb/kb-ai ingest skills --from /Users/sensen/Desktop/codex/Product-Manager-Skills/skills
/Users/sensen/Desktop/codex/obsidian-kb/kb-ai ingest notes --from 个人知识库
/Users/sensen/Desktop/codex/obsidian-kb/kb-ai ingest notes --from 工作
/Users/sensen/Desktop/codex/obsidian-kb/kb-ai index build
/Users/sensen/Desktop/codex/obsidian-kb/kb-ai search "PRD"
/Users/sensen/Desktop/codex/obsidian-kb/kb-ai recall "用户故事" --memory all
/Users/sensen/Desktop/codex/obsidian-kb/kb-ai context "PRD 模板" --target codex
/Users/sensen/Desktop/codex/obsidian-kb/kb-ai context "项目决策" --target qclaw
/Users/sensen/Desktop/codex/obsidian-kb/kb-ai session import --tool codex --from /path/to/transcript.md --project ai-kb
/Users/sensen/Desktop/codex/obsidian-kb/kb-ai session collect --source-type clipboard --tool codex --project ai-kb
/Users/sensen/Desktop/codex/obsidian-kb/kb-ai session collect --source-type qclaw-memory --tool qclaw --project shared
/Users/sensen/Desktop/codex/obsidian-kb/kb-ai session recent --limit 10
/Users/sensen/Desktop/codex/obsidian-kb/kb-ai session summarize --from /path/to/transcript.md
/Users/sensen/Desktop/codex/obsidian-kb/kb-ai memory candidates
/Users/sensen/Desktop/codex/obsidian-kb/kb-ai memory approve <candidate-id>
/Users/sensen/Desktop/codex/obsidian-kb/kb-ai export --target generic
/Users/sensen/Desktop/codex/obsidian-kb/kb-ai export --target openclaw
/Users/sensen/Desktop/codex/obsidian-kb/kb-ai doctor
```

Convenience wrappers:

```bash
/Users/sensen/Desktop/codex/obsidian-kb/bin/kb-codex "PRD 模板"
/Users/sensen/Desktop/codex/obsidian-kb/bin/kb-qclaw "项目决策"
/Users/sensen/Desktop/codex/obsidian-kb/bin/kb-session-import codex /path/to/transcript.md ai-kb
/Users/sensen/Desktop/codex/obsidian-kb/bin/kb-session-clipboard codex ai-kb
/Users/sensen/Desktop/codex/obsidian-kb/bin/kb-codex-recent
```

## Notes

- `kb-ai` treats Obsidian as the source of truth.
- Search uses SQLite FTS5 plus a local hash-embedding similarity layer.
- Candidate memories are written to `AI-KB/Memory-Candidates/` and must be approved before becoming durable cards.
- Session capture now supports `file`, `stdin`, `clipboard`, `codex-session-index`, and `qclaw-memory`.
- Supported context/export targets: `codex`, `claude`, `opencode`, `qclaw`, `arkclaw`, `openclaw`, `generic`.
- Each export bundle now includes `MEMORY.md`, `CONTEXT.md`, and `manifest.json`.
- If you need a raw Obsidian command not wrapped here, use `obs-kb raw ...`.
