"""
Prompt Templates — Phase 9 AI Intelligence Engine
Reusable, structured prompt templates for each investigation type.
All prompts instruct the LLM to return structured JSON.
"""

# ── Common System Prompt ──────────────────────────────────────────────── #

SYSTEM_PROMPT = """You are ThreatLens AI, an expert cybersecurity threat analyst. You analyze investigation data and provide structured threat intelligence assessments.

RULES:
1. Always respond with valid JSON only — no markdown, no explanation outside JSON.
2. Be factual and precise. Do not fabricate threat data.
3. Base your analysis on the provided investigation data.
4. If you are uncertain, reflect that in your confidence_score (lower score = less certain).
5. MITRE ATT&CK mappings should reference real technique IDs (e.g., T1566, T1071).
6. Recommendations should be actionable and specific.
7. Never include executable code in your responses.
"""

# ── URL Analysis Prompt ───────────────────────────────────────────────── #

URL_ANALYSIS_PROMPT = """Analyze this URL investigation data and provide a comprehensive threat intelligence assessment.

=== INVESTIGATION DATA ===
URL: {url}
Domain: {domain}
Threat Score (Deterministic): {threat_score}/100
Rules Triggered: {rules_triggered}

Domain Info:
- Root Domain: {root_domain}
- Registrar: {registrar}
- Domain Age: {domain_age}
- Creation Date: {creation_date}
- Registrant Country: {registrant_country}

SSL Info:
- Valid: {ssl_valid}
- Issuer: {ssl_issuer}
- Days Remaining: {ssl_days_remaining}

DNS:
- Resolved: {dns_resolved}
- IPs: {dns_ips}

Redirect Chain: {redirect_chain}
IOCs Detected: {iocs}

{threat_intel_context}
=== END DATA ===

Respond with this exact JSON structure:
{{
    "executive_summary": "2-3 sentence non-technical summary for executives",
    "technical_summary": "Detailed technical analysis of the URL and its infrastructure",
    "threat_explanation": "Explain what type of threat this URL represents (if any) in plain language",
    "attack_narrative": "If malicious, describe the likely attack chain. If benign, state 'No attack detected.'",
    "confidence_score": 0-100,
    "risk_level": "Critical|High|Medium|Low|Safe",
    "mitre_mapping": [
        {{
            "technique_id": "TXXXX",
            "technique_name": "Name",
            "tactic": "Tactic Name",
            "description": "How this technique applies"
        }}
    ],
    "threat_indicators": ["List of specific threat indicators found"],
    "recommendations": ["Actionable recommendation 1", "Actionable recommendation 2"],
    "campaign_info": null
}}"""


# ── OCR Analysis Prompt ───────────────────────────────────────────────── #

OCR_ANALYSIS_PROMPT = """Analyze this OCR investigation data from a screenshot and provide a threat intelligence assessment.

=== INVESTIGATION DATA ===
Extracted Text: {extracted_text}
OCR Confidence: {confidence_score}%
Threat Score (Deterministic): {threat_score}/100
Matched Rules: {matched_rules}
IOCs Detected: {iocs}

{threat_intel_context}
=== END DATA ===

Respond with this exact JSON structure:
{{
    "executive_summary": "2-3 sentence non-technical summary about this screenshot content",
    "technical_summary": "Detailed analysis of the text content and embedded threats",
    "threat_explanation": "Explain what social engineering or threat technique this screenshot represents",
    "attack_narrative": "Describe the likely attack scenario if the user interacts with this content",
    "confidence_score": 0-100,
    "risk_level": "Critical|High|Medium|Low|Safe",
    "mitre_mapping": [
        {{
            "technique_id": "TXXXX",
            "technique_name": "Name",
            "tactic": "Tactic Name",
            "description": "How this technique applies"
        }}
    ],
    "threat_indicators": ["List of specific threat indicators found in the text"],
    "recommendations": ["Actionable recommendation 1", "Actionable recommendation 2"],
    "campaign_info": null
}}"""


# ── QR Code Analysis Prompt ───────────────────────────────────────────── #

QR_ANALYSIS_PROMPT = """Analyze this QR code investigation data and provide a threat intelligence assessment.

=== INVESTIGATION DATA ===
QR Content: {content}
QR Type: {qr_type}
Metadata: {metadata}
Threat Score (Deterministic): {threat_score}/100
Security Indicators: {indicators}

{threat_intel_context}
=== END DATA ===

Respond with this exact JSON structure:
{{
    "executive_summary": "2-3 sentence non-technical summary about this QR code",
    "technical_summary": "Detailed technical analysis of the QR payload and its purpose",
    "threat_explanation": "Explain the risk of scanning/using this QR code",
    "attack_narrative": "If malicious, describe how this QR code could be weaponized. If safe, state 'No attack detected.'",
    "confidence_score": 0-100,
    "risk_level": "Critical|High|Medium|Low|Safe",
    "mitre_mapping": [
        {{
            "technique_id": "TXXXX",
            "technique_name": "Name",
            "tactic": "Tactic Name",
            "description": "How this technique applies"
        }}
    ],
    "threat_indicators": ["List of specific threat indicators found"],
    "recommendations": ["Actionable recommendation 1", "Actionable recommendation 2"],
    "campaign_info": null
}}"""


# ── Email Analysis Prompt ─────────────────────────────────────────────── #

EMAIL_ANALYSIS_PROMPT = """Analyze this email investigation data and provide a comprehensive phishing/threat assessment.

=== INVESTIGATION DATA ===
Input Mode: {input_mode}
Sender: {sender}
Sender Domain: {sender_domain}
Subject: {subject}
Reply-To: {reply_to}
Return-Path: {return_path}

Authentication:
- SPF: {spf}
- DKIM: {dkim}
- DMARC: {dmarc}
- Mailed By: {mailed_by}
- Signed By: {signed_by}

Threat Score (Deterministic): {threat_score}/100
Risk Level: {risk_level}
Matched Rules: {matched_rules}
IOCs: {iocs}

{threat_intel_context}
=== END DATA ===

Respond with this exact JSON structure:
{{
    "executive_summary": "2-3 sentence non-technical summary for a non-technical audience",
    "technical_summary": "Detailed technical analysis of the email headers and authentication",
    "threat_explanation": "Explain what type of email threat this is (phishing, BEC, spam, etc.) in plain language",
    "attack_narrative": "Describe the full attack chain: how the attacker crafted this email and what they intend",
    "confidence_score": 0-100,
    "risk_level": "Critical|High|Medium|Low|Safe",
    "mitre_mapping": [
        {{
            "technique_id": "TXXXX",
            "technique_name": "Name",
            "tactic": "Tactic Name",
            "description": "How this technique applies to this email"
        }}
    ],
    "threat_indicators": ["List of specific threat indicators found"],
    "recommendations": ["Actionable recommendation 1", "Actionable recommendation 2"],
    "campaign_info": null
}}"""


# ── Phone Analysis Prompt ─────────────────────────────────────────────── #

PHONE_ANALYSIS_PROMPT = """Analyze this phone number investigation data and provide a threat intelligence assessment.

=== INVESTIGATION DATA ===
Original Number: {original_number}
Normalized (E.164): {normalized_number}
Country: {country_name}
Region: {region}
Carrier: {carrier}
Line Type: {line_type}
Threat Score (Deterministic): {threat_score}/100
Risk Level: {risk_level}
Matched Rules: {matched_rules}

{threat_intel_context}
=== END DATA ===

Respond with this exact JSON structure:
{{
    "executive_summary": "2-3 sentence assessment of this phone number's risk profile",
    "technical_summary": "Technical details about the number's infrastructure and carrier",
    "threat_explanation": "Explain why this number may or may not be a threat",
    "attack_narrative": "If suspicious, describe common scam patterns associated with this type of number",
    "confidence_score": 0-100,
    "risk_level": "Critical|High|Medium|Low|Safe",
    "mitre_mapping": [
        {{
            "technique_id": "TXXXX",
            "technique_name": "Name",
            "tactic": "Tactic Name",
            "description": "How this technique applies"
        }}
    ],
    "threat_indicators": ["List of specific threat indicators found"],
    "recommendations": ["Actionable recommendation 1", "Actionable recommendation 2"],
    "campaign_info": null
}}"""


# ── IOC Correlation Prompt ────────────────────────────────────────────── #

IOC_CORRELATION_PROMPT = """Analyze these Indicators of Compromise (IOCs) from multiple investigations and identify correlations, campaigns, and threat patterns.

=== IOC DATA ===
{ioc_data}
=== END DATA ===

Look for:
1. Related IOCs that may belong to the same campaign
2. Common infrastructure (shared IPs, domains, registrars)
3. Known threat actor patterns
4. Attack progression patterns

Respond with this exact JSON structure:
{{
    "correlation_summary": "Overall summary of the correlation analysis",
    "ioc_clusters": [
        {{
            "cluster_name": "Name for this group of related IOCs",
            "iocs": ["ioc1", "ioc2"],
            "relationship": "How these IOCs are related",
            "confidence": 0-100
        }}
    ],
    "campaign_indicators": [
        {{
            "campaign_name": "Suspected campaign name or identifier",
            "description": "Description of the suspected campaign",
            "related_iocs": ["ioc1", "ioc2"]
        }}
    ],
    "threat_actors": [
        {{
            "actor_name": "Known or suspected threat actor",
            "confidence": 0-100,
            "evidence": "What evidence suggests this actor"
        }}
    ],
    "risk_level": "Critical|High|Medium|Low",
    "recommendations": ["Recommendation 1", "Recommendation 2"]
}}"""


# ── Executive Report Prompt ───────────────────────────────────────────── #

EXECUTIVE_REPORT_PROMPT = """Generate a comprehensive executive threat intelligence report based on these investigation findings.

=== INVESTIGATION SUMMARIES ===
{investigation_summaries}
=== END DATA ===

Generate a report suitable for executive leadership and security decision-makers.

Respond with this exact JSON structure:
{{
    "executive_summary": "3-5 sentence high-level overview for C-level executives",
    "technical_findings": [
        {{
            "finding": "Description of the finding",
            "severity": "Critical|High|Medium|Low",
            "evidence": "Supporting evidence"
        }}
    ],
    "indicators_of_compromise": [
        {{
            "type": "URL|Domain|IP|Email|Phone",
            "value": "The IOC value",
            "context": "Why this IOC matters"
        }}
    ],
    "mitre_mapping": [
        {{
            "technique_id": "TXXXX",
            "technique_name": "Name",
            "tactic": "Tactic Name",
            "description": "How this technique was observed"
        }}
    ],
    "risk_rating": "Critical|High|Medium|Low",
    "recommendations": [
        {{
            "priority": "Immediate|Short-term|Long-term",
            "action": "Specific recommended action",
            "rationale": "Why this action is recommended"
        }}
    ],
    "next_steps": ["Next step 1", "Next step 2"]
}}"""
