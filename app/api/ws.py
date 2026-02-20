import uuid

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.chat import assert_match_access
from app.core.database import get_db
from app.models.message import Message
from app.schemas.chat import MessageOut
from app.websocket.manager import manager

router = APIRouter(prefix="/ws", tags=["ws"])


@router.websocket("/chat/{match_id}")
async def chat_ws(websocket: WebSocket, match_id: str, token: str, db: AsyncSession = Depends(get_db)) -> None:
    try:
        from jose import jwt

        from app.core.config import settings

        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id = uuid.UUID(payload["sub"])
        match_uuid = uuid.UUID(match_id)
        if not await assert_match_access(match_uuid, user_id, db):
            await websocket.close(code=1008)
            return

        await manager.connect(match_id, websocket)

        while True:
            data = await websocket.receive_json()
            content = str(data.get("content", "")).strip()
            if not content:
                continue

            msg = Message(match_id=match_uuid, sender_id=user_id, content=content)
            db.add(msg)
            await db.commit()
            await db.refresh(msg)
            await manager.broadcast(match_id, MessageOut.model_validate(msg).model_dump(mode="json"))
    except WebSocketDisconnect:
        manager.disconnect(match_id, websocket)
    except Exception:
        manager.disconnect(match_id, websocket)
        await websocket.close(code=1008)
