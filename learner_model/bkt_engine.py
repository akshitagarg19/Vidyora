"""
Member 3: Bayesian Knowledge Tracing (BKT) Model
Calculates dynamically student topic mastery probability after every quiz attempt.
Formula:
    P(L_t | Correct) = (P(L_t) * (1 - P(S))) / (P(L_t) * (1 - P(S)) + (1 - P(L_t)) * P(G))
    P(L_t | Incorrect) = (P(L_t) * P(S)) / (P(L_t) * P(S) + (1 - P(L_t)) * (1 - P(G)))
    P(L_{t+1}) = P(L_t | Outcome) + (1 - P(L_t | Outcome)) * P(T)
"""

class BKTEngine:
    def __init__(self, p_l0: float = 0.2, p_t: float = 0.15, p_s: float = 0.1, p_g: float = 0.25):
        self.p_l0 = p_l0  # Initial Knowledge
        self.p_t = p_t    # Probability of Transition (learning)
        self.p_s = p_s    # Probability of Slip (accidental mistake)
        self.p_g = p_g    # Probability of Guess

    def update_mastery(self, p_prior: float, is_correct: bool) -> float:
        """Updates probability of mastery given answer correctness."""
        if is_correct:
            p_evidence = (p_prior * (1 - self.p_s)) / (
                p_prior * (1 - self.p_s) + (1 - p_prior) * self.p_g
            )
        else:
            p_evidence = (p_prior * self.p_s) / (
                p_prior * self.p_s + (1 - p_prior) * (1 - self.p_g)
            )
        
        # Next state probability
        p_posterior = p_evidence + (1 - p_evidence) * self.p_t
        return round(p_posterior, 4)

if __name__ == "__main__":
    bkt = BKTEngine()
    mastery = 0.2
    print(f"Initial mastery: {mastery}")
    mastery = bkt.update_mastery(mastery, is_correct=True)
    print(f"Mastery after 1 correct answer: {mastery}")
    mastery = bkt.update_mastery(mastery, is_correct=False)
    print(f"Mastery after 1 wrong answer: {mastery}")
