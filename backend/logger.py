import logging
import sys
import structlog

def setup_logging():
    """Configures structured JSON logging pipeline for FastAPI application."""

    processors = [
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.format_exc_info,
        structlog.processors.JSONRenderer()
    ]

    structlog.configure(
        processors=processors,
        logger_factory=structlog.PrintLoggerFactory(sys.stdout),
        wrapper_class=structlog.make_filtering_bound_logger(logging.INFO),
        cache_logger_on_first_use=True,
    )

logger = structlog.get_logger()