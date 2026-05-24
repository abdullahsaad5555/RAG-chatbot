from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from settings import settings
from db import engine
from models import Base
from routers import chat, chats

app = FastAPI()

## CORS so frontend can call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    # Fine for local/dev. For production, use Alembic migrations.
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


app.include_router(chats.router)
app.include_router(chat.router)