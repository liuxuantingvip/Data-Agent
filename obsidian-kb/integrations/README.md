# Integrations

This folder defines the integration contract for external AI tools that should share the same memory system.

## Goal

All tools should follow the same two rules:

1. Read working memory through `kb-ai context` or the convenience wrappers in `bin/`.
2. Write session memory by exporting a transcript file or using a source adapter, then importing it into `kb-ai`.

## Read Memory

Examples:

```bash
/Users/sensen/Desktop/codex/obsidian-kb/bin/kb-codex "PRD 模板"
/Users/sensen/Desktop/codex/obsidian-kb/bin/kb-qclaw "项目决策"
/Users/sensen/Desktop/codex/obsidian-kb/bin/kb-openclaw "用户故事"
/Users/sensen/Desktop/codex/obsidian-kb/bin/kb-codex-recent
```

## Write Session Memory

Prepare a plain text or Markdown transcript, then import it:

```bash
/Users/sensen/Desktop/codex/obsidian-kb/bin/kb-session-import codex /path/to/transcript.md ai-kb
/Users/sensen/Desktop/codex/obsidian-kb/bin/kb-session-import qclaw /path/to/transcript.md product-work "Qclaw 会话 2026-03-19"
/Users/sensen/Desktop/codex/obsidian-kb/bin/kb-session-clipboard codex ai-kb "剪贴板会话"
```

Use built-in source adapters when a tool does not expose a nice transcript file:

```bash
/Users/sensen/Desktop/codex/obsidian-kb/kb-ai session collect --source-type stdin --tool codex --project ai-kb < transcript.md
/Users/sensen/Desktop/codex/obsidian-kb/kb-ai session collect --source-type clipboard --tool claude --project shared
/Users/sensen/Desktop/codex/obsidian-kb/kb-ai session collect --source-type codex-session-index --tool codex --project ai-kb
/Users/sensen/Desktop/codex/obsidian-kb/kb-ai session collect --source-type qclaw-memory --tool qclaw --project shared
```

This creates:

- a normalized session note under `AI-KB/Sessions/<tool>/`
- a pending candidate summary under `AI-KB/Memory-Candidates/`

You can then review and approve:

```bash
/Users/sensen/Desktop/codex/obsidian-kb/kb-ai memory candidates
/Users/sensen/Desktop/codex/obsidian-kb/kb-ai memory approve <candidate-id>
```

## Transcript Format

The importer accepts loose plaintext or Markdown. It strips common prefixes such as:

- `user:`
- `assistant:`
- `system:`
- bullet markers
- numbered list markers

Best practice:

- keep one utterance per line
- include the project name in the import command
- export transcripts at the end of a meaningful session, not every tiny interaction
- `codex-session-index` is metadata-only and should be treated as fallback when you do not have a transcript
