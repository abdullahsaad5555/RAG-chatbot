from app.core.logging import setup_logging, get_logger

setup_logging()
logger = get_logger(__name__)

logger.info("Starting ingestion")

"""
One-time ingestion script
Run manually when documents change.

Usage:
    python scripts/ingest_once.py
"""

from pathlib import Path
import hashlib

from sentence_transformers import SentenceTransformer
from chromadb import Client
from chromadb.config import Settings


# ---------------------------
# CONFIG
# ---------------------------
DOCS_PATH = Path("data/docs")
VECTOR_DB_PATH = "vectordb"
COLLECTION_NAME = "knowledge"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"
CHUNK_SIZE = 500
OVERLAP = 50


# ---------------------------
# UTILS
# ---------------------------
def file_hash(text: str) -> str:
    """Used to prevent re-ingesting identical documents"""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def chunk_text(text: str) -> list[str]:
    words = text.split()
    chunks = []

    for i in range(0, len(words), CHUNK_SIZE - OVERLAP):
        chunk = " ".join(words[i:i + CHUNK_SIZE])
        chunks.append(chunk)

    return chunks


# ---------------------------
# MAIN INGESTION LOGIC
# ---------------------------
def main():
    print("🔹 Starting ingestion")

    # Load embedding model
    model = SentenceTransformer(EMBEDDING_MODEL)

    # Init vector DB
    client = Client(
        Settings(
            persist_directory=VECTOR_DB_PATH,
            anonymized_telemetry=False
        )
    )

    collection = client.get_or_create_collection(
        name=COLLECTION_NAME
    )

    # Safety check — prevents accidental re-ingestion
    if collection.count() > 0:
        print("✅ Vector DB already populated. Skipping ingestion.")
        return

    all_chunks = []
    metadatas = []
    ids = []

    print("📄 Loading documents...")
    for file in DOCS_PATH.glob("*.txt"):
        text = file.read_text(encoding="utf-8")
        chunks = chunk_text(text)

        for idx, chunk in enumerate(chunks):
            chunk_id = f"{file.stem}_{idx}"
            all_chunks.append(chunk)
            metadatas.append({
                "source": file.name,
                "hash": file_hash(chunk)
            })
            ids.append(chunk_id)

    if not all_chunks:
        print("⚠️ No documents found. Exiting.")
        return

    print(f"🧠 Embedding {len(all_chunks)} chunks...")
    embeddings = model.encode(
        all_chunks,
        show_progress_bar=True
    ).tolist()

    print("📦 Storing vectors...")
    collection.add(
        documents=all_chunks,
        embeddings=embeddings,
        metadatas=metadatas,
        ids=ids
    )


    print("✅ Ingestion completed successfully")
    print(f"📊 Total vectors stored: {collection.count()}")


if __name__ == "__main__":
    main()