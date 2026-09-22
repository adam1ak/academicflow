import time
import uuid
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response
import structlog

logger = structlog.get_logger()

class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware that injects X-Request-ID, measures latency, and logs request lifecycle"""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        request_id = request.headers.get("X-Request-ID") or f"req-{uuid.uuid4().hex[:12]}"

        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(
            request_id=request_id,
            method=request.method,
            path=request.url.path
        )

        start_time = time.perf_counter()

        try:
            response = await call_next(request)
        except Exception as exc:
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            logger.exception(
                "http_request_failed",
                duration_ms=duration_ms,
                error=str(exc)
            )
            raise exc

        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

        logger.info(
            "http_request_finished",
            status_code=response.status_code,
            duration_ms=duration_ms
        )

        response.headers["X-Request-ID"] = request_id
        return response