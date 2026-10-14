"""
FastAPI Router: Endpoints definition for Vidyora AI Cockpit
Connects Frontend (Sraddha), Ingestion (Ayanshu), and DB (Akshita)
"""
from fastapi import APIRouter, HTTPException, Depends
from app.core.schemas import (
    ChatQueryRequest,
    ChatQueryResponse,
    QuizGenerationRequest,
    QuizGenerationResponse,
    AnswerSubmissionRequest,
    AnswerSubmissionResponse,
    StudentMasteryOverview
)
from app.services.rag_service import rag_orchestrator
from app.services.bkt_service import bkt_engine
from app.services.quiz_service import quiz_validator_service

router = APIRouter()

# ----------------- 1. GROUNDED TUTOR CHAT -----------------
@router.post("/chat", response_model=ChatQueryResponse, summary="Grounded Tutoring Chat with Strict Citations")
async def handle_grounded_chat(req: ChatQueryRequest):
    """
    Core RAG Tutoring Endpoint:
    - Answers questions based strictly on uploaded video & PDF transcripts.
    - Emits jumpable citation tags [Slide 14] or [04:22].
    - Fulfills Track D 20% Rule: Out-of-syllabus refusal.
    """
    try:
        response = await rag_orchestrator.execute_grounded_tutoring(
            query=req.query,
            language=req.user_language or "hinglish"
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG Orchestration failure: {str(e)}")

# ----------------- 2. ADAPTIVE QUIZ GENERATION -----------------
@router.post("/quiz/generate", response_model=QuizGenerationResponse, summary="Generate Cross-Validated Adaptive Quiz")
async def handle_quiz_generation(req: QuizGenerationRequest):
    """
    Adaptive Assessment Generation:
    - Checks student current BKT mastery score.
    - Picks difficulty via Zone of Proximal Development (ZPD).
    - Cross-verifies question keys via secondary LLM (Groq / DeepSeek).
    """
    # 1. Fetch current student mastery
    current_mastery = bkt_engine.get_student_topic_mastery(req.student_id, req.topic)
    
    # 2. Determine ZPD difficulty level
    difficulty = req.difficulty_override or bkt_engine.get_zpd_difficulty(current_mastery)

    # 3. Generate cross-validated questions
    questions = await quiz_validator_service.generate_adaptive_quiz(
        topic=req.topic,
        difficulty=difficulty,
        count=req.num_questions
    )

    return QuizGenerationResponse(
        topic=req.topic,
        student_mastery_level=current_mastery,
        questions=questions
    )

# ----------------- 3. ASSESSMENT SUBMISSION & BKT UPDATE -----------------
@router.post("/quiz/submit", response_model=AnswerSubmissionResponse, summary="Submit Quiz Answer & Update BKT State")
async def handle_answer_submission(req: AnswerSubmissionRequest):
    """
    Student Performance Engine:
    - Evaluates correctness.
    - Dynamically updates topic mastery probability using Bayesian Knowledge Tracing.
    - Provides post-quiz misconception diagnosis with exact lecture excerpt reference.
    """
    # Dummy mock evaluation check (in real setup, compared with question_id)
    is_correct = (req.selected_answer.upper() == "B")

    # Update BKT probabilities
    prior_p, updated_p = bkt_engine.update_mastery(
        student_id=req.student_id,
        topic=req.topic,
        is_correct=is_correct
    )

    # Next ZPD recommendation
    next_diff = bkt_engine.get_zpd_difficulty(updated_p)
    if not is_correct:
        recommendation = "Foundation topic review needed. Check Slide 14 reference notes."
        misconception = "Student confused Euler function with Chain rule gradient flow."
    else:
        recommendation = f"Mastery increased to {int(updated_p*100)}%! Ready for {next_diff} level."
        misconception = None

    return AnswerSubmissionResponse(
        is_correct=is_correct,
        correct_answer="B",
        explanation="Multivariate chain rule allows iterative calculation of partial derivatives across deep layers.",
        misconception_diagnosis=misconception,
        prior_mastery=prior_p,
        updated_mastery=updated_p,
        zpd_recommendation=recommendation
    )

# ----------------- 4. STUDENT MASTERY DASHBOARD -----------------
@router.get("/student/{student_id}/mastery", response_model=StudentMasteryOverview, summary="Get Student Mastery Scores")
async def get_student_mastery(student_id: str):
    """Returns per-topic mastery scores for the Frontend cockpit dashboard."""
    topics = ["Backpropagation", "Vanishing Gradient", "Attention Mechanism", "Transformers"]
    scores = {t: bkt_engine.get_student_topic_mastery(student_id, t) for t in topics}
    overall = round(sum(scores.values()) / len(scores), 2)

    return StudentMasteryOverview(
        student_id=student_id,
        topic_masteries=scores,
        overall_progress=overall
    )
