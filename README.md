# 🎓 Vidyora — Personalized Tutoring & Adaptive Learning Companion

> **Multimodal AI Hackathon 2026 • Track D (IIT Mandi)**  
> An AI-powered study companion that unifies lecture videos, textbooks, and slide decks into a source-grounded knowledge base, featuring Bayesian Knowledge Tracing (BKT) and adaptive assessments.

---

## 📌 Problem Statement & Overview

Students often struggle with fragmented course materials (scattered across YouTube lectures, PDFs, and slide decks) and generic AI chatbots that hallucinate. 

**Vidyora** solves this by:
1. **Multimodal Ingestion**: Auto-extracting and indexing text, diagrams, formulas, and video audio without manual preprocessing.
2. **Strict Source Grounding**: Answering queries with exact video timestamps (`[04:22]`) and PDF page citations (`[Page 14]`), with zero tolerance for hallucinations (explicit out-of-syllabus refusal).
3. **Adaptive Learner Engine**: Modeling student concept mastery dynamically using Bayesian Knowledge Tracing (BKT) and generating targeted mock tests with dual-model cross-validation.

---

## 🏗️ System Architecture

```text
       [ Multimodal Ingestion Pipeline ]
  (PDFs, Slides, YouTube / MP4 Video Lectures)
                      │
   ├── PyMuPDF / OCR  ───────────► Structured Text & Diagrams
   └── Whisper / yt-dlp ─────────► Timestamped Audio Transcripts
                      │
                      ▼
            [ Hybrid Vector Store ]
       Qdrant (Dense + BM25) + Concept Graph (NetworkX)
                      │
     ┌────────────────┴────────────────┐
     ▼                                 ▼
[ Grounded Tutor Chat ]       [ Adaptive Assessment Engine ]
- Source Citation UI          - Bayesian Knowledge Tracing (BKT)
- Timestamp & Slide Jump      - Diagnostic Tree Intake Quiz
- Out-of-Syllabus Guardrail   - Dual-Model Cross-Validation (Groq/DeepSeek)

TEAM MATES(DURGESHNANDANI,AYANSHU,AKSHITA,UTKARSH)
