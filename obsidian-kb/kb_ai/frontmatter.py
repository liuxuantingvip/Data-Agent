import re
from typing import Dict, List, Tuple


FRONTMATTER_RE = re.compile(r"\A---\n(.*?)\n---\n?", re.DOTALL)


def parse_markdown(text: str) -> Tuple[Dict[str, object], str]:
    match = FRONTMATTER_RE.match(text)
    if not match:
        return {}, text
    frontmatter = parse_yaml_like(match.group(1))
    body = text[match.end() :]
    return frontmatter, body


def parse_yaml_like(text: str) -> Dict[str, object]:
    data: Dict[str, object] = {}
    current_key = None
    list_mode = False
    block_mode = False
    block_lines: List[str] = []

    for raw_line in text.splitlines():
        line = raw_line.rstrip()
        if not line:
            if block_mode:
                block_lines.append("")
            continue

        if block_mode:
            if raw_line.startswith(" ") or raw_line.startswith("\t"):
                block_lines.append(line.strip())
                continue
            data[current_key] = "\n".join(block_lines).strip()
            current_key = None
            block_mode = False
            block_lines = []

        if list_mode:
            if raw_line.startswith("  - ") or raw_line.startswith("- "):
                item = raw_line.split("- ", 1)[1].strip().strip('"').strip("'")
                data.setdefault(current_key, [])
                assert isinstance(data[current_key], list)
                data[current_key].append(item)
                continue
            list_mode = False
            current_key = None

        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        key = key.strip()
        value = value.strip()
        if value in {"|-", "|", ">-"}:
            current_key = key
            block_mode = True
            block_lines = []
            continue
        if value == "":
            current_key = key
            data[key] = []
            list_mode = True
            continue
        data[key] = _coerce_scalar(value)
    if block_mode and current_key:
        data[current_key] = "\n".join(block_lines).strip()
    return data


def dump_markdown(frontmatter: Dict[str, object], body: str) -> str:
    lines = ["---"]
    for key, value in frontmatter.items():
        if isinstance(value, list):
            lines.append(f"{key}:")
            for item in value:
                lines.append(f"  - {item}")
        else:
            scalar = str(value)
            if "\n" in scalar:
                lines.append(f"{key}: |-")
                for part in scalar.splitlines():
                    lines.append(f"  {part}")
            else:
                lines.append(f"{key}: {scalar}")
    lines.append("---")
    lines.append(body.rstrip())
    lines.append("")
    return "\n".join(lines)


def _coerce_scalar(value: str):
    value = value.strip().strip('"').strip("'")
    if value.lower() in {"true", "false"}:
        return value.lower() == "true"
    return value
