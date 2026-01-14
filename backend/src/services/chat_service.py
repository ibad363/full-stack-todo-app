from __future__ import annotations

from typing import Optional, List

from agents import Agent, ModelSettings, OpenAIChatCompletionsModel, Runner, function_tool
from openai import AsyncOpenAI
from sqlmodel import Session, select

from ..core.config import settings
from ..models.conversation import Conversation
from ..models.message import Message
from ..mcp.task_operations import (
    add_task_operation,
    list_tasks_operation,
    complete_task_operation,
    delete_task_operation,
    update_task_operation,
)


class ChatService:
    def __init__(self, session: Session):
        self._session = session

    def _build_model(self, model: str) -> OpenAIChatCompletionsModel:
        # Gemini via OpenAI-compatible endpoint
        external_client = AsyncOpenAI(
            api_key=settings.GEMINI_API_KEY or "",
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        )

        return OpenAIChatCompletionsModel(
            model=model,
            openai_client=external_client,
        )

    def _build_agent(self, user_id: int, model: str) -> Agent:
        llm_model = self._build_model(model)

        @function_tool
        async def create_task(title: str, description: Optional[str] = None, priority: str = "medium") -> str:
            """Create a task for the current authenticated user."""

            res = await add_task_operation(
                user_id=user_id,
                title=title,
                description=description,
                priority=priority,
            )

            return f"Created task #{res.get('task_id')}: {res.get('title')}"

        @function_tool
        async def get_tasks(status: str = "all") -> str:
            """List the current user's tasks.

            This tool can be used when the user asks: "show my tasks", "what's pending?", etc.

            Args:
                status: "all" | "pending" | "completed"

            Returns:
                A formatted list of tasks.
            """

            items = await list_tasks_operation(user_id=user_id, status=status)

            if not items:
                if status == "pending":
                    return "You have no pending tasks."
                if status == "completed":
                    return "You have no completed tasks."
                return "You have no tasks."

            lines = []
            for t in items:
                marker = "✓" if t.get("completed") else "·"
                lines.append(f"{marker} #{t.get('task_id')} {t.get('title')}")

            header = f"You have {len(items)} {status} task(s):" if status != "all" else f"You have {len(items)} task(s):"
            return header + "\n" + "\n".join(lines)

        @function_tool
        async def mark_task_complete(task_id: int) -> str:
            """Mark one of the current user's tasks as completed by numeric task_id."""

            res = await complete_task_operation(task_id=task_id, user_id=user_id)
            return f"Marked task #{res.get('task_id')} as completed: {res.get('title')}"

        @function_tool
        async def remove_task(task_id: int) -> str:
            """Delete one of the current user's tasks by numeric task_id."""

            res = await delete_task_operation(task_id=task_id, user_id=user_id)
            return f"Deleted task #{res.get('task_id')}: {res.get('title')}"

        @function_tool
        async def edit_task(task_id: int, title: Optional[str] = None, description: Optional[str] = None) -> str:
            """Update one of the current user's tasks.

            Provide at least one of: title, description.
            """

            res = await update_task_operation(task_id=task_id, user_id=user_id, title=title, description=description)
            return f"Updated task #{res.get('task_id')}: {res.get('title')}"

        return Agent(
            name="TodoChatbot",
            instructions=(
                "You are a helpful todo assistant. "
                "When the user asks to add a task, call the create_task tool. "
                "When the user asks to show/list tasks, call the get_tasks tool. "
                "When the user asks to mark a task complete/done, call the mark_task_complete tool. "
                "When the user asks to delete/remove a task, call the remove_task tool. "
                "When the user asks to update/edit/change a task, call the edit_task tool. "
                "After calling a tool, respond with a short helpful answer."
            ),
            model=llm_model,
            model_settings=ModelSettings(tool_choice="auto"),
            tools=[create_task, get_tasks, mark_task_complete, remove_task, edit_task],
        )

    def _get_or_create_conversation(self, user_id: int, conversation_id: Optional[int]) -> Conversation:
        if conversation_id is not None:
            convo = self._session.get(Conversation, conversation_id)
            if convo and convo.user_id == user_id:
                return convo

        convo = Conversation(user_id=user_id)
        self._session.add(convo)
        self._session.commit()
        self._session.refresh(convo)
        return convo

    def _load_history(self, conversation_id: int) -> List[Message]:
        stmt = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
        )
        return list(self._session.exec(stmt).all())

    async def chat(self, user_id: int, message: str, conversation_id: Optional[int] = None, model: Optional[str] = None) -> dict:
        # Use default model if not provided
        if model is None:
            model = settings.GEMINI_DEFAULT_MODEL
        
        convo = self._get_or_create_conversation(user_id=user_id, conversation_id=conversation_id)

        user_msg = Message(
            conversation_id=convo.id,
            user_id=user_id,
            role="user",
            content=message,
        )
        self._session.add(user_msg)
        self._session.commit()
        self._session.refresh(user_msg)

        history = self._load_history(conversation_id=convo.id)
        history_text = "\n".join([f"{m.role}: {m.content}" for m in history[-20:]])

        agent = self._build_agent(user_id=user_id, model=model)

        prompt = (
            "Conversation so far:\n"
            + history_text
            + "\n\nUser: "
            + message
        )

        result = await Runner.run(agent, prompt)
        assistant_text = result.final_output

        assistant_msg = Message(
            conversation_id=convo.id,
            user_id=user_id,
            role="assistant",
            content=str(assistant_text),
        )
        self._session.add(assistant_msg)
        self._session.commit()
        self._session.refresh(assistant_msg)

        return {
            "conversation_id": convo.id,
            "message_id": assistant_msg.id,
            "response": str(assistant_text),
        }
