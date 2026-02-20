from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    project_name: str = "Tinder Clone"
    api_prefix: str = "/api"
    secret_key: str = "change-me"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24

    # Use persistent disk path if available (Render), otherwise local file
    database_url: str = "sqlite+aiosqlite:///./tinder.db"
    if os.path.exists("/data"):
        database_url = "sqlite+aiosqlite:////data/tinder.db"

    frontend_url: str = "http://localhost:8000"
    upload_dir: str = "app/static/uploads"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
