from pydantic import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # -------------------------
    # App
    # -------------------------
    APP_NAME: str = "RAG Chatbot"
    ENV: str = "dev"  # dev | prod

    # -------------------------
    # Paths
    # -------------------------
    DATA_DIR: str = "data/docs"
    VECTOR_DB_DIR: str = "vectordb"

    # -------------------------
    # Vector DB
    # -------------------------
    VECTOR_COLLECTION: str = "knowledge"

    # -------------------------
    # Embeddings
    # -------------------------
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    # -------------------------
    # Retrieval
    # -------------------------
    TOP_K: int = 3

    # -------------------------
    # LLM (example)
    # -------------------------
    LLM_PROVIDER: str = "openai"  # openai | ollama | azure
    OPENAI_MODEL: str = "gpt-4o-mini"
    OPENAI_API_KEY: str | None = None

    # -------------------------
    # Security
    # -------------------------
    INGEST_API_KEY: str | None = None  # protect /ingest

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    """
    Cached settings instance
    Safe to import everywhere
    """
    return Settings()