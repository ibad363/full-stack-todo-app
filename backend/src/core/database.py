from sqlmodel import create_engine, Session, SQLModel
from .config import settings

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600
)

def init_db():
    # This will be used to create tables if they don't exist
    SQLModel.metadata.create_all(engine)
