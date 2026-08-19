from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.api.dependencies import get_db
from app.models.models import AIConversation
from app.schemas.schemas import AIChatRequest, AIChatResponse
from app.ai.gemini_service import generate_ai_response

router = APIRouter()

@router.post("/ai/chat", response_model=AIChatResponse)
def ai_chat(payload: AIChatRequest, db: Session = Depends(get_db)):
    if not payload.user_message or not payload.user_message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User message cannot be empty."
        )

    ai_resp_text = generate_ai_response(payload.user_message, db)
    
    # Save conversation log to database
    conversation = AIConversation(
        user_message=payload.user_message.strip(),
        ai_response=ai_resp_text,
        timestamp=datetime.now(timezone.utc)
    )
    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return AIChatResponse.model_validate(conversation)
