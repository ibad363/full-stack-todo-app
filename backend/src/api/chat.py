from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlmodel import Session

from .dependencies import CurrentUserDep, get_session
from ..models.conversation import Conversation
from ..services.chat_service import ChatService


router = APIRouter(prefix="/api", tags=["chat"])


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1000)
    conversation_id: Optional[int] = None


@router.post("/{user_id}/chat")
async def chat(
    user_id: int,
    body: ChatRequest,
    current_user: CurrentUserDep,
    session: Session = Depends(get_session),
):
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    if body.conversation_id is not None and body.conversation_id <= 0:
        raise HTTPException(status_code=400, detail="conversation_id must be a positive integer")

    if body.conversation_id is not None:
        convo = session.get(Conversation, body.conversation_id)
        if convo is None or convo.user_id != current_user.id:
            raise HTTPException(
                status_code=404,
                detail=f"Conversation {body.conversation_id} not found",
            )

    service = ChatService(session)
    return await service.chat(
        user_id=current_user.id,
        message=body.message,
        conversation_id=body.conversation_id,
    )
