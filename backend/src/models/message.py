from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from .conversation import Conversation

class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversation.id", index=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    role: str = Field(index=True)  # "user" or "assistant"
    content: str = Field(max_length=4000)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    conversation: "Conversation" = Relationship(back_populates="messages")

class MessageCreate(SQLModel):
    role: str
    content: str

class MessageRead(SQLModel):
    id: int
    conversation_id: int
    user_id: int
    role: str
    content: str
    created_at: datetime
