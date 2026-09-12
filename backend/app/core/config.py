import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    APP_ENV: str = "development"
    PORT: int = 8000
    DATABASE_URL: str = "postgresql://postgres.ayoqcytmcdpcaqfzihnx:agentforgedatabasepassword@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
    SUPABASE_URL: str = "https://ayoqcytmcdpcaqfzihnx.supabase.co"
    SUPABASE_ANON_KEY: str = ""
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "openai/gpt-oss-120b"
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-3.6-flash"
    EMBEDDING_MODEL: str = "BAAI/bge-small-en-v1.5"
    EMBEDDING_DIM: int = 384
    VAPI_PUBLIC_KEY: Optional[str] = None
    JWT_SECRET: str = "agentforge_super_secure_jwt_secret_key_2026_dev"
    CORS_ORIGINS: str = "*"

    class Config:
        env_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env")
        extra = "allow"

settings = Settings()
