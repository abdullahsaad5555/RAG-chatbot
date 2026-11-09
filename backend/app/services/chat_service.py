import uuid
from datetime import datetime, timezone
from app.services.rag_service import answer
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


async def get_chat_messages(
    chat_id: uuid.UUID,
    db: AsyncSession,
    limit: int = 50,
    before: uuid.UUID | None = None,
):
    """
    Fetch messages for a chat with cursor-based pagination.

    - Returns the newest `limit` messages by default.
    - If `before` is provided, returns messages older than that message.
    - Results are returned in chronological order (oldest first) for
      easy top-down rendering on the frontend.
    """
    await get_chat_or_404(chat_id, db)

    # Clamp limit to sane range
    limit = max(1, min(limit, 500))

    stmt = (
        select(Message)
        .where(Message.chat_id == chat_id)
    )

    # If cursor provided, only fetch messages older than the cursor message
    if before is not None:
        cursor_result = await db.execute(
            select(Message.created_at).where(Message.id == before)
        )
        cursor_ts = cursor_result.scalar_one_or_none()

        if cursor_ts is not None:
            stmt = stmt.where(Message.created_at < cursor_ts)

    # Fetch newest N (DESC), then reverse for chronological order
    stmt = stmt.order_by(Message.created_at.desc()).limit(limit)

    result = await db.execute(stmt)
    messages = list(result.scalars().all())

    # Reverse so frontend gets oldest → newest
    messages.reverse()

    return {
        "messages": messages,
        "has_more": len(messages) == limit,
        "next_cursor": str(messages[0].id) if messages else None,
    }

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
# 3. Generate reply using the local Qwen model
    try:
            reply_text = await answer(clean_message)
    except Exception as e:
        print(f"LLM generation failed: {e}")
        raise HTTPException(
        status_code=503,
        detail="The local AI model is currently unavailable.",
        )
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



async def search_user_chats(query: str, db: AsyncSession):
    """
    Search user's chats by title OR message content.
    Case-insensitive, deduplicated, ordered by most recent.
    """
    clean_query = query.strip()

    if not clean_query:
        return []

    # Cap query length to prevent abuse
    clean_query = clean_query[:200]

    pattern = f"%{clean_query}%"

    # Subquery: chat_ids that have any matching message
    matching_message_chat_ids = (
        select(Message.chat_id)
        .where(Message.content.ilike(pattern))
        .distinct()
    )

    # Main query: user's chats where
    #   title matches  OR  chat has a matching message
    stmt = (
        select(Chat)
        .where(
            Chat.user_id == DUMMY_USER_ID,
            (Chat.title.ilike(pattern)) | (Chat.id.in_(matching_message_chat_ids)),
        )
        .order_by(Chat.updated_at.desc())
        .limit(50)
    )

    result = await db.execute(stmt)
    return result.scalars().all()


async def clear_chat_messages(chat_id: uuid.UUID, db: AsyncSession):
    """
    Delete all messages in a chat but keep the chat itself.
    Also resets the chat title to 'New Chat' so it feels fresh.
    """
    chat = await get_chat_or_404(chat_id, db)

    await db.execute(
        delete(Message).where(Message.chat_id == chat_id)
    )

    # Reset title so the sidebar doesn't keep the stale first-message name
    chat.title = "New Chat"
    chat.updated_at = datetime.now(timezone.utc)

    await db.commit()

    return {"ok": True, "chat_id": str(chat_id)}