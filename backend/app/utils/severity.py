"""
Severity scoring: combines model confidence + known "red flag" symptoms
to decide how urgently the user should seek care. This is a simple rule
layer on top of the ML prediction, deliberately conservative (it prefers
to over-escalate rather than under-escalate).
"""

RED_FLAG_SYMPTOMS = {
    "chest pain", "shortness of breath", "difficulty breathing",
    "severe headache", "sudden numbness", "trouble speaking",
    "vision loss", "loss of balance", "confusion", "severe abdominal pain",
    "high fever", "uncontrolled bleeding",
}

SEVERITY_RECOMMENDATIONS = {
    "emergency": (
        "Your symptoms may indicate a medical emergency. Please seek "
        "immediate in-person care or contact emergency services now."
    ),
    "high": (
        "Your symptoms suggest a condition that should be evaluated by a "
        "doctor within the next 24 hours."
    ),
    "moderate": (
        "Consider scheduling an appointment with a doctor in the next few "
        "days if symptoms persist or worsen."
    ),
    "low": (
        "Your symptoms appear mild. Home care and monitoring are "
        "reasonable, but consult a doctor if things change or persist."
    ),
}


def assess_severity(symptoms: list[str], confidence: float, is_emergency_flag: bool) -> tuple[str, str]:
    normalized = {s.strip().lower() for s in symptoms}
    red_flags_present = normalized.intersection(RED_FLAG_SYMPTOMS)

    if is_emergency_flag or len(red_flags_present) >= 2:
        level = "emergency"
    elif red_flags_present:
        level = "high"
    elif confidence >= 0.5:
        level = "moderate"
    else:
        level = "low"

    return level, SEVERITY_RECOMMENDATIONS[level]
