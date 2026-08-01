"""
AI Confidence Engine — Combines deterministic and AI scores.
"""
import logging

logger = logging.getLogger(__name__)

# Weight distribution for final confidence calculation
DETERMINISTIC_WEIGHT = 0.60
AI_CONFIDENCE_WEIGHT = 0.30
THREAT_INTEL_WEIGHT = 0.10


def compute_final_confidence(
    deterministic_score: int,
    ai_confidence: int,
    has_threat_intel: bool = False,
    threat_intel_corroborates: bool = False,
) -> dict:
    """
    Compute a weighted final confidence score combining deterministic analysis,
    AI confidence, and threat intelligence corroboration.

    Returns a dict with the final score, breakdown, and risk level.
    """
    # Normalize inputs to 0-100
    det_score = max(0, min(100, deterministic_score or 0))
    ai_score = max(0, min(100, ai_confidence or 50))

    # Threat intel factor
    if has_threat_intel and threat_intel_corroborates:
        intel_factor = max(det_score, ai_score)  # Corroboration boosts confidence
    elif has_threat_intel:
        intel_factor = (det_score + ai_score) / 2  # Neutral intel
    else:
        intel_factor = 50  # No intel available — neutral

    # Weighted calculation
    final_score = int(
        det_score * DETERMINISTIC_WEIGHT
        + ai_score * AI_CONFIDENCE_WEIGHT
        + intel_factor * THREAT_INTEL_WEIGHT
    )
    final_score = max(0, min(100, final_score))

    # Determine risk level
    risk_level = _score_to_risk_level(final_score)

    return {
        "final_score": final_score,
        "risk_level": risk_level,
        "breakdown": {
            "deterministic_score": det_score,
            "deterministic_weight": DETERMINISTIC_WEIGHT,
            "ai_confidence": ai_score,
            "ai_weight": AI_CONFIDENCE_WEIGHT,
            "threat_intel_factor": int(intel_factor),
            "threat_intel_weight": THREAT_INTEL_WEIGHT,
            "has_threat_intel": has_threat_intel,
            "threat_intel_corroborates": threat_intel_corroborates,
        },
    }


def _score_to_risk_level(score: int) -> str:
    """Map a numeric score to a human-readable risk level."""
    if score >= 80:
        return "Critical"
    elif score >= 60:
        return "High"
    elif score >= 40:
        return "Medium"
    elif score >= 20:
        return "Low"
    return "Safe"
