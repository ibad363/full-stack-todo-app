from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from pydantic import EmailStr, ConfigDict

class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True)

class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    tasks: List["Task"] = Relationship(back_populates="user")

class UserRegister(UserBase):
    password: str = Field(min_length=8)

class UserLogin(UserBase):
    password: str

class UserRead(UserBase):
    id: int
    created_at: datetime

class TokenResponse(SQLModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int

