import os
import uuid

from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.models.photo import Photo
from app.models.user import User
from app.schemas.user import ProfileUpdate, UserOut

router = APIRouter(prefix="/profile", tags=["profile"])


@router.patch("", response_model=UserOut)
async def update_profile(
    payload: ProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserOut:
    for k, v in payload.model_dump(exclude_none=True).items():
        setattr(current_user, k, v)
    await db.commit()
    await db.refresh(current_user)
    return UserOut.model_validate(current_user)


@router.post("/photo")
async def upload_photo(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    os.makedirs(settings.upload_dir, exist_ok=True)
    ext = file.filename.split(".")[-1] if file.filename and "." in file.filename else "jpg"
    name = f"{uuid.uuid4()}.{ext}"
    save_path = os.path.join(settings.upload_dir, name)
    with open(save_path, "wb") as f:
        f.write(await file.read())
    photo = Photo(user_id=current_user.id, url=f"/uploads/{name}")
    db.add(photo)
    await db.commit()
    return {"url": photo.url}
