"""
AI Response Parser — Validates and parses LLM JSON responses.
Handles malformed output gracefully with fallback parsing.
"""
import json
import re
import logging
from typing import Any, Optional

logger = logging.getLogger(__name__)

# Fields we expect from investigation enrichment prompts
EXPECTED_ENRICHMENT_FIELDS = {
    "executive_summary",
    "technical_summary",
    "threat_explanation",
    "attack_narrative",
    "confidence_score",
    "mitre_mapping",
    "recommendations",
}

# Patterns that should never appear in AI output
DANGEROUS_PATTERNS = [
    r"<script\b",
    r"javascript:",
    r"\beval\s*\(",
    r"\bexec\s*\(",
    r"__import__",
    r"os\.system",
    r"subprocess",
]


def sanitize_output(text: str) -> str:
    """Remove potentially dangerous patterns from AI output text."""
    if not isinstance(text, str):
        return str(text) if text is not None else ""
    for pattern in DANGEROUS_PATTERNS:
        text = re.sub(pattern, "[REDACTED]", text, flags=re.IGNORECASE)
    return text.strip()


def _sanitize_recursive(obj: Any) -> Any:
    """Recursively sanitize all string values in a nested structure."""
    if isinstance(obj, str):
        return sanitize_output(obj)
    elif isinstance(obj, dict):
        return {k: _sanitize_recursive(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [_sanitize_recursive(item) for item in obj]
    return obj


def extract_json_from_response(raw_text: str) -> Optional[dict]:
    """
    Extract a JSON object from LLM response text.
    Handles cases where the LLM wraps JSON in markdown code blocks or adds preamble.
    """
    if not raw_text:
        return None

    # Strategy 1: Try direct JSON parse
    try:
        return json.loads(raw_text)
    except json.JSONDecodeError:
        pass

    # Strategy 2: Extract from markdown code block ```json ... ```
    json_block = re.search(r"```(?:json)?\s*\n?(.*?)\n?\s*```", raw_text, re.DOTALL)
    if json_block:
        try:
            return json.loads(json_block.group(1))
        except json.JSONDecodeError:
            pass

    # Strategy 3: Find the first { ... } block (greedy, outermost braces)
    brace_match = re.search(r"\{.*\}", raw_text, re.DOTALL)
    if brace_match:
        try:
            return json.loads(brace_match.group(0))
        except json.JSONDecodeError:
            pass

    # Strategy 4: Try to fix common JSON issues (trailing commas, single quotes)
    cleaned = raw_text.strip()
    cleaned = re.sub(r",\s*([}\]])", r"\1", cleaned)  # Remove trailing commas
    cleaned = cleaned.replace("'", '"')  # Single to double quotes
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    logger.warning("Failed to extract JSON from AI response (length=%d)", len(raw_text))
    return None


def parse_enrichment_response(raw_text: str) -> dict:
    """
    Parse an AI enrichment response into a validated, sanitized dictionary.
    Returns a well-structured dict even if parsing partially fails.
    """
    parsed = extract_json_from_response(raw_text)

    if parsed is None:
        logger.warning("AI response could not be parsed as JSON, creating fallback")
        return _create_fallback_response(raw_text)

    # Sanitize all string values
    parsed = _sanitize_recursive(parsed)

    # Validate and normalize expected fields
    result = {}

    # Executive Summary
    result["executive_summary"] = parsed.get("executive_summary", "AI analysis completed but no executive summary was generated.")

    # Technical Summary
    result["technical_summary"] = parsed.get("technical_summary", "")

    # Threat Explanation
    result["threat_explanation"] = parsed.get("threat_explanation", "")

    # Attack Narrative
    result["attack_narrative"] = parsed.get("attack_narrative", "")

    # Confidence Score (0-100)
    confidence = parsed.get("confidence_score", 50)
    if isinstance(confidence, (int, float)):
        result["confidence_score"] = max(0, min(100, int(confidence)))
    else:
        result["confidence_score"] = 50

    # MITRE ATT&CK Mapping
    mitre = parsed.get("mitre_mapping", [])
    if isinstance(mitre, list):
        result["mitre_mapping"] = [
            {
                "technique_id": str(m.get("technique_id", "N/A")),
                "technique_name": str(m.get("technique_name", "Unknown")),
                "tactic": str(m.get("tactic", "Unknown")),
                "description": str(m.get("description", "")),
            }
            for m in mitre
            if isinstance(m, dict)
        ]
    else:
        result["mitre_mapping"] = []

    # Recommendations
    recommendations = parsed.get("recommendations", [])
    if isinstance(recommendations, list):
        result["recommendations"] = [str(r) for r in recommendations if r]
    elif isinstance(recommendations, str):
        result["recommendations"] = [recommendations]
    else:
        result["recommendations"] = []

    # Risk Level
    result["risk_level"] = parsed.get("risk_level", "Unknown")

    # Threat Indicators (if provided)
    indicators = parsed.get("threat_indicators", [])
    if isinstance(indicators, list):
        result["threat_indicators"] = [str(i) for i in indicators if i]
    else:
        result["threat_indicators"] = []

    # Campaign info (if provided)
    result["campaign_info"] = parsed.get("campaign_info", None)

    # AI status
    result["ai_status"] = "completed"

    return result


def parse_correlation_response(raw_text: str) -> dict:
    """Parse an IOC correlation response."""
    parsed = extract_json_from_response(raw_text)
    if parsed is None:
        return {
            "correlation_summary": "Correlation analysis could not be completed.",
            "ioc_clusters": [],
            "campaign_indicators": [],
            "threat_actors": [],
            "recommendations": [],
            "ai_status": "partial",
        }

    parsed = _sanitize_recursive(parsed)

    return {
        "correlation_summary": parsed.get("correlation_summary", ""),
        "ioc_clusters": parsed.get("ioc_clusters", []),
        "campaign_indicators": parsed.get("campaign_indicators", []),
        "threat_actors": parsed.get("threat_actors", []),
        "recommendations": parsed.get("recommendations", []),
        "risk_level": parsed.get("risk_level", "Unknown"),
        "ai_status": "completed",
    }


def parse_executive_report_response(raw_text: str) -> dict:
    """Parse an executive report response."""
    parsed = extract_json_from_response(raw_text)
    if parsed is None:
        return {
            "executive_summary": "Report generation encountered an issue.",
            "technical_findings": [],
            "indicators_of_compromise": [],
            "mitre_mapping": [],
            "risk_rating": "Unknown",
            "recommendations": [],
            "next_steps": [],
            "ai_status": "partial",
        }

    parsed = _sanitize_recursive(parsed)

    return {
        "executive_summary": parsed.get("executive_summary", ""),
        "technical_findings": parsed.get("technical_findings", []),
        "indicators_of_compromise": parsed.get("indicators_of_compromise", []),
        "mitre_mapping": parsed.get("mitre_mapping", []),
        "risk_rating": parsed.get("risk_rating", "Unknown"),
        "recommendations": parsed.get("recommendations", []),
        "next_steps": parsed.get("next_steps", []),
        "ai_status": "completed",
    }


def _create_fallback_response(raw_text: str) -> dict:
    """Create a fallback response when JSON parsing completely fails."""
    # Try to extract useful text even if not JSON
    summary = raw_text[:500] if raw_text else "AI analysis was unable to produce a structured response."

    return {
        "executive_summary": summary,
        "technical_summary": "",
        "threat_explanation": "",
        "attack_narrative": "",
        "confidence_score": 30,
        "mitre_mapping": [],
        "recommendations": ["Review the investigation results manually for a complete assessment."],
        "risk_level": "Unknown",
        "threat_indicators": [],
        "campaign_info": None,
        "ai_status": "partial",
    }
