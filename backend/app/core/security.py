from datetime import datetime, timedelta, timezone
from typing import Any, Union, Optional
from jose import jwt
import bcrypt
import redis
from app.core.config import settings

# Setup Redis Client
try:
    redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
except Exception:
    # Fallback to None if redis service is not online during setup/tests
    redis_client = None

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against hashed password."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    """Hash password using bcrypt."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def create_access_token(
    subject: Union[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    """Create access token with custom expire offset."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode = {"exp": expire, "sub": str(subject), "type": "access"}
    encoded_jwt = jwt.encode(
        to_encode, settings.JWT_SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt

def create_refresh_token(
    subject: Union[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    """Create refresh token with custom expire offset."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )
    to_encode = {"exp": expire, "sub": str(subject), "type": "refresh"}
    encoded_jwt = jwt.encode(
        to_encode, settings.JWT_REFRESH_SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt

def blocklist_token(token: str, expires_in_seconds: int) -> None:
    """Blocklist a token in Redis to prevent reuse."""
    if redis_client:
        try:
            redis_client.setex(f"blocklist:{token}", expires_in_seconds, "1")
        except Exception:
            pass

def is_token_blocklisted(token: str) -> bool:
    """Check if token is in Redis blocklist."""
    if redis_client:
        try:
            return redis_client.exists(f"blocklist:{token}") > 0
        except Exception:
            return False
    return False
