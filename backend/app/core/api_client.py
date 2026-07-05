import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, Any, Dict
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from app.core.database import SessionLocal
from app.models.cache import APICache

# Set up logging format
logger = logging.getLogger("tripgenie.api_client")
logger.setLevel(logging.INFO)

def get_cached_response(api_name: str, cache_key: str) -> Optional[Dict[str, Any]]:
    """
    Looks up a valid cached response in PostgreSQL for the given api name and query key.
    """
    try:
        with SessionLocal() as db:
            now = datetime.now(timezone.utc)
            cached = db.query(APICache).filter(
                APICache.api_name == api_name,
                APICache.cache_key == cache_key,
                APICache.expires_at > now
            ).first()
            if cached:
                logger.info(f"PostgreSQL Cache HIT - API: {api_name}, Key: {cache_key}")
                return cached.response_json
    except Exception as e:
        logger.error(f"Error checking cache from DB: {str(e)}")
    return None

def store_cached_response(api_name: str, cache_key: str, response_json: Dict[str, Any], ttl_days: float = 1.0):
    """
    Saves an API response payload to the PostgreSQL APICache table with a relative TTL expiry.
    """
    try:
        with SessionLocal() as db:
            now = datetime.now(timezone.utc)
            expires_at = now + timedelta(days=ttl_days)
            
            existing = db.query(APICache).filter(APICache.cache_key == cache_key).first()
            if existing:
                existing.response_json = response_json
                existing.expires_at = expires_at
                existing.created_at = now
            else:
                db_cache = APICache(
                    api_name=api_name,
                    cache_key=cache_key,
                    response_json=response_json,
                    expires_at=expires_at
                )
                db.add(db_cache)
            db.commit()
            logger.info(f"PostgreSQL Cache STORE - API: {api_name}, Key: {cache_key} (TTL: {ttl_days} days)")
    except Exception as e:
        logger.error(f"Error writing cache to DB: {str(e)}")

# Standard retry decorator: 3 attempts, exponential backoff (e.g. 1s, 2s, 4s...)
@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=8),
    retry=retry_if_exception_type((httpx.HTTPError, httpx.TimeoutException)),
    reraise=True
)
def fetch_api_with_retry(
    url: str,
    method: str = "GET",
    params: Optional[Dict[str, Any]] = None,
    headers: Optional[Dict[str, Any]] = None,
    json_data: Optional[Dict[str, Any]] = None,
    timeout: float = 10.0
) -> httpx.Response:
    """
    Executes HTTP request with automatic retries and exponential backoff for timeout/network errors.
    """
    logger.info(f"HTTP Request - Method: {method}, URL: {url}")
    with httpx.Client(timeout=timeout) as client:
        if method.upper() == "POST":
            response = client.post(url, json=json_data, headers=headers, params=params)
        else:
            response = client.get(url, params=params, headers=headers)
        response.raise_for_status()
        return response
