"""
Data Contracts & Pydantic Schemas for Vidyora API
Standardized JSON formats for Frontend (Sraddha), Database (Akshita), & Learner Model.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal

# --- Citation & Grounded Chat Models ---
class CitationItem(BaseModel):
    source_type: Literal["pdf", "video", "slides"]
    doc_id: str
    reference: str  # e.g., 'Slide 14', 'Page 42', '04:22'
    timestamp_seconds: Optional[int] = None
    page_number: Optional[int] = None
    excerpt: str
    similarity_score: float

class ChatQueryRequest(BaseModel):
    query: str
    student_id: str = "student_default"
    course_id: str = "course_ai_101"
    session_id: Optional[str] = "session_001"
    user_language: Optional[str] = "hinglish"  # 'english' or 'hinglish'

class ChatQueryResponse(BaseModel):
    answer: str
    is_in_syllabus: bool
    confidence_score: float
    citations: List[CitationItem]
    detected_topics: List[str] = []

# --- Assessment & Question Models ---
class QuizOption(BaseModel):
    key: str  # 'A', 'B', 'C', 'D'
    text: str

class QuizQuestion(BaseModel):
    question_id: str
    topic: str
    subtopic: str
    question_text: str
    question_type: Literal["mcq", "numerical", "short_answer"]
    difficulty_level: Literal["foundation", "intermediate", "synthesis"]
    options: Optional[List[QuizOption]] = None
    correct_answer: str
    explanation: str
    source_citation: CitationItem
    is_cross_validated: bool = False
    validation_notes: Optional[str] = None

class QuizGenerationRequest(BaseModel):
    student_id: str
    topic: str
    num_questions: int = Field(default=3, ge=1, le=10)
    difficulty_override: Optional[str] = None  # None = dynamic based on BKT mastery

class QuizGenerationResponse(BaseModel):
    topic: str
    student_mastery_level: float
    questions: List[QuizQuestion]

# --- Learner State & BKT Models ---
class AnswerSubmissionRequest(BaseModel):
    student_id: str
    question_id: str
    topic: str
    selected_answer: str
    time_taken_seconds: Optional[int] = 30

class AnswerSubmissionResponse(BaseModel):
    is_correct: bool
    correct_answer: str
    explanation: str
    citation: Optional[CitationItem] = None
    misconception_diagnosis: Optional[str] = None
    prior_mastery: float
    updated_mastery: float
    zpd_recommendation: str  # e.g., "Recommend foundation hint cards" or "Ready for synthesis"

class StudentMasteryOverview(BaseModel):
    student_id: str
    topic_masteries: Dict[str, float]
    overall_progress: float
