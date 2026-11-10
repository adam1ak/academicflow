import asyncio
import datetime
import logging
from collections import deque
from typing import Optional, List, Dict, Any, AsyncGenerator
from sqlalchemy.orm import Session
from config import settings
import models
import json
import httpx

logger = logging.getLogger("academicflow.advisor")

FALLBACK_MODELS = [
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-3.8-flash"
]

def build_academic_context(db: Session, user_id: int, plan_id: Optional[int] = None) -> str:
    plan_query = db.query(models.Plan).filter(models.Plan.owner_id == user_id)

    if plan_id:
        plan = plan_query.filter(models.Plan.id == plan_id).first()
    else:
        plan = plan_query.order_by(models.Plan.created_at.desc()).first()
    if not plan:
        return "Student currently has no study plans configured"

    completed_subject = [s.name for s in plan.subjects if s.is_completed]
    active_subjects = [s for s in plan.subjects if not s.is_completed]

    bottlenecks = []
    chains_info = []

    for s in plan.subjects:
        if s.dependent_subjects:
            direct_blocked = [dep.name for dep in s.dependent_subjects]
            chains_info.append(f"- {s.name} unlocks {', '.join(direct_blocked)}")

        if not s.is_completed:
            visited = set()
            queue = deque(s.dependent_subjects)

            while queue:
                current = queue.popleft()
                if current.id not in visited:
                    visited.add(current.id)
                    for next_dep in current.dependent_subjects:
                        if next_dep.id not in visited:
                            queue.append(next_dep)

            total_blocked = len(visited)
            if total_blocked >= 2:
                bottlenecks.append(
                    f"- **{s.name}** (CRITICAL: Incomplete! Blocks {total_blocked} future courses in DAG graph)"
                )

    now = datetime.datetime.now()
    deadlines = db.query(models.Deadline).filter(
        models.Deadline.plan_id == plan.id,
        models.Deadline.due_date >= now - datetime.timedelta(days=14)
    ).order_by(models.Deadline.due_date.asc()).limit(8).all()

    context_markdown = [
        f"STUDY PLAN: {plan.name} (Semester: {plan.semester or 'N/A'})",
        f"COMPLETED COURSES: {', '.join(completed_subject) if completed_subject else 'None'}",
        f"ACTIVE COURSES IN PROGRESS: {', '.join([s.name for s in active_subjects]) if active_subjects else 'None'}",
        "\nCRITICAL DAG BOTTLENECK COURSES (Must pass to prevent semester blockage):",
        "\n".join(bottlenecks) if bottlenecks else "No severe bottlenecks detected.",
        "\nCOURSE PREREQUISITE CHAINS:",
        "\n".join(chains_info) if chains_info else "No dependencies configured.",
        "\nUPCOMING DEADLINES & EXAMS (Chronological):",
    ]

    if deadlines:
        for d in deadlines:
            days_left = (d.due_date.date() - now.date()).days
            time_str = "TODAY" if days_left == 0 else (f"in {days_left} days" if days_left > 0 else f"OVERDUE by {abs(days_left)} days")
            context_markdown.append(f"- [{d.type.upper()}] '{d.title}' on {d.due_date.strftime('%Y-%m-%d %H:%M')} ({time_str})")
    else:
        context_markdown.append("No deadlines currently scheduled.")

    return "\n".join(context_markdown)

def get_advisor_system_prompt(academic_context: str) -> str:
    return f"""You are the Academic Advisor for AcademicFlow, an intelligent decision-support for university students. You have real-time access to the student's study plan, DAG prerequisites, bottlenecks, and exam deadlines.
    CURRENT STUDENT CONTEXT:
    {academic_context}
    RULES:
    1. Always prioritize imminent deadlines (especially exams within 7 days) and critical DAG bottlenecks that block future semesters.
    2. Provide concise, structured, and actionable advice with bullet points and bold text (Markdown)
    3. If the student asks what to do this week, analyze their upcoming deadlines and active bottlenecks to recommend a clear study strategy.
    4. If any deadline has the OVERDUE status, explicitly inform the student that this deadline has passed and suggest marking it done or rescheduling. If no upcoming deadlines are found, state this clearly and advise focusing on active coursework.
    5. Reply in the same language as the user query (if user speaks Polish, respond in Polish; if English, respond in English)
    6. Never invent or hallucinate exams or courses that are not listed in the context
    7. STRICTLY NO EMOJIS. Never use emojis, icons, or smileys under any circumstances.
    """

async def stream_gemini_response(
        message: str,
        academic_context: str,
        api_key: Optional[str] = None
) -> AsyncGenerator[str, None]:
    key = api_key or settings.gemini_api_key
    system_prompt = get_advisor_system_prompt(academic_context)

    if not key:
        demo_reply = (
            f"**Academic Advisor (Demo Mode)**:\n\n"
            f"Live AI responses require a `GEMINI_API_KEY` configured in `.env`.\n\n"
            f"Here is your current academic summary:\n{academic_context}"
        )
        for word in demo_reply.split(" "):
            yield f"data: {json.dumps({'token': word + ' '})}\n\n"
        yield "data: [DONE]\n\n"
        return

    headers = {
        "x-goog-api-key": key,
        "Content-Type": "application/json"
    }

    payload = {
        "systemInstruction": {
            "parts": [{"text": system_prompt}]
        },
        "contents": [
            {
                "role": "user",
                "parts": [{"text": message}]
            }
        ],
        "generationConfig": {
            "temperature": 0.4,
            "maxOutputTokens": 2048,
            "thinkingConfig": {
                "thinkingLevel": "minimal"
            }
        }
    }

    logger.info(f"Advisor streaming initiated for message: '{message[:80]}...'")

    try:
        timeout = httpx.Timeout(25.0, connect=5.0, read=25.0)
        async with httpx.AsyncClient(timeout=timeout) as client:
            for model_name in FALLBACK_MODELS:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:streamGenerateContent?alt=sse"

                for attempt in range(2):
                    try:
                        async with client.stream("POST", url, headers=headers, json=payload) as response:
                            if response.status_code == 200:
                                async for line in response.aiter_lines():
                                    if line.startswith("data: "):
                                        raw_data = line[6:].strip()
                                        try:
                                            parsed = json.loads(raw_data)
                                            candidates = parsed.get("candidates", [])
                                            if candidates:
                                                parts = candidates[0].get("content", {}).get("parts", [])
                                                for part in parts:
                                                    if not part.get("thought", False):
                                                        text_part = part.get("text", "")
                                                        if text_part:
                                                            yield f"data: {json.dumps({'token': text_part})}\n\n"
                                        except json.JSONDecodeError:
                                            continue

                                logger.info(f"Advisor streaming finished successfully using {model_name}")
                                yield "data: [DONE]\n\n"
                                return
                            elif response.status_code in (429, 500, 503):
                                logger.warning(f"Model {model_name} attempt {attempt + 1} returned {response.status_code}")
                                if attempt == 0:
                                    await asyncio.sleep(1.0)
                                    continue
                                else:
                                    break
                            else:
                                logger.warning(f"Model {model_name} returned unrecoverable status {response.status_code}")
                                break
                    except (httpx.TimeoutException, httpx.RequestError) as err:
                        logger.warning(f"Network error on {model_name} attempt {attempt + 1}: {str(err)}")
                        if attempt == 0:
                            await asyncio.sleep(1.0)
                            continue
                        else:
                            break

            logger.error("All AI Advisor models exhausted without success")
            yield f"data: {json.dumps({'error': 'AI Advisor is temporarily overloaded. Please try again in a few moments.'})}\n\n"
            yield "data: [DONE]\n\n"

    except Exception as e:
        logger.error(f"Advisor unexpected error: {str(e)}")
        yield f"data: {json.dumps({'error': 'AI Advisor encountered an unexpected error. Please try again.'})}\n\n"
        yield "data: [DONE]\n\n"
