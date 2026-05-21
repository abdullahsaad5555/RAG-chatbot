import uuid
from datetime import datetime, timezone

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.db import engine, get_db
from app.models import Base, Chat, Message
from app.schemas import ChatRequest, ChatResponse
from app.settings import settings

app = FastAPI()

# CORS so frontend can call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- 1-user dummy identity, replace with SSO later ----
DUMMY_USER_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")


@app.on_event("startup")
async def startup():
    # Fine for local/dev. For production, use Alembic migrations.
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_chat_or_404(chat_id: uuid.UUID, db: AsyncSession) -> Chat:
    result = await db.execute(
        select(Chat).where(
            Chat.id == chat_id,
            Chat.user_id == DUMMY_USER_ID,
        )
    )

    chat = result.scalars().first()

    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    return chat


@app.get("/chats")
async def list_chats(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Chat)
        .where(Chat.user_id == DUMMY_USER_ID)
        .order_by(Chat.updated_at.desc())
    )

    return result.scalars().all()


@app.post("/chats")
async def create_chat(db: AsyncSession = Depends(get_db)):
    chat = Chat(
        user_id=DUMMY_USER_ID,
        title="New Chat",
    )

    db.add(chat)
    await db.commit()
    await db.refresh(chat)

    return chat


@app.patch("/chats/{chat_id}")
async def update_chat_title(
    chat_id: uuid.UUID,
    payload: dict,
    db: AsyncSession = Depends(get_db),
):
    chat = await get_chat_or_404(chat_id, db)

    title = payload.get("title", "").strip()

    if not title:
        raise HTTPException(status_code=400, detail="Title is required")

    chat.title = title[:60]
    chat.updated_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(chat)

    return chat


@app.delete("/chats/{chat_id}")
async def delete_chat(chat_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    chat = await get_chat_or_404(chat_id, db)

    # Delete messages first, in case your FK does not cascade.
    await db.execute(delete(Message).where(Message.chat_id == chat_id))

    await db.delete(chat)
    await db.commit()

    return {"ok": True}


@app.get("/chats/{chat_id}/messages")
async def get_messages(chat_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    # Make sure chat belongs to dummy user
    await get_chat_or_404(chat_id, db)

    result = await db.execute(
        select(Message)
        .where(Message.chat_id == chat_id)
        .order_by(Message.created_at.asc())
    )

    return result.scalars().all()


@app.post("/chat", response_model=ChatResponse)
async def chat(
    req: ChatRequest,
    chat_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    chat = await get_chat_or_404(chat_id, db)

    clean_message = req.message.strip()

    if not clean_message:
        raise HTTPException(status_code=400, detail="Message is required")

    # 1. Store user message in the selected chat
    user_msg = Message(
        chat_id=chat.id,
        role="user",
        content=clean_message,
    )
    db.add(user_msg)

    # 2. If this is still a new chat, use first user message as title
    if not chat.title or chat.title == "New Chat":
        chat.title = clean_message[:60]

    # 3. Static bot reply for now
    reply_text = "The bot has replied. Please ask another question"

    # 4. Store bot message in same selected chat
    bot_msg = Message(
        chat_id=chat.id,
        role="bot",
        content=reply_text,
    )
    db.add(bot_msg)

    # 5. Update chat timestamp
    chat.updated_at = datetime.now(timezone.utc)

    # 6. Commit messages + title update
    await db.commit()

    return ChatResponse(reply=reply_text)
