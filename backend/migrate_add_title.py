"""
Migration script to add title column to conversation table.
Run this once to update the database schema.
"""
import sys
from pathlib import Path

# Add backend folder to path
backend_path = Path(__file__).parent
sys.path.insert(0, str(backend_path))

from sqlalchemy import text
from src.core.database import engine

def migrate():
    """Add title column to conversation table if it doesn't exist."""
    with engine.connect() as conn:
        # Check if column exists
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='conversation' AND column_name='title'
        """))
        
        if result.fetchone() is None:
            print("Adding 'title' column to 'conversation' table...")
            conn.execute(text("""
                ALTER TABLE conversation 
                ADD COLUMN title VARCHAR(200)
            """))
            conn.commit()
            print("✅ Migration completed successfully!")
        else:
            print("✅ Column 'title' already exists. No migration needed.")

if __name__ == "__main__":
    try:
        migrate()
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        sys.exit(1)
