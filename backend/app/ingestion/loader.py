from pathlib import Path

from docx import Document
from pypdf import PdfReader


SUPPORTED_EXTENSIONS = {
    ".pdf",
    ".docx",
    ".txt",
    ".md",
}


def load_pdf(file_path: Path) -> list[dict]:
    """
    Extract text from a PDF page by page.
    """

    reader = PdfReader(str(file_path))

    records = []

    for page_number, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""

        if not text.strip():
            continue

        records.append(
            {
                "text": text.strip(),
                "source": file_path.name,
                "page": page_number,
            }
        )

    return records


def load_docx(file_path: Path) -> list[dict]:
    """
    Extract text from a DOCX file.
    """

    document = Document(str(file_path))

    paragraphs = [
        paragraph.text.strip()
        for paragraph in document.paragraphs
        if paragraph.text.strip()
    ]

    text = "\n\n".join(paragraphs)

    if not text:
        return []

    return [
        {
            "text": text,
            "source": file_path.name,
            "page": 1,
        }
    ]


def load_text_file(file_path: Path) -> list[dict]:
    """
    Extract text from TXT or Markdown files.
    """

    text = file_path.read_text(
        encoding="utf-8",
        errors="ignore",
    ).strip()

    if not text:
        return []

    return [
        {
            "text": text,
            "source": file_path.name,
            "page": 1,
        }
    ]


def load_file(file_path: Path) -> list[dict]:
    """
    Select the correct loader based on file extension.
    """

    extension = file_path.suffix.lower()

    if extension == ".pdf":
        return load_pdf(file_path)

    if extension == ".docx":
        return load_docx(file_path)

    if extension in {".txt", ".md"}:
        return load_text_file(file_path)

    return []


def load_folder(folder_path: str | Path) -> list[dict]:
    """
    Recursively load all supported documents from a folder.
    """

    folder = Path(folder_path).expanduser().resolve()

    if not folder.exists():
        raise FileNotFoundError(
            f"Document folder does not exist: {folder}"
        )

    if not folder.is_dir():
        raise NotADirectoryError(
            f"Document path is not a directory: {folder}"
        )

    records = []

    for file_path in sorted(folder.rglob("*")):
        if not file_path.is_file():
            continue

        if file_path.suffix.lower() not in SUPPORTED_EXTENSIONS:
            continue

        try:
            file_records = load_file(file_path)
            records.extend(file_records)

            print(
                f"Loaded {file_path.name}: "
                f"{len(file_records)} section(s)"
            )

        except Exception as exc:
            print(
                f"Failed to load {file_path.name}: {exc}"
            )

    return records