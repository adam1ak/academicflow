from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional
from sqlalchemy.orm import Session
import models
from dependencies import get_db, get_current_user
from limiter import limiter
from services.advisor_service import build_academic_context, stream_gemini_response

router = APIRouter(prefix="/api/v1/ai", tags=["ai-advisor"])

class AdvisorChatRequest(BaseModel):
    message: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="Question for the academic advisor"
    )
    plan_id: Optional[int] = Field(
        None,
        description="Optional study plan ID"
    )

@router.post("/advisor/stream")
@limiter.limit("10/minute")
async def stream_advisor_endpoint(
        request: Request,
        payload: AdvisorChatRequest,
        db: Session = Depends(get_db),
        current_user: models.User = Depends(get_current_user)
):
    academic_context = build_academic_context(db, current_user.id, payload.plan_id)

    return StreamingResponse(
        stream_gemini_response(payload.message, academic_context),
        media_type="text/event-stream"
    )