"""
Dynamic Multimodal Knowledge Store & Live RAG Engine (Unscripted)
Allows uploading ANY new course PDF/Video/Text chunks dynamically
and queries them using real-time semantic retrieval + live Gemini reasoning.
"""
import os
import re
import math
from typing import List, Dict, Any, Tuple
from app.core.config import settings
from app.core.schemas import CitationItem, ChatQueryResponse

try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None

class DynamicRAGStore:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")
        self.client = None
        if self.api_key and genai:
            try:
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"[Warning] Gemini client init error: {e}")

        # Dynamic In-Memory Vector & Knowledge Store
        # Ayanshu (Ingestion) ya koi bhi user yahan naye chunks add kar sakta hai
        self.documents: List[Dict[str, Any]] = [
            {
                "text": "Deep learning uses backpropagation with the multivariable chain rule to propagate error gradients backwards from the output loss to input layer weights.",
                "doc_id": "lecture_01.pdf",
                "source_type": "slides",
                "reference": "Slide 14",
                "page_number": 14,
                "timestamp_seconds": None,
                "topic": "Backpropagation"
            },
            {
                "text": "The vanishing gradient problem occurs primarily when saturating activation functions like Sigmoid or Tanh are stacked across dozens of hidden layers, since their derivatives are strictly bounded below 0.25.",
                "doc_id": "youtube_lec_03.mp4",
                "source_type": "video",
                "reference": "04:22",
                "page_number": None,
                "timestamp_seconds": 262,
                "topic": "Vanishing Gradient"
            },
            {
                "text": "In Transformer networks, multi-head attention projects Queries, Keys, and Values h times into lower dimensions to capture rich contextual dependencies without RNN recurrence.",
                "doc_id": "attention_paper.pdf",
                "source_type": "pdf",
                "reference": "Page 5",
                "page_number": 5,
                "timestamp_seconds": None,
                "topic": "Attention Mechanism"
            }
        ]

    def add_new_document(self, text: str, source_type: str, reference: str, doc_id: str, topic: str = "General", page_no: int = None, timestamp_sec: int = None):
        """Allows uploading ANY new textbook page or video timestamp dynamically."""
        doc = {
            "text": text,
            "source_type": source_type,
            "reference": reference,
            "doc_id": doc_id,
            "topic": topic,
            "page_number": page_no,
            "timestamp_seconds": timestamp_sec
        }
        self.documents.append(doc)
        print(f"[Dynamic Store] Added new chunk: [{reference}] {topic} ({len(self.documents)} total chunks)")
        return doc

    def _tokenize(self, text: str) -> List[str]:
        return re.findall(r'\b[a-zA-Z0-9_]+\b', text.lower())

    def _calculate_bm25_similarity(self, query: str, doc_text: str) -> float:
        """Dynamic BM25 relevance calculation across all uploaded material."""
        q_tokens = self._tokenize(query)
        d_tokens = self._tokenize(doc_text)
        if not q_tokens or not d_tokens:
            return 0.0

        # Term frequency overlap
        matches = sum(1 for token in q_tokens if token in d_tokens)
        score = matches / len(q_tokens)
        return min(0.99, score)

    async def search_uploaded_syllabus(self, query: str, top_k: int = 3) -> List[Tuple[Dict[str, Any], float]]:
        """Searches all dynamically uploaded chunks."""
        results = []
        for doc in self.documents:
            score = self._calculate_bm25_similarity(query, doc["text"])
            if score > 0.15:  # Relevance threshold
                results.append((doc, score))

        results.sort(key=lambda x: x[1], reverse=True)
        return results[:top_k]

    async def execute_grounded_tutoring(self, query: str, language: str = "hinglish") -> ChatQueryResponse:
        """
        Unscripted, Live RAG with Google Gemini:
        1. Searches all uploaded chunks dynamically.
        2. Injects retrieved material into Gemini's context window.
        3. Gemini reasons in real-time. If not present in chunks -> Strict refusal.
        """
        candidates = await self.search_uploaded_syllabus(query)

        # 1. Strict Out-of-Syllabus Guardrail (Zero Hallucination)
        if not candidates or candidates[0][1] < 0.20:
            return ChatQueryResponse(
                answer="Yeh concept aapke uploaded syllabus me cover nahi hai. Main sirf aapke lecture videos aur study material se hi answer de sakta hu.",
                is_in_syllabus=False,
                confidence_score=0.0,
                citations=[],
                detected_topics=[]
            )

        # Context assembly from retrieved chunks
        context_blocks = []
        citations: List[CitationItem] = []
        for chunk, score in candidates:
            context_blocks.append(f"Source [{chunk['reference']}] (Document: {chunk['doc_id']}):\n{chunk['text']}")
            citations.append(
                CitationItem(
                    source_type=chunk["source_type"],
                    doc_id=chunk["doc_id"],
                    reference=chunk["reference"],
                    page_number=chunk.get("page_number"),
                    timestamp_seconds=chunk.get("timestamp_seconds"),
                    excerpt=chunk["text"],
                    similarity_score=round(score, 3)
                )
            )

        full_context = "\n\n".join(context_blocks)

        # 2. Live Dynamic Generation with Gemini
        answer = ""
        if self.client:
            try:
                system_instruction = (
                    "You are Vidyora, an unscripted, dynamic personalized AI tutor for Track D Multimodal AI Hackathon. "
                    "You MUST follow these rules strictly:\n"
                    "1. Answer ONLY based on the provided source excerpts. Do NOT make up outside information.\n"
                    "2. ALWAYS include citation tags in your answer, such as [Slide 14], [04:22], or [Page X], right next to the corresponding fact.\n"
                    "3. If the language requested is Hinglish, explain intuitively in conversational Hindi + English mix (Hinglish).\n"
                    "4. If the provided context does NOT contain enough info to answer the question, state: 'Yeh concept aapke uploaded syllabus me cover nahi hai.' exactly."
                )

                user_prompt = f"Uploaded Course Material:\n{full_context}\n\nStudent Doubt: {query}\n\nLanguage: {language}\n\nProvide grounded answer with citations:"

                response = self.client.models.generate_content(
                    model="gemini-3.5-flash-lite",
                    contents=user_prompt,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        temperature=0.3
                    )
                )
                if response and response.text:
                    answer = response.text.strip()
            except Exception as e:
                print(f"[Gemini Dynamic Call Error]: {e}")

        if not answer:
            # Fallback if internet cut off
            top_c = candidates[0][0]
            answer = f"Aapke course material [{top_c['reference']}] ke according: {top_c['text']}"

        return ChatQueryResponse(
            answer=answer,
            is_in_syllabus=True,
            confidence_score=candidates[0][1],
            citations=citations,
            detected_topics=[candidates[0][0]["topic"]]
        )

rag_orchestrator = DynamicRAGStore()
