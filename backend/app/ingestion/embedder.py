from functools import lru_cache

from sentence_transformers import SentenceTransformer


# Lightweight embedding model.
# Qwen generates answers.
# This model converts document chunks and questions into vectors.
EMBEDDING_MODEL = "all-MiniLM-L6-v2"


@lru_cache(maxsize=1)
def get_embedding_model():
    """Load the embedding model once and reuse it."""
    print(f"Loading embedding model: {EMBEDDING_MODEL}")

    model = SentenceTransformer(
        EMBEDDING_MODEL,
        device="cpu",
    )

    print("Embedding model loaded")
    return model


def embed_texts(texts):
    """Convert multiple pieces of text into embedding vectors."""
    if not texts:
        return []

    model = get_embedding_model()

    embeddings = model.encode(
        texts,
        normalize_embeddings=True,
        show_progress_bar=False,
    )

    return embeddings.tolist()


def embed_query(query):
    """Convert one user question into an embedding vector."""
    clean_query = query.strip()

    if not clean_query:
        raise ValueError("Query cannot be empty")

    return embed_texts([clean_query])[0]