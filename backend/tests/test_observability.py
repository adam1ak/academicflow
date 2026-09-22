import pytest
from httpx import AsyncClient
from fastapi import status

@pytest.mark.asyncio
async def test_request_generates_x_request_id_header(async_client: AsyncClient):
    """Verify that every HTTP response contains an automatically generated X-Request-ID header."""
    response = await async_client.get("/")

    assert response.status_code == status.HTTP_200_OK
    assert "x-request-id" in response.headers
    assert response.headers["x-request-id"].startswith("req-")

@pytest.mark.asyncio
async def test_request_preserves_client_provided_correlation_id(async_client: AsyncClient):
    """Verify that custom client-provided correlation ID is preserved and propagated back"""
    custom_trace_id = "trace-clinet-custom-998877"

    response = await async_client.get(
        "/",
        headers={"X-Request-ID": custom_trace_id}
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.headers["x-request-id"] == custom_trace_id