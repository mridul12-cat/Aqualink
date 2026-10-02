"""Configuration settings for AquaLink OneHealth."""
from __future__ import annotations
import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "AquaLink OneHealth"
    API_V1_STR: str = "/api/v1"
    DESCRIPTION: str = "From streams to systems: turning citizen science into actionable One Health intelligence"
    VERSION: str = "1.0.0"
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

settings = Settings()
