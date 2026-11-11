import threading
from pathlib import Path

from app.ingestion.chunker import chunk_records
from app.ingestion.converter import convert_folder
from app.ingestion.loader import load_folder
from app.vectorstore.chroma import add_chunks, reset_collection


BACKEND_DIR = Path(__file__).resolve().parents[2]
RAW_DIR = BACKEND_DIR / "data" / "raw"
DOCS_DIR = BACKEND_DIR / "data" / "docs"

_lock = threading.Lock()


def rebuild_index():
    """Convert all raw files, wipe the vectors, and rebuild from scratch."""
    with _lock:
        print("Rebuilding document index...")

        converted = convert_folder(RAW_DIR, DOCS_DIR)
        reset_collection()

        records = load_folder(DOCS_DIR)
        chunks = chunk_records(records, chunk_size=800, overlap=150)
        total = add_chunks(chunks)

        print(f"Index ready: {converted} file(s), {total} chunks")
        return total