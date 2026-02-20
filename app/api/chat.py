import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.match import Match
from app.models.message import Message
from app.models.user import User
from app.schemas.chat import MessageOut

router = APIRouter(prefix="/chat", tags=["chat"])


@router.get("/{match_id}/messages", response_model=list[MessageOut])
async def list_messages(
    match_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[MessageOut]:
    if not await assert_match_access(match_id, current_user.id, db):
        raise HTTPException(status_code=403, detail="Unauthorized")
    messages = (
        await db.execute(select(Message).where(Message.match_id == match_id).order_by(Message.created_at.asc()))
    ).scalars().all()
    return [MessageOut.model_validate(m) for m in messages]


async def assert_match_access(match_id: uuid.UUID, user_id: uuid.UUID, db: AsyncSession) -> bool:
    match = (
        await db.execute(
            select(Match).where(
                Match.id == match_id,
                ((Match.user_a_id == user_id) | (Match.user_b_id == user_id)),
            )
        )
    ).scalar_one_or_none()
    return match is not None
