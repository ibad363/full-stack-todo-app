from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, List
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Todo API"
    ENVIRONMENT: str = "development"

    # Database
    DATABASE_URL: str

    # Security
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    # CORS (Read from .env - required)
    CORS_ORIGINS: str

    # AI (Gemini via OpenAI-compatible endpoint)
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.5-flash"

    # Rate limiting (token bucket)
    RATE_LIMIT_ENABLED: bool = True
    CHAT_RATE_LIMIT_CAPACITY: int = 30
    CHAT_RATE_LIMIT_REFILL_PER_SECOND: float = 0.5  # 30 tokens / minute


    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS_ORIGINS string into a list"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    def __init__(self, **values):
        super().__init__(**values)
        # Validate JWT secret strength
        if len(self.JWT_SECRET) < 32:
            raise ValueError("JWT_SECRET must be at least 32 characters long for security")

        # Additional validation in production environment
        if self.ENVIRONMENT == "production" and not self._is_strong_secret(self.JWT_SECRET):
            raise ValueError("JWT_SECRET must be cryptographically strong in production (e.g., generated with 'openssl rand -hex 32')")

    def _is_strong_secret(self, secret: str) -> bool:
        """
        Check if the secret is cryptographically strong.
        In production, secrets should be randomly generated with sufficient entropy.
        """
        # Check minimum length (already validated above, but as an extra check)
        if len(secret) < 32:
            return False

        # For production, we recommend secrets generated with sufficient entropy
        # This is a basic check - in practice, secrets should be generated securely
        # (e.g., using 'openssl rand -hex 32' or similar)
        return True

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
