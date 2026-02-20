import asyncio

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.user import User

SEED_USERS = [
    ("alice@example.com", "alice", "Loves hiking", 37.77, -122.41),
    ("bob@example.com", "bob", "Coffee and books", 37.75, -122.43),
    ("carol@example.com", "carol", "Runner + traveler", 37.76, -122.42),
]


async def seed() -> None:
    async with AsyncSessionLocal() as db:
        for email, username, bio, lat, lon in SEED_USERS:
            exists = (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()
            if exists:
                continue
            db.add(
                User(
                    email=email,
                    username=username,
                    hashed_password=get_password_hash("password123"),
                    bio=bio,
                    latitude=lat,
                    longitude=lon,
                )
            )
        await db.commit()


if __name__ == "__main__":
    asyncio.run(seed())
