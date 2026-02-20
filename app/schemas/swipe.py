import uuid
from pydantic import BaseModel


class SwipeRequest(BaseModel):
    swiped_id: uuid.UUID
    liked: bool
