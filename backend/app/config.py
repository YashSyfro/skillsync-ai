from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    GROQ_API_KEY: str
    FRONTEND_URL: str = "http://localhost:5173"
    MAX_FILE_SIZE_MB: int = 5

    class Config:
        env_file = ".env"


# Single import-able instance used everywhere
settings = Settings()
