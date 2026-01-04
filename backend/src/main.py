import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from src.core.config import settings
from src.api import auth, tasks
from src.models import User, Task  # Ensure models are registered

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Multi-User Task Management API with authentication, task CRUD, and secure user isolation",
    version="1.0.0",
    openapi_url="/api/openapi.json",
    docs_url="/docs",
    # Add example schemas for better API documentation
    contact={
        "name": "API Support",
        "email": "support@todo-app.com",
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
)

# Add rate limiting middleware
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure logging
logging.basicConfig(level=logging.INFO if settings.ENVIRONMENT == "development" else logging.WARNING)
logger = logging.getLogger(__name__)

# Add custom exception handlers for better error messages
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    # Log validation errors for debugging
    logger.warning(f"Validation error: {exc}")

    # In development, return detailed error information
    if settings.ENVIRONMENT == "development":
        return JSONResponse(
            status_code=422,
            content={
                "detail": "Validation error",
                "errors": jsonable_encoder(exc.errors())
            }
        )
    # In production, return generic error message
    else:
        return JSONResponse(
            status_code=422,
            content={"detail": "Invalid input data"}
        )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    # Log general errors for debugging
    logger.error(f"Unhandled exception: {exc}", exc_info=True)

    # In development, return detailed error information
    if settings.ENVIRONMENT == "development":
        return JSONResponse(
            status_code=500,
            content={
                "detail": "Internal server error",
                "error": str(exc)
            }
        )
    # In production, return generic error message
    else:
        return JSONResponse(
            status_code=500,
            content={"detail": "An unexpected error occurred"}
        )

# CORS configuration - whitelist of allowed origins
if settings.ENVIRONMENT == "development":
    origins = [
        "http://localhost:3000",  # Frontend dev server
        "http://127.0.0.1:3000",  # Alternative localhost
        "http://localhost:8000",  # Backend docs for testing
    ]
else:
    # Production origins - replace with your actual production domains
    origins = [
        "https://your-production-domain.com",  # Production frontend
        "https://www.your-production-domain.com",  # Alternative production domain
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,  # Allow cookies and authorization headers
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],  # Explicit methods
    allow_headers=["*"],  # Allow all headers including Authorization
    # Explicitly disallow wildcard for security
    # No allow_origin_regex used to prevent potential security issues
)

# Include routers
app.include_router(auth.router)
app.include_router(tasks.router)

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
