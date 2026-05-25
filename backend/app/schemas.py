from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str
    timestamp: str | None = None

class ChatResponse(BaseModel):
    reply: str 

class ChatTitleUpdate(BaseModel):
    title: str