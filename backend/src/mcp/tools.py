from datetime import datetime
from typing import Optional

from sqlmodel import Session

from ..core import database as db
from ..models.task import Task
from .server import mcp


@mcp.tool()
async def add_task(
    title: str,
    user_id: int,
    description: Optional[str] = None,
    priority: str = "medium",
) -> dict:
    """Create a new task for the given user_id."""

    with Session(db.engine) as session:
        db_task = Task(
            title=title,
            description=description,
            priority=priority,
            user_id=user_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            completed=False,
            completed_at=None,
        )
        session.add(db_task)
        session.commit()
        session.refresh(db_task)

        return {
            "task_id": db_task.id,
            "status": "created",
            "title": db_task.title,
        }

@mcp.tool()
async def list_tasks(user_id: int, status: str = "all") -> list[dict]:
    """List tasks for the given user_id.

    Args:
        user_id: Authenticated user's numeric ID.
        status: "all" | "pending" | "completed"

    Returns:
        A human-readable list of tasks.
    """

    from sqlmodel import select

    normalized = status.strip().lower()
    if normalized not in {"all", "pending", "completed"}:
        raise ValueError("Invalid status. Use: all, pending, completed.")

    with Session(db.engine) as session:
        stmt = select(Task).where(Task.user_id == user_id)
        if normalized == "pending":
            stmt = stmt.where(Task.completed == False)  # noqa: E712
        elif normalized == "completed":
            stmt = stmt.where(Task.completed == True)  # noqa: E712

        stmt = stmt.order_by(Task.completed.asc(), Task.created_at.desc())
        tasks = list(session.exec(stmt).all())

        items: list[dict] = []
        for t in tasks:
            items.append(
                {
                    "task_id": t.id,
                    "title": t.title,
                    "description": t.description,
                    "completed": t.completed,
                    "created_at": t.created_at.isoformat() if t.created_at else None,
                }
            )

        return items


@mcp.tool()
async def complete_task(task_id: int, user_id: int) -> dict:
    """Mark a user's task as completed.

    Returns:
        {"task_id": int, "status": "completed", "title": str}
    """

    with Session(db.engine) as session:
        task = session.get(Task, task_id)
        if not task:
            raise ValueError("Task not found")
        if task.user_id != user_id:
            raise PermissionError("Not enough permissions")

        if not task.completed:
            task.completed = True
            task.completed_at = datetime.utcnow()
            task.updated_at = datetime.utcnow()
            session.add(task)
            session.commit()
            session.refresh(task)

        return {
            "task_id": task.id,
            "status": "completed",
            "title": task.title,
        }


@mcp.tool()
async def delete_task(task_id: int, user_id: int) -> dict:
    """Delete a user's task.

    Returns:
        {"task_id": int, "status": "deleted", "title": str}
    """

    with Session(db.engine) as session:
        task = session.get(Task, task_id)
        if not task:
            raise ValueError("Task not found")
        if task.user_id != user_id:
            raise PermissionError("Not enough permissions")

        title = task.title
        session.delete(task)
        session.commit()

        return {
            "task_id": task_id,
            "status": "deleted",
            "title": title,
        }


@mcp.tool()
async def update_task(
    task_id: int,
    user_id: int,
    title: Optional[str] = None,
    description: Optional[str] = None,
) -> dict:
    """Update a user's task title and/or description.

    Returns:
        {"task_id": int, "status": "updated", "title": str}
    """

    if title is None and description is None:
        raise ValueError("Nothing to update")

    with Session(db.engine) as session:
        task = session.get(Task, task_id)
        if not task:
            raise ValueError("Task not found")
        if task.user_id != user_id:
            raise PermissionError("Not enough permissions")

        if title is not None:
            task.title = title
        if description is not None:
            task.description = description

        task.updated_at = datetime.utcnow()
        session.add(task)
        session.commit()
        session.refresh(task)

        return {
            "task_id": task.id,
            "status": "updated",
            "title": task.title,
        }
