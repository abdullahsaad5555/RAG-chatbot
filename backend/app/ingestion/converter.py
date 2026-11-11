from pathlib import Path

from docx import Document
from docx.table import Table
from docx.text.paragraph import Paragraph
from pypdf import PdfReader


SUPPORTED = {".pdf", ".docx", ".txt", ".md"}


def _table_to_md(table):
    rows = [
        [cell.text.strip().replace("\n", " ").replace("|", "/") for cell in row.cells]
        for row in table.rows
    ]
    if not rows:
        return ""

    width = max(len(r) for r in rows)
    rows = [r + [""] * (width - len(r)) for r in rows]

    lines = ["| " + " | ".join(rows[0]) + " |"]
    lines.append("| " + " | ".join(["---"] * width) + " |")
    lines += ["| " + " | ".join(r) + " |" for r in rows[1:]]
    return "\n".join(lines)


def docx_to_md(path):
    doc = Document(str(path))
    parts = []

    # Walk paragraphs and tables in document order
    for child in doc.element.body.iterchildren():
        tag = child.tag.split("}")[-1]

        if tag == "p":
            para = Paragraph(child, doc)
            text = para.text.strip()
            if not text:
                continue

            style = para.style.name.lower() if para.style is not None else ""

            if style == "title":
                parts.append(f"# {text}")
            elif style.startswith("heading"):
                level = style.replace("heading", "").strip()
                level = int(level) if level.isdigit() else 1
                parts.append("#" * min(level, 6) + f" {text}")
            elif "list" in style:
                parts.append(f"- {text}")
            else:
                parts.append(text)

        elif tag == "tbl":
            table_md = _table_to_md(Table(child, doc))
            if table_md:
                parts.append(table_md)

    return "\n\n".join(parts)


def pdf_to_md(path):
    reader = PdfReader(str(path))
    parts = [f"# {path.stem}"]

    for number, page in enumerate(reader.pages, start=1):
        text = (page.extract_text() or "").strip()
        if text:
            parts.append(f"## Page {number}\n\n{text}")

    return "\n\n".join(parts)


def txt_to_md(path):
    text = path.read_text(encoding="utf-8", errors="ignore").strip()
    return f"# {path.stem}\n\n{text}" if text else ""


def to_markdown(path):
    ext = path.suffix.lower()

    if ext == ".docx":
        return docx_to_md(path)
    if ext == ".pdf":
        return pdf_to_md(path)
    if ext == ".txt":
        return txt_to_md(path)
    if ext == ".md":
        return path.read_text(encoding="utf-8", errors="ignore")
    return ""


def convert_folder(raw_dir, docs_dir):
    """Convert every supported file in raw_dir into docs_dir as .md."""
    raw_dir = Path(raw_dir)
    docs_dir = Path(docs_dir)
    raw_dir.mkdir(parents=True, exist_ok=True)
    docs_dir.mkdir(parents=True, exist_ok=True)

    # Clear old output so deleted source files disappear too
    for old in docs_dir.glob("*.md"):
        old.unlink()

    converted = 0

    for path in sorted(raw_dir.rglob("*")):
        if not path.is_file() or path.suffix.lower() not in SUPPORTED:
            continue
        if path.name.startswith((".", "~$")):
            continue

        try:
            markdown = to_markdown(path).strip()
        except Exception as exc:
            print(f"Could not convert {path.name}: {exc}")
            continue

        if not markdown:
            print(f"Skipped {path.name}: no extractable text")
            continue

        out = docs_dir / f"{path.stem}.md"
        if out.exists():
            # Avoid collisions such as policy.pdf and policy.docx
            out = docs_dir / f"{path.stem}_{path.suffix.lstrip('.')}.md"

        out.write_text(markdown, encoding="utf-8")
        converted += 1
        print(f"Converted {path.name} -> {out.name}")

    return converted