import uuid

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from constants import DUMMY_USER_ID
from models import Chat


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