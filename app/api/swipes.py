import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import and_, case, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.match import Match
from app.models.swipe import Swipe
from app.models.user import User
from app.schemas.swipe import SwipeRequest
from app.schemas.user import UserOut

router = APIRouter(prefix="/swipes", tags=["swipes"])


@router.get("/recommendations", response_model=list[UserOut])
async def recommendations(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
) -> list[UserOut]:
    swiped_subquery = select(Swipe.swiped_id).where(Swipe.swiper_id == current_user.id)

    distance = case(
        (and_(User.latitude.is_not(None), User.longitude.is_not(None), current_user.latitude is not None, current_user.longitude is not None),
         func.abs(User.latitude - (current_user.latitude or 0)) + func.abs(User.longitude - (current_user.longitude or 0))),
        else_=9999,
    )

    query = (
        select(User)
        .where(User.id != current_user.id)
        .where(User.id.not_in(swiped_subquery))
        .order_by(distance.asc(), User.created_at.desc())
        .limit(20)
    )
    users = (await db.execute(query)).scalars().all()
    return [UserOut.model_validate(u) for u in users]


@router.post("", response_model=dict)
async def swipe(
    payload: SwipeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    if payload.swiped_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot swipe yourself")
    db.add(Swipe(swiper_id=current_user.id, swiped_id=payload.swiped_id, liked=payload.liked))
    is_match = False
    if payload.liked:
        reverse = (
            await db.execute(
                select(Swipe).where(
                    Swipe.swiper_id == payload.swiped_id,
                    Swipe.swiped_id == current_user.id,
                    Swipe.liked.is_(True),
                )
            )
        ).scalar_one_or_none()
        if reverse:
            user_a, user_b = sorted([current_user.id, payload.swiped_id], key=str)
            existing = (
                await db.execute(select(Match).where(Match.user_a_id == user_a, Match.user_b_id == user_b))
            ).scalar_one_or_none()
            if not existing:
                db.add(Match(user_a_id=user_a, user_b_id=user_b))
            is_match = True
    await db.commit()
    return {"matched": is_match}


@router.get("/matches")
async def get_matches(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
) -> list[dict]:
    matches = (
        await db.execute(
            select(Match).where(or_(Match.user_a_id == current_user.id, Match.user_b_id == current_user.id))
        )
    ).scalars().all()
    out = []
    for m in matches:
        other_id = m.user_b_id if m.user_a_id == current_user.id else m.user_a_id
        other = (await db.execute(select(User).where(User.id == other_id))).scalar_one()
        out.append({"match_id": str(m.id), "user": UserOut.model_validate(other).model_dump()})
    return out
