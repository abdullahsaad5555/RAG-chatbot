import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.schemas import ChatTitleUpdate
from app.services.chat_service import (
    list_user_chats,
    create_user_chat,
    update_user_chat_title,
    delete_user_chat,
    get_chat_messages,
    search_user_chats,
    clear_chat_messages,
)

router = APIRouter(prefix="/chats", tags=["chats"])


@router.get("")
async def list_chats(db: AsyncSession = Depends(get_db)):
    return await list_user_chats(db)


@router.post("")
async def create_chat(db: AsyncSession = Depends(get_db)):
    return await create_user_chat(db)


@router.get("/search")   # ← NEW ROUTE, placed before /{chat_id}
async def search_chats(
    q: str = "",
    db: AsyncSession = Depends(get_db),
):
    return await search_user_chats(query=q, db=db)


@router.patch("/{chat_id}")
async def update_chat_title(
    chat_id: uuid.UUID,
    payload: ChatTitleUpdate,
    db: AsyncSession = Depends(get_db),
):
    return await update_user_chat_title(
        chat_id=chat_id,
        title=payload.title,
        db=db,
    )


@router.delete("/{chat_id}")
async def delete_chat(
    chat_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    return await delete_user_chat(chat_id, db)


@router.get("/{chat_id}/messages")
async def get_messages(
    chat_id: uuid.UUID,
    limit: int = 50,
    before: uuid.UUID | None = None,
    db: AsyncSession = Depends(get_db),
):
    return await get_chat_messages(
        chat_id=chat_id,
        db=db,
        limit=limit,
        before=before,
    )

@router.delete("/{chat_id}/messages")
async def clear_messages(
    chat_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    return await clear_chat_messages(chat_id, db)