import asyncio
import os
import sys
from pathlib import Path

# Add backend folder to path
backend_path = Path("d:/Ibad Coding/hackathon-2-todo/full-stack-todo-app-phase-3/backend")
sys.path.insert(0, str(backend_path))

from sqlmodel import Session, select, create_engine
from src.core.database import engine, init_db
from src.models import User, Task
from src.services.chat_service import ChatService
from src.mcp.task_operations import list_tasks_operation

async def reproduce():
    # Make sure we use the same database as the app
    # (assuming dev env uses the one in .env or default)
    # create a dummy user
    
    with Session(engine) as session:
        # Check if user exists or create one
        user = session.exec(select(User).where(User.email == "test@example.com")).first()
        if not user:
            print("Creating test user...")
            user = User(email="test@example.com", password_hash="fake")
            session.add(user)
            session.commit()
            session.refresh(user)
        
        user_id = user.id
        print(f"User ID: {user_id}")
        
        # Create a task for this user if none exist
        tasks = session.exec(select(Task).where(Task.user_id == user_id)).all()
        if not tasks:
            print("Creating test task...")
            task = Task(title="Test Task", user_id=user_id)
            session.add(task)
            session.commit()
    
    # Test 1: Direct Tool Call
    print("\n--- Testing Direct Tool Call (list_tasks) ---")
    try:
        results = await list_tasks_operation(user_id=user_id, status="all")
        print(f"Success! Found {len(results)} tasks.")
        print(results)
    except Exception as e:
        print(f"Error calling list_tasks: {e}")
        import traceback
        traceback.print_exc()

    # Test 2: Chat Service
    print("\n--- Testing Chat Service ---")
    try:
        with Session(engine) as session:
            service = ChatService(session)
            print("Sending message: 'list all my tasks'")
            response = await service.chat(user_id=user_id, message="list all my tasks")
            print("Response:", response["response"])
    except Exception as e:
        print(f"Error in chat service: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(reproduce())
