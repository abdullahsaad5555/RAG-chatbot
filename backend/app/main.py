import asyncio

from app.ingestion.pipeline import rebuild_index
from app.ingestion.watcher import start_watcher
from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.settings import settings
from app.db import engine
from app.models import Base
from app.routers import chat, chats

logger = logging.getLogger(__name__)

# Normalize allowed origins (remove trailing slash if present)
ALLOWED_ORIGINS = [
    origin.rstrip("/")
    for origin in getattr(settings, "allowed_origins_list", [])
    if origin and origin.strip()
]

# Only enable this for local/dev if you explicitly want startup table creation.
# In production, prefer Alembic migrations.
CREATE_TABLES_ON_START = bool(getattr(settings, "create_tables_on_start", False))


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting FastAPI app...")
    logger.info("Allowed CORS origins: %s", ALLOWED_ORIGINS)

    if CREATE_TABLES_ON_START:
        logger.warning(
            "CREATE_TABLES_ON_START is enabled. "
            "This is okay for local/dev, but use Alembic migrations in production."
        )
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    observer = start_watcher()                                  

    asyncio.get_running_loop().run_in_executor(None, rebuild_index) 

    yield

    observer.stop()                                            
    logger.info("Shutting down FastAPI app...")



app = FastAPI(
    title="RAG Chatbot API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS so frontend can call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,   # set True only if you use cookies/session auth cross-origin
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "RAG Chatbot backend is running",
        "docs": "/docs",
        "health": "/health",
        "health_db": "/health/db",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/health/db")
async def health_db():
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        logger.exception("Database health check failed")
        return {"status": "error", "database": "disconnected", "detail": str(e)}


app.include_router(chats.router)
app.include_router(chat.router)