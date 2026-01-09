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

# main.py

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

from contextlib import asynccontextmanager
from src.core.database import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup
    init_db()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Multi-User Task Management API with authentication, task CRUD, and secure user isolation",
    version="1.0.0",
    openapi_url="/api/openapi.json",
    docs_url="/docs",
    lifespan=lifespan,
    redirect_slashes=False,
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

# CORS and Private Network Access Configuration
origins = settings.cors_origins_list

# Note: Middleware added LAST becomes the OUTERMOST layer.
# We want the PNA middleware to wrap around the CORS middleware.

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_private_network_access_header(request, call_next):
    # Detect preflight request for Private Network Access
    is_pna_preflight = (
        request.method == "OPTIONS" and 
        request.headers.get("access-control-request-private-network") == "true"
    )
    
    response = await call_next(request)
    
    # Force add the header for all requests from Vercel to localhost
    if is_pna_preflight or request.headers.get("access-control-request-private-network") == "true":
        response.headers["Access-Control-Allow-Private-Network"] = "true"
        # Force CORS headers if missing (Starlette CORSMiddleware sometimes skips them)
        origin = request.headers.get("origin")
        if origin in origins:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            
    return response

# Include routers
app.include_router(auth.router)
app.include_router(tasks.router)

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
