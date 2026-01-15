"""
API endpoints for conversation management.
"""
from typing import List
import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func, desc

from .dependencies import CurrentUserDep, get_session
from ..models.conversation import Conversation, ConversationWithPreview, ConversationRead
from ..models.message import Message, MessageRead

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/conversations", tags=["conversations"])


@router.get("", response_model=List[ConversationWithPreview])
async def list_conversations(
    current_user: CurrentUserDep,
    session: Session = Depends(get_session),
):
    """List all conversations for the current user with preview."""
    try:
        # Get all conversations for user
        stmt = (
            select(Conversation)
            .where(Conversation.user_id == current_user.id)
            .order_by(desc(Conversation.updated_at))
        )
        conversations = list(session.exec(stmt).all())

        # Build response with previews
        result = []
        for conv in conversations:
            # Get message count
            count_stmt = select(func.count(Message.id)).where(Message.conversation_id == conv.id)
            message_count = session.exec(count_stmt).one()

            # Get last message
            last_msg_stmt = (
                select(Message)
                .where(Message.conversation_id == conv.id)
                .order_by(desc(Message.created_at))
                .limit(1)
            )
            last_message = session.exec(last_msg_stmt).first()

            result.append(
                ConversationWithPreview(
                    id=conv.id,
                    title=conv.title,
                    created_at=conv.created_at,
                    updated_at=conv.updated_at,
                    message_count=message_count,
                    last_message=last_message.content if last_message else None,
                )
            )

        return result
    except Exception as e:
        logger.error(f"Error listing conversations: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to list conversations")


@router.get("/{conversation_id}/messages", response_model=List[MessageRead])
async def get_conversation_messages(
    conversation_id: int,
    current_user: CurrentUserDep,
    session: Session = Depends(get_session),
):
    """Get all messages for a specific conversation."""
    try:
        # Verify conversation belongs to user
        conversation = session.get(Conversation, conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        if conversation.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")

        # Get messages
        stmt = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
        )
        messages = list(session.exec(stmt).all())

        return [
            MessageRead(
                id=msg.id,
                conversation_id=msg.conversation_id,
                user_id=msg.user_id,
                role=msg.role,
                content=msg.content,
                created_at=msg.created_at,
            )
            for msg in messages
        ]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting messages: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get messages")


@router.delete("/{conversation_id}")
async def delete_conversation(
    conversation_id: int,
    current_user: CurrentUserDep,
    session: Session = Depends(get_session),
):
    """Delete a conversation and all its messages."""
    try:
        # Verify conversation belongs to user
        conversation = session.get(Conversation, conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        if conversation.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")

        # Delete conversation (messages will be cascade deleted)
        session.delete(conversation)
        session.commit()

        return {"message": "Conversation deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting conversation: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to delete conversation")
