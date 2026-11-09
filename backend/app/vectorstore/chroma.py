from pathlib import Path

import chromadb

from app.ingestion.embedder import embed_query, embed_texts


# Vector database lives in backend/vectordb
BACKEND_DIR = Path(__file__).resolve().parents[2]
VECTOR_DB_DIR = BACKEND_DIR / "vectordb"
COLLECTION_NAME = "yasref_docs"

_client = None


def get_client():
    """Create the persistent Chroma client once."""
    global _client

    if _client is None:
        VECTOR_DB_DIR.mkdir(parents=True, exist_ok=True)
        _client = chromadb.PersistentClient(path=str(VECTOR_DB_DIR))

    return _client


def get_collection():
    """Get or create the document collection (cosine similarity)."""
    return get_client().get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )


def reset_collection():
    """Delete all stored vectors. Use when documents or the embedding model change."""
    client = get_client()

    try:
        client.delete_collection(COLLECTION_NAME)
        print("Vector collection deleted")
    except Exception:
        print("No existing collection to delete")


def add_chunks(chunks, batch_size=64):
    """Embed chunk records and store them. Re-running updates existing chunks."""
    if not chunks:
        print("No chunks to add")
        return 0

    collection = get_collection()

    for start in range(0, len(chunks), batch_size):
        batch = chunks[start:start + batch_size]

        texts = [c["text"] for c in batch]
        ids = [
            f"{c['source']}::p{c['page']}::c{c['chunk_index']}"
            for c in batch
        ]
        metadatas = [
            {
                "source": str(c["source"]),
                "page": int(c["page"]),
                "chunk_index": int(c["chunk_index"]),
            }
            for c in batch
        ]

        collection.upsert(
            ids=ids,
            documents=texts,
            embeddings=embed_texts(texts),
            metadatas=metadatas,
        )

        print(f"Stored {min(start + batch_size, len(chunks))}/{len(chunks)} chunks")

    return collection.count()


def search(query, top_k=4):
    """Return the chunks most similar to the question, with a similarity score."""
    collection = get_collection()
    total = collection.count()

    if total == 0:
        return []

    results = collection.query(
        query_embeddings=[embed_query(query)],
        n_results=min(top_k, total),
    )

    matches = []

    for text, meta, distance in zip(
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0],
    ):
        matches.append(
            {
                "text": text,
                "source": meta.get("source", "unknown"),
                "page": meta.get("page", 1),
                "score": round(1 - distance, 3),  # 1.0 = identical, 0 = unrelated
            }
        )

    return matches