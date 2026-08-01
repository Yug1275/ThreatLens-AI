"""
AI Recommendation Engine — Generates actionable recommendations and MITRE mappings.
"""
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# ── MITRE ATT&CK Reference Data ──────────────────────────────────────── #

MITRE_TECHNIQUES = {
    # Initial Access
    "T1566": {"name": "Phishing", "tactic": "Initial Access"},
    "T1566.001": {"name": "Spearphishing Attachment", "tactic": "Initial Access"},
    "T1566.002": {"name": "Spearphishing Link", "tactic": "Initial Access"},
    "T1598": {"name": "Phishing for Information", "tactic": "Reconnaissance"},
    "T1189": {"name": "Drive-by Compromise", "tactic": "Initial Access"},
    "T1190": {"name": "Exploit Public-Facing Application", "tactic": "Initial Access"},
    # Execution
    "T1059": {"name": "Command and Scripting Interpreter", "tactic": "Execution"},
    "T1204": {"name": "User Execution", "tactic": "Execution"},
    "T1204.001": {"name": "Malicious Link", "tactic": "Execution"},
    "T1204.002": {"name": "Malicious File", "tactic": "Execution"},
    # Credential Access
    "T1110": {"name": "Brute Force", "tactic": "Credential Access"},
    "T1539": {"name": "Steal Web Session Cookie", "tactic": "Credential Access"},
    "T1557": {"name": "Adversary-in-the-Middle", "tactic": "Credential Access"},
    # Collection
    "T1114": {"name": "Email Collection", "tactic": "Collection"},
    "T1056": {"name": "Input Capture", "tactic": "Collection"},
    # Command and Control
    "T1071": {"name": "Application Layer Protocol", "tactic": "Command and Control"},
    "T1071.001": {"name": "Web Protocols", "tactic": "Command and Control"},
    "T1105": {"name": "Ingress Tool Transfer", "tactic": "Command and Control"},
    # Impact
    "T1486": {"name": "Data Encrypted for Impact", "tactic": "Impact"},
    "T1496": {"name": "Resource Hijacking", "tactic": "Impact"},
    # Reconnaissance
    "T1592": {"name": "Gather Victim Host Information", "tactic": "Reconnaissance"},
    "T1593": {"name": "Search Open Websites/Domains", "tactic": "Reconnaissance"},
    "T1594": {"name": "Search Victim-Owned Websites", "tactic": "Reconnaissance"},
    # Resource Development
    "T1583": {"name": "Acquire Infrastructure", "tactic": "Resource Development"},
    "T1583.001": {"name": "Domains", "tactic": "Resource Development"},
    "T1588": {"name": "Obtain Capabilities", "tactic": "Resource Development"},
}


def get_mitre_info(technique_id: str) -> Optional[dict]:
    """Get MITRE ATT&CK technique info by ID."""
    info = MITRE_TECHNIQUES.get(technique_id)
    if info:
        return {
            "technique_id": technique_id,
            "technique_name": info["name"],
            "tactic": info["tactic"],
            "url": f"https://attack.mitre.org/techniques/{technique_id.replace('.', '/')}/",
        }
    return None


def generate_default_recommendations(
    inv_type: str,
    threat_score: int,
    risk_level: str,
    rules_triggered: list[str] = None,
) -> list[str]:
    """
    Generate baseline recommendations when AI is unavailable.
    These complement the existing deterministic recommendations.
    """
    recommendations = []

    if threat_score >= 75:
        recommendations.append("IMMEDIATE: Block this indicator across all security controls (firewall, proxy, email gateway).")
        recommendations.append("Investigate whether any users have interacted with this indicator.")
        recommendations.append("Submit to your threat intelligence platform for tracking.")
    elif threat_score >= 40:
        recommendations.append("Review this indicator with your security team before taking action.")
        recommendations.append("Monitor for additional suspicious activity related to this indicator.")
        recommendations.append("Consider adding this indicator to a watchlist for ongoing monitoring.")
    else:
        recommendations.append("No immediate action required. This indicator appears to be low risk.")
        recommendations.append("Continue standard monitoring procedures.")

    # Type-specific recommendations
    if inv_type == "URL":
        if threat_score >= 40:
            recommendations.append("Do not visit this URL or enter any credentials.")
            recommendations.append("Check if this URL has been reported to Google Safe Browsing or PhishTank.")
    elif inv_type == "EMAIL":
        if threat_score >= 40:
            recommendations.append("Do not click links or download attachments from this email.")
            recommendations.append("Report this email to your IT security team and delete it.")
    elif inv_type == "PHONE":
        if threat_score >= 40:
            recommendations.append("Do not return calls to this number.")
            recommendations.append("Block this number on your phone system.")
    elif inv_type == "QR":
        if threat_score >= 40:
            recommendations.append("Do not scan this QR code or follow its embedded link.")
    elif inv_type == "OCR":
        if threat_score >= 40:
            recommendations.append("Treat the content of this screenshot as potentially malicious.")
            recommendations.append("Do not follow any instructions or links found in the image.")

    return recommendations


def map_rules_to_mitre(rules_triggered: list[str], inv_type: str) -> list[dict]:
    """
    Map deterministic rule triggers to likely MITRE ATT&CK techniques.
    This provides a baseline mapping even without AI.
    """
    mappings = []
    seen = set()

    rule_to_mitre = {
        # URL-related rules
        "Suspicious keywords detected": ["T1566.002", "T1204.001"],
        "Subdomain impersonates": ["T1583.001", "T1566.002"],
        "Domain is very new": ["T1583.001"],
        "No valid SSL certificate": ["T1557"],
        "URL uses a raw IP address": ["T1071.001"],
        "Shortened URL Detected": ["T1204.001"],
        "Executable Download Link": ["T1204.002", "T1105"],
        "Phishing Terminology": ["T1566.002", "T1598"],
        # Email-related rules
        "SPF Authentication Failed": ["T1566"],
        "DKIM Authentication Failed": ["T1566"],
        "DMARC Authentication Failed": ["T1566"],
        "Mismatch between Envelope From": ["T1566"],
        "Brand Impersonation": ["T1566", "T1598"],
        "Typosquatting Detected": ["T1583.001", "T1566"],
        "Credential Harvesting": ["T1056", "T1539"],
        "Urgent Language": ["T1204"],
        "Financial Request": ["T1566"],
        # OCR/QR rules
        "Embedded JavaScript Detected": ["T1059"],
        "Shell Command Detected": ["T1059"],
        "Credential or Secret Embedded": ["T1539"],
        "SQL Injection Keywords": ["T1190"],
    }

    for rule in (rules_triggered or []):
        for rule_key, technique_ids in rule_to_mitre.items():
            if rule_key.lower() in rule.lower():
                for tid in technique_ids:
                    if tid not in seen:
                        info = get_mitre_info(tid)
                        if info:
                            info["evidence"] = rule
                            mappings.append(info)
                            seen.add(tid)

    return mappings
