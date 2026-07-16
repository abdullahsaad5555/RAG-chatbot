from pydantic import BaseModel, Field, field_validator


class ChatRequest(BaseModel):
    message: str = Field(
        ...,
        min_length=1,
        max_length=4000,
        description="User message content. 1–4000 characters.",
    )
    timestamp: str | None = Field(
        default=None,
        max_length=64,
        description="Optional ISO timestamp from client.",
    )

    @field_validator("message")
    @classmethod
    def strip_and_validate_message(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Message cannot be empty or whitespace only")
        return cleaned


class ChatResponse(BaseModel):
    reply: str


class ChatTitleUpdate(BaseModel):
    title: str = Field(
        ...,
        min_length=1,
        max_length=60,
        description="Chat title. 1–60 characters.",
    )

    @field_validator("title")
    @classmethod
    def strip_and_validate_title(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Title cannot be empty or whitespace only")
        return cleaned