from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    # Existing database configuration
    DATABASE_URL: str = "sqlite+aiosqlite:///./local.db"

    # Existing frontend access configuration
    ALLOWED_ORIGINS: str = (
        "http://localhost:5173,http://127.0.0.1:5173"
    )

    # Used by main.py for optional local database table creation
    create_tables_on_start: bool = False

    # Local model configuration
    LLM_MODEL_PATH: str = ""
    LLM_MAX_NEW_TOKENS: int = Field(
        default=512,
        ge=1,
        le=4096,
    )

    model_config = SettingsConfigDict(
        env_file=str(BACKEND_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def allowed_origins_list(self) -> list[str]:
        return [
            origin.strip().rstrip("/")
            for origin in self.ALLOWED_ORIGINS.split(",")
            if origin.strip()
        ]


settings = Settings()