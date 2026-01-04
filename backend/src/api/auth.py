from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from datetime import timedelta
from slowapi import Limiter, extension
from slowapi.util import get_remote_address
from fastapi import Request  # Added for rate limiting

from ..api.dependencies import get_session
from ..models.user import User, UserRegister, UserLogin, UserRead, TokenResponse
from ..core.security import hash_password, verify_password, create_access_token
from ..core.config import settings

# Initialize rate limiter for this module
limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/hour")  # 5 requests per IP per hour for register
def register(request: Request, user_in: UserRegister, session: Session = Depends(get_session)):  # Added request parameter
    # Check if user already exists
    statement = select(User).where(User.email == user_in.email)
    existing_user = session.execute(statement).scalar_one_or_none()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )

    # Create new user
    db_user = User(
        email=user_in.email,
        password_hash=hash_password(user_in.password)
    )
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user

@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")  # 10 requests per IP per minute for login
def login(request: Request, user_in: UserLogin, session: Session = Depends(get_session)):
    # Find user by email
    statement = select(User).where(User.email == user_in.email)
    user = session.execute(statement).scalar_one_or_none()
    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )

    return TokenResponse(
        access_token=access_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

@router.post("/logout")
def logout():
    # Stateless JWT logout
    return {"message": "Successfully logged out"}
