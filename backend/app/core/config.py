from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    MAX_LOGIN_ATTEMPTS: int = 3  # RNF03

    model_config = SettingsConfigDict(env_file=".env")
    CORS_ORIGINS: str = "http://localhost:5173"


settings = Settings()