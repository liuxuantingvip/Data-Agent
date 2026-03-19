from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parent.parent
VAULT_PATH = Path("/Users/sensen/Documents/Obsidian/森林公园")
DATA_DIR = ROOT_DIR / "data"
INDEX_DB = DATA_DIR / "kb_ai.sqlite3"
EXPORT_DIR = DATA_DIR / "exports"

AI_KB_DIR = VAULT_PATH / "AI-KB"
SKILLS_DIR = AI_KB_DIR / "Skills"
PROJECTS_DIR = AI_KB_DIR / "Projects"
DECISIONS_DIR = AI_KB_DIR / "Decisions"
PREFERENCES_DIR = AI_KB_DIR / "Preferences"
ARTIFACTS_DIR = AI_KB_DIR / "Artifacts"
SOURCES_DIR = AI_KB_DIR / "Sources"
SESSIONS_DIR = AI_KB_DIR / "Sessions"
MEMORY_CANDIDATES_DIR = AI_KB_DIR / "Memory-Candidates"
EXPORT_NOTES_DIR = AI_KB_DIR / "Exports"

AI_KB_SUBDIRS = [
    SKILLS_DIR,
    PROJECTS_DIR,
    DECISIONS_DIR,
    PREFERENCES_DIR,
    ARTIFACTS_DIR,
    SOURCES_DIR,
    SESSIONS_DIR,
    MEMORY_CANDIDATES_DIR,
    EXPORT_NOTES_DIR,
]
