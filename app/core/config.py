from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    project_name: str = "Tinder Clone"
    api_prefix: str = "/api"
    secret_key: str = "change-me"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/tinder"
    frontend_url: str = "http://localhost:8000"
    upload_dir: str = "app/static/uploads"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
