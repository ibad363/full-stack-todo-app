"""
MCP tools for task management.
These are thin wrappers around the core task operations.
"""
from typing import Optional

from .server import mcp
from .task_operations import (
    add_task_operation,
    list_tasks_operation,
    complete_task_operation,
    delete_task_operation,
    update_task_operation,
)


@mcp.tool()
async def add_task(
    title: str,
    user_id: int,
    description: Optional[str] = None,
    priority: str = "medium",
) -> dict:
    """Create a new task for the given user_id."""
    return await add_task_operation(
        user_id=user_id,
        title=title,
        description=description,
        priority=priority,
    )


@mcp.tool()
async def list_tasks(user_id: int, status: str = "all") -> list[dict]:
    """List tasks for the given user_id.

    Args:
        user_id: Authenticated user's numeric ID.
        status: "all" | "pending" | "completed"

    Returns:
        A human-readable list of tasks.
    """
    return await list_tasks_operation(user_id=user_id, status=status)


@mcp.tool()
async def complete_task(task_id: int, user_id: int) -> dict:
    """Mark a user's task as completed.

    Returns:
        {"task_id": int, "status": "completed", "title": str}
    """
    return await complete_task_operation(task_id=task_id, user_id=user_id)


@mcp.tool()
async def delete_task(task_id: int, user_id: int) -> dict:
    """Delete a user's task.

    Returns:
        {"task_id": int, "status": "deleted", "title": str}
    """
    return await delete_task_operation(task_id=task_id, user_id=user_id)


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
    return await update_task_operation(
        task_id=task_id,
        user_id=user_id,
        title=title,
        description=description,
    )
