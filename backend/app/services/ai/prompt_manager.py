"""
Prompt Manager — Builds context-rich prompts from investigation data.
Includes prompt injection protection and input sanitization.
"""
import re
import json
import logging
from typing import Any

from app.services.ai.prompts import (
    SYSTEM_PROMPT,
    URL_ANALYSIS_PROMPT,
    OCR_ANALYSIS_PROMPT,
    QR_ANALYSIS_PROMPT,
    EMAIL_ANALYSIS_PROMPT,
    PHONE_ANALYSIS_PROMPT,
    IOC_CORRELATION_PROMPT,
    EXECUTIVE_REPORT_PROMPT,
)

logger = logging.getLogger(__name__)

# Maximum length for user-provided inputs before truncation
MAX_INPUT_LENGTH = 3000
MAX_TEXT_LENGTH = 5000


def _sanitize_input(value: Any, max_length: int = MAX_INPUT_LENGTH) -> str:
    """
    Sanitize user-provided input before injection into prompts.
    - Strips control characters
    - Truncates to max_length
    - Escapes prompt injection attempts
    """
    if value is None:
        return "N/A"
    
    text = str(value)
    
    # Strip control characters (except newlines and tabs)
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)
    
    # Defuse common prompt injection patterns
    injection_patterns = [
        (r'(?i)ignore\s+(all\s+)?previous\s+instructions', '[FILTERED]'),
        (r'(?i)you\s+are\s+now\s+', '[FILTERED]'),
        (r'(?i)system\s*:\s*', '[FILTERED]'),
        (r'(?i)forget\s+(everything|all)', '[FILTERED]'),
        (r'(?i)new\s+instructions?\s*:', '[FILTERED]'),
    ]
    for pattern, replacement in injection_patterns:
        text = re.sub(pattern, replacement, text)
    
    # Truncate
    if len(text) > max_length:
        text = text[:max_length] + "... [TRUNCATED]"
    
    return text


def _safe_json(obj: Any, max_length: int = MAX_INPUT_LENGTH) -> str:
    """Serialize an object to a safe JSON string for prompt inclusion."""
    try:
        raw = json.dumps(obj, default=str, ensure_ascii=False)
    except (TypeError, ValueError):
        raw = str(obj)
    return _sanitize_input(raw, max_length)


def build_url_prompt(result_data: dict, threat_intel: str = "") -> list[dict]:
    """Build the prompt messages for URL investigation enrichment."""
    domain_info = result_data.get("domain_info", {})
    ssl_info = result_data.get("ssl_info", {})
    dns = result_data.get("dns", {})

    user_prompt = URL_ANALYSIS_PROMPT.format(
        url=_sanitize_input(result_data.get("url", "N/A")),
        domain=_sanitize_input(result_data.get("domain", "N/A")),
        threat_score=result_data.get("threat_score", 0),
        rules_triggered=_safe_json(result_data.get("rules_triggered", [])),
        root_domain=_sanitize_input(domain_info.get("root_domain", "N/A")),
        registrar=_sanitize_input(domain_info.get("registrar", "N/A")),
        domain_age=_sanitize_input(domain_info.get("domain_age_label", "N/A")),
        creation_date=_sanitize_input(domain_info.get("creation_date", "N/A")),
        registrant_country=_sanitize_input(domain_info.get("registrant_country", "N/A")),
        ssl_valid=ssl_info.get("valid", False),
        ssl_issuer=_sanitize_input(ssl_info.get("issuer", "N/A")),
        ssl_days_remaining=ssl_info.get("days_remaining", "N/A"),
        dns_resolved=dns.get("resolved", False),
        dns_ips=_safe_json(dns.get("A", [])),
        redirect_chain=_safe_json(result_data.get("redirect_chain", [])),
        iocs=_safe_json(result_data.get("iocs", [])),
        threat_intel_context=f"=== THREAT INTELLIGENCE ===\n{threat_intel}" if threat_intel else "",
    )

    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt},
    ]


def build_ocr_prompt(result_data: dict, threat_intel: str = "") -> list[dict]:
    """Build the prompt messages for OCR investigation enrichment."""
    user_prompt = OCR_ANALYSIS_PROMPT.format(
        extracted_text=_sanitize_input(result_data.get("extracted_text", ""), MAX_TEXT_LENGTH),
        confidence_score=result_data.get("confidence_score", 0),
        threat_score=result_data.get("threat_score", 0),
        matched_rules=_safe_json(result_data.get("matched_rules", [])),
        iocs=_safe_json(result_data.get("iocs", [])),
        threat_intel_context=f"=== THREAT INTELLIGENCE ===\n{threat_intel}" if threat_intel else "",
    )

    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt},
    ]


def build_qr_prompt(result_data: dict, threat_intel: str = "") -> list[dict]:
    """Build the prompt messages for QR investigation enrichment."""
    user_prompt = QR_ANALYSIS_PROMPT.format(
        content=_sanitize_input(result_data.get("content", ""), MAX_TEXT_LENGTH),
        qr_type=_sanitize_input(result_data.get("type", "Unknown")),
        metadata=_safe_json(result_data.get("metadata", {})),
        threat_score=result_data.get("threat_score", 0),
        indicators=_safe_json(result_data.get("indicators", [])),
        threat_intel_context=f"=== THREAT INTELLIGENCE ===\n{threat_intel}" if threat_intel else "",
    )

    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt},
    ]


def build_email_prompt(result_data: dict, threat_intel: str = "") -> list[dict]:
    """Build the prompt messages for email investigation enrichment."""
    user_prompt = EMAIL_ANALYSIS_PROMPT.format(
        input_mode=_sanitize_input(result_data.get("input_mode", "Unknown")),
        sender=_sanitize_input(result_data.get("sender", "N/A")),
        sender_domain=_sanitize_input(result_data.get("sender_domain", "N/A")),
        subject=_sanitize_input(result_data.get("subject", "N/A")),
        reply_to=_sanitize_input(result_data.get("reply_to", "N/A")),
        return_path=_sanitize_input(result_data.get("return_path", "N/A")),
        spf=_sanitize_input(result_data.get("spf", "N/A")),
        dkim=_sanitize_input(result_data.get("dkim", "N/A")),
        dmarc=_sanitize_input(result_data.get("dmarc", "N/A")),
        mailed_by=_sanitize_input(result_data.get("mailed_by", "N/A")),
        signed_by=_sanitize_input(result_data.get("signed_by", "N/A")),
        threat_score=result_data.get("threat_score", 0),
        risk_level=_sanitize_input(result_data.get("risk_level", "Unknown")),
        matched_rules=_safe_json(result_data.get("matched_rules", result_data.get("indicators", []))),
        iocs=_safe_json(result_data.get("iocs", result_data.get("extracted_iocs", []))),
        threat_intel_context=f"=== THREAT INTELLIGENCE ===\n{threat_intel}" if threat_intel else "",
    )

    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt},
    ]


def build_phone_prompt(result_data: dict, threat_intel: str = "") -> list[dict]:
    """Build the prompt messages for phone investigation enrichment."""
    user_prompt = PHONE_ANALYSIS_PROMPT.format(
        original_number=_sanitize_input(result_data.get("original_number", "N/A")),
        normalized_number=_sanitize_input(result_data.get("normalized_number", result_data.get("e164_number", "N/A"))),
        country_name=_sanitize_input(result_data.get("country_name", "N/A")),
        region=_sanitize_input(result_data.get("region", "N/A")),
        carrier=_sanitize_input(result_data.get("carrier", "N/A")),
        line_type=_sanitize_input(result_data.get("line_type", "N/A")),
        threat_score=result_data.get("threat_score", 0),
        risk_level=_sanitize_input(result_data.get("risk_level", "Unknown")),
        matched_rules=_safe_json(result_data.get("matched_rules", [])),
        threat_intel_context=f"=== THREAT INTELLIGENCE ===\n{threat_intel}" if threat_intel else "",
    )

    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt},
    ]


def build_correlation_prompt(ioc_data: list[dict]) -> list[dict]:
    """Build the prompt for IOC correlation analysis."""
    formatted_iocs = []
    for ioc in ioc_data[:50]:  # Cap at 50 IOCs to stay within context
        formatted_iocs.append(
            f"- Type: {_sanitize_input(ioc.get('type', 'Unknown'))}, "
            f"Value: {_sanitize_input(ioc.get('value', 'N/A'))}, "
            f"Source: {_sanitize_input(ioc.get('source', 'N/A'))}, "
            f"Threat Score: {ioc.get('threat_score', 'N/A')}"
        )

    user_prompt = IOC_CORRELATION_PROMPT.format(
        ioc_data="\n".join(formatted_iocs),
    )

    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt},
    ]


def build_executive_report_prompt(investigations: list[dict]) -> list[dict]:
    """Build the prompt for executive report generation."""
    summaries = []
    for inv in investigations[:20]:  # Cap at 20 investigations
        summaries.append(
            f"Investigation ID: {inv.get('id', 'N/A')}\n"
            f"  Type: {inv.get('type', 'N/A')}\n"
            f"  Target: {_sanitize_input(inv.get('target', 'N/A'))}\n"
            f"  Threat Score: {inv.get('threat_score', 'N/A')}/100\n"
            f"  Status: {inv.get('status', 'N/A')}\n"
            f"  Date: {inv.get('created_at', 'N/A')}\n"
            f"  AI Summary: {_sanitize_input(inv.get('ai_summary', 'N/A'), 500)}\n"
        )

    user_prompt = EXECUTIVE_REPORT_PROMPT.format(
        investigation_summaries="\n---\n".join(summaries),
    )

    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt},
    ]
