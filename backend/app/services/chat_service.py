import uuid
from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.constants import DUMMY_USER_ID
from app.dependencies import get_chat_or_404
from app.models import Chat, Message


async def list_user_chats(db: AsyncSession):
    result = await db.execute(
        select(Chat)
        .where(Chat.user_id == DUMMY_USER_ID)
        .order_by(Chat.updated_at.desc())
    )

    return result.scalars().all()


async def create_user_chat(db: AsyncSession):
    chat = Chat(
        user_id=DUMMY_USER_ID,
        title="New Chat",
    )

    db.add(chat)
    await db.commit()
    await db.refresh(chat)

    return chat


async def update_user_chat_title(
    chat_id: uuid.UUID,
    title: str,
    db: AsyncSession,
):
    chat = await get_chat_or_404(chat_id, db)

    clean_title = title.strip()

    if not clean_title:
        raise HTTPException(status_code=400, detail="Title is required")

    chat.title = clean_title[:60]
    chat.updated_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(chat)

    return chat


async def delete_user_chat(chat_id: uuid.UUID, db: AsyncSession):
    chat = await get_chat_or_404(chat_id, db)

    # Delete messages first, in case FK cascade is not configured.
    await db.execute(delete(Message).where(Message.chat_id == chat_id))

    await db.delete(chat)
    await db.commit()

    return {"ok": True}


async def get_chat_messages(chat_id: uuid.UUID, db: AsyncSession):
    await get_chat_or_404(chat_id, db)

    result = await db.execute(
        select(Message)
        .where(Message.chat_id == chat_id)
        .order_by(Message.created_at.asc())
    )

    return result.scalars().all()


async def send_chat_message(
    chat_id: uuid.UUID,
    message: str,
    db: AsyncSession,
):
    chat = await get_chat_or_404(chat_id, db)

    clean_message = message.strip()

    if not clean_message:
        raise HTTPException(status_code=400, detail="Message is required")

    # 1. Store user message
    user_msg = Message(
        chat_id=chat.id,
        role="user",
        content=clean_message,
    )
    db.add(user_msg)

    # 2. Set title from first message if still default
    if not chat.title or chat.title == "New Chat":
        chat.title = clean_message[:60]

    # 3. Static bot reply for now
    reply_text = "The bot has replied. Please ask another question"

    # 4. Store bot message
    bot_msg = Message(
        chat_id=chat.id,
        role="bot",
        content=reply_text,
    )
    db.add(bot_msg)

    # 5. Update chat timestamp
    chat.updated_at = datetime.now(timezone.utc)

    await db.commit()

    return reply_text