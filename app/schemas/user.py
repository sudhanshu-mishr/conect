import uuid
from pydantic import BaseModel


class UserOut(BaseModel):
    id: uuid.UUID
    email: str
    username: str
    bio: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    is_premium: bool

    model_config = {"from_attributes": True}


class ProfileUpdate(BaseModel):
    bio: str | None = None
    latitude: float | None = None
    longitude: float | None = None
