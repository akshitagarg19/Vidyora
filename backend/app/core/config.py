"""
Vidyora Core Configuration Module
Handles environment variables, API keys, Model settings, and fallback defaults.
"""
from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Vidyora - Multimodal AI Companion"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Primary LLM (Grounded Tutor & Generation)
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    DEFAULT_LLM_PROVIDER: str = "gemini"  # or 'openai'

    # Secondary LLM (Cross-Validation / Verification via Groq / DeepSeek)
    GROQ_API_KEY: Optional[str] = None
    VERIFIER_MODEL: str = "llama-3.3-70b-versatile"

    # Vector DB (Qdrant)
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    QDRANT_API_KEY: Optional[str] = None
    COLLECTION_NAME: str = "vidyora_multimodal_chunks"

    # Embedding Model Configuration
    EMBEDDING_MODEL_NAME: str = "BAAI/bge-m3"
    EMBEDDING_DIM: int = 1024

    # RAG Retrieval Thresholds (Strict Grounding)
    SIMILARITY_THRESHOLD: float = 0.55  # Below this score, refuse as out-of-syllabus
    HYBRID_ALPHA: float = 0.65          # Dense vs Sparse weighting (0.65 dense, 0.35 BM25)
    TOP_K_CHUNKS: int = 5

    # Redis Cache (Optional for session chat buffer)
    REDIS_URL: str = "redis://localhost:6379/0"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
