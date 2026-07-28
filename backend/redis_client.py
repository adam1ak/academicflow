import logging
import os
import redis

logger = logging.getLogger("academicflow.redis")

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

redis_client = redis.Redis.from_url(
    REDIS_URL,
    decode_responses=True,
    socket_timeout=1.0,
    socket_connect_timeout=1.0
)

def safe_get(key: str):
    try:
        return redis_client.get(key)
    except Exception as exc:
        logger.debug(f"Redis get failed for key '{key}': {exc}")
        return None

def safe_setex(key: str, seconds: int, value: str):
    try:
        redis_client.set(key, value, ex=seconds)
    except Exception as exc:
        logger.debug(f"Redis set failed for key '{key}': {exc}")

def safe_delete(key: str):
    try:
        redis_client.delete(key)
    except Exception as exc:
        logger.debug(f"Redis delete failed for key '{key}': {exc}")