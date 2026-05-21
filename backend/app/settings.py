from pydantic import BaseModel
import os

class Settings(BaseModel):
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:[PostGreWipro]@db.isfczdennzuqxqlngtfz.supabase.co:5432/postgres"
    ALLOWED_ORIGINS: list[str] = ["http://localhost:5173","http://127.0.0.1:5173"]  # Vite dev origin

settings = Settings()