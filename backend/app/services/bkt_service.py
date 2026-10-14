"""
Bayesian Knowledge Tracing (BKT) Engine
Implements Track D Learner State formula:
P(L_t | Correct) = (P(L_t) * (1 - P(S))) / (P(L_t) * (1 - P(S)) + (1 - P(L_t)) * P(G))
P(L_t | Incorrect) = (P(L_t) * P(S)) / (P(L_t) * P(S) + (1 - P(L_t)) * (1 - P(G)))
P(L_{t+1}) = P(L_t | Outcome) + (1 - P(L_t | Outcome)) * P(T)
"""
from typing import Dict

class BayesianKnowledgeTracingEngine:
    def __init__(
        self,
        default_l0: float = 0.20,  # Prior probability of knowing concept
        default_t: float = 0.15,   # Probability of learning (transition)
        default_s: float = 0.10,   # Probability of slip (knows, but made mistake)
        default_g: float = 0.25    # Probability of guess (doesn't know, but guessed right)
    ):
        self.p_l0 = default_l0
        self.p_t = default_t
        self.p_s = default_s
        self.p_g = default_g

        # In-memory student state store (Connected to Supabase/Postgres in prod)
        self.student_mastery_store: Dict[str, Dict[str, float]] = {}

    def get_student_topic_mastery(self, student_id: str, topic: str) -> float:
        """Retrieves current mastery or initializes with prior P(L0)."""
        if student_id not in self.student_mastery_store:
            self.student_mastery_store[student_id] = {}
        return self.student_mastery_store[student_id].get(topic, self.p_l0)

    def update_mastery(
        self,
        student_id: str,
        topic: str,
        is_correct: bool,
        custom_s: float = None,
        custom_g: float = None
    ) -> (float, float):
        """
        Calculates posterior probability and updates student state.
        Returns: (prior_mastery, updated_mastery)
        """
        p_l = self.get_student_topic_mastery(student_id, topic)
        p_s = custom_s if custom_s is not None else self.p_s
        p_g = custom_g if custom_g is not None else self.p_g

        # Step 1: Calculate Observation Probability P(L_t | Outcome)
        if is_correct:
            numerator = p_l * (1.0 - p_s)
            denominator = numerator + ((1.0 - p_l) * p_g)
        else:
            numerator = p_l * p_s
            denominator = numerator + ((1.0 - p_l) * (1.0 - p_g))

        # Safeguard against zero division
        p_l_given_obs = numerator / max(denominator, 1e-6)

        # Step 2: Apply Transition to get Next State P(L_{t+1})
        p_next = p_l_given_obs + ((1.0 - p_l_given_obs) * self.p_t)

        # Clamp between 0.01 and 0.99
        updated_mastery = max(0.01, min(0.99, round(p_next, 4)))
        self.student_mastery_store[student_id][topic] = updated_mastery

        return round(p_l, 4), updated_mastery

    def get_zpd_difficulty(self, mastery: float) -> str:
        """
        Vygotsky Zone of Proximal Development (ZPD) selector:
        - Mastery > 0.80 -> Synthesis (Tough problems)
        - Mastery 0.50 - 0.80 -> Intermediate
        - Mastery < 0.50 -> Foundation with Hint Cards
        """
        if mastery >= 0.80:
            return "synthesis"
        elif mastery >= 0.50:
            return "intermediate"
        else:
            return "foundation"

bkt_engine = BayesianKnowledgeTracingEngine()
