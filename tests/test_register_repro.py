import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.main import app
from app.core.database import Base, get_db

@pytest.mark.anyio
async def test_register_500():
    # Use in-memory SQLite for testing to avoid connection issues
    test_engine = create_async_engine("sqlite+aiosqlite:///:memory:", future=True)
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async_session = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)

    async def override_get_db():
        async with async_session() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Test Register
        payload = {"email": "newuser@example.com", "username": "newuser", "password": "password123"}
        resp = await ac.post("/api/auth/register", json=payload)
        assert resp.status_code == 200, f"Response: {resp.text}"

        # Test Duplicate Register
        resp = await ac.post("/api/auth/register", json=payload)
        assert resp.status_code == 400
