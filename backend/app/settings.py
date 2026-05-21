from pydantic import BaseModel
import os

class Settings(BaseModel):
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://postgres:scram-sha-256@localhost:5432/yasrefai"
    )
    ALLOWED_ORIGINS: list[str] = ["http://localhost:5173","http://127.0.0.1:5173"]  # Vite dev origin

settings = Settings()