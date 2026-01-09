import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Optional, Union

from jose import jwt
from pwdlib import PasswordHash
from fastapi.security import OAuth2PasswordBearer
from .config import settings

# Configure logger for security events
logger = logging.getLogger(__name__)

password_hash = PasswordHash.recommended()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def hash_password(password: str) -> str:
    return password_hash.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password.

    Logs successful and failed verification attempts for security monitoring.
    """
    try:
        is_valid = password_hash.verify(plain_password, hashed_password)
        if is_valid:
            logger.info("Successful password verification for user")
        else:
            logger.warning("Failed password verification attempt")
        return is_valid
    except Exception as e:
        logger.error(f"Error during password verification: {str(e)}")
        return False

def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create an access token with the given subject and expiration.

    Logs successful token creation for audit purposes.
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

    logger.info(f"JWT token created for subject: {str(subject)[:10]}...")
    return encoded_jwt

def decode_token(token: str) -> Optional[str]:
    """
    Decode a JWT token and return the subject.

    Logs successful and failed token verification attempts for security monitoring.
    """
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        subject = payload.get("sub")

        if subject:
            logger.info(f"Successful JWT verification for subject: {subject}")
        else:
            logger.warning("JWT token decoded but no subject found")

        return subject
    except jwt.JWTError as e:
        logger.warning(f"JWT verification failed: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error during JWT verification: {str(e)}")
        return None
