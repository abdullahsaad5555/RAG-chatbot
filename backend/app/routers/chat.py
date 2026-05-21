import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.schemas import ChatRequest, ChatResponse
from app.services.chat_service import send_chat_message

router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat(
    req: ChatRequest,
    chat_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    reply_text = await send_chat_message(
        chat_id=chat_id,
        message=req.message,
        db=db,
    )

    return ChatResponse(reply=reply_text)