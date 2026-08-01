"""
AI Service — Main facade for all AI-powered enrichment.
Phase 9 AI Intelligence Engine.

This is the single entry point for all AI enrichment. It orchestrates:
  1. Cache lookup
  2. Tavily threat intel search (conditional)
  3. Prompt building
  4. Groq LLM call
  5. Response parsing
  6. Confidence computation
  7. Cache storage

CRITICAL: If any AI step fails, the service returns None so the caller
can proceed with deterministic results only.
"""
import logging
import json
from typing import Optional

from app.core.config import settings
from app.services.ai.providers.groq_provider import GroqProvider
from app.services.ai.providers.tavily_provider import TavilyProvider
from app.services.ai.prompt_manager import (
    build_url_prompt,
    build_ocr_prompt,
    build_qr_prompt,
    build_email_prompt,
    build_phone_prompt,
    build_correlation_prompt,
    build_executive_report_prompt,
)
from app.services.ai.response_parser import (
    parse_enrichment_response,
    parse_correlation_response,
    parse_executive_report_response,
)
from app.services.ai.ai_cache import ai_cache
from app.services.ai.confidence_engine import compute_final_confidence
from app.services.ai.recommendation_engine import (
    generate_default_recommendations,
    map_rules_to_mitre,
)
from app.services.ai.ioc_correlator import (
    aggregate_iocs_from_investigations,
    find_basic_correlations,
)

logger = logging.getLogger(__name__)

# Threshold: only call Tavily when threat score exceeds this
TAVILY_THRESHOLD = 20

# Prompt builder dispatch table
_PROMPT_BUILDERS = {
    "URL": build_url_prompt,
    "OCR": build_ocr_prompt,
    "QR": build_qr_prompt,
    "EMAIL": build_email_prompt,
    "PHONE": build_phone_prompt,
}


class AIService:
    """
    Singleton AI Service facade.
    Provides enrichment, correlation, and report generation.
    """

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True

        # Initialize providers
        self._groq = GroqProvider(
            api_key=settings.GROQ_API_KEY or "",
            model=getattr(settings, "AI_MODEL", "llama-3.3-70b-versatile"),
            timeout=getattr(settings, "AI_TIMEOUT", 30),
            max_retries=getattr(settings, "AI_MAX_RETRIES", 3),
        )
        self._tavily = TavilyProvider(
            api_key=settings.TAVILY_API_KEY or "",
        )
        self._ai_enabled = getattr(settings, "AI_ENABLED", True)

        logger.info(
            "AI Service initialized: enabled=%s, model=%s",
            self._ai_enabled, self._groq.model,
        )

    @property
    def is_configured(self) -> bool:
        """Check if AI is properly configured with valid API keys."""
        groq_key = settings.GROQ_API_KEY or ""
        return (
            self._ai_enabled
            and bool(groq_key)
            and not groq_key.startswith("your_")
        )

    def enrich_investigation(
        self, inv_type: str, target: str, result_data: dict
    ) -> Optional[dict]:
        """
        Enrich investigation results with AI analysis.
        
        Args:
            inv_type: Investigation type (URL, OCR, QR, EMAIL, PHONE)
            target: The investigation target (URL, filename, email, phone number)
            result_data: The deterministic investigation results
            
        Returns:
            AI enrichment dict or None if AI is unavailable/fails
        """
        if not self.is_configured:
            logger.debug("AI not configured, returning default enrichment for %s", inv_type)
            return self._default_enrichment(inv_type, target, result_data)

        try:
            # 1. Check cache
            result_hash = ai_cache.hash_result(result_data)
            cached = ai_cache.get(inv_type, target, result_hash)
            if cached:
                return cached

            # 2. Get Tavily threat intel (conditional on threat score)
            threat_score = result_data.get("threat_score", 0)
            threat_intel = None
            if threat_score >= TAVILY_THRESHOLD:
                search_query = self._build_tavily_query(inv_type, target, result_data)
                threat_intel = self._tavily.search_threat_intel(search_query)

            # 3. Build prompt
            prompt_builder = _PROMPT_BUILDERS.get(inv_type)
            if not prompt_builder:
                logger.warning("No prompt builder for type: %s", inv_type)
                return self._default_enrichment(inv_type, target, result_data)

            messages = prompt_builder(result_data, threat_intel or "")

            # 4. Call Groq LLM
            raw_response = self._groq.chat(messages)
            if raw_response is None:
                logger.warning("Groq returned no response for %s/%s", inv_type, target[:50])
                return self._default_enrichment(inv_type, target, result_data)

            # 5. Parse response
            ai_analysis = parse_enrichment_response(raw_response)

            # 6. Compute final confidence
            confidence_result = compute_final_confidence(
                deterministic_score=threat_score,
                ai_confidence=ai_analysis.get("confidence_score", 50),
                has_threat_intel=threat_intel is not None,
                threat_intel_corroborates=self._check_corroboration(ai_analysis, threat_intel),
            )
            ai_analysis["confidence_breakdown"] = confidence_result
            ai_analysis["final_threat_score"] = confidence_result["final_score"]
            ai_analysis["final_risk_level"] = confidence_result["risk_level"]

            # 7. Cache the result
            ai_cache.set(inv_type, target, result_hash, ai_analysis)

            logger.info(
                "AI enrichment completed for %s/%s: confidence=%d, risk=%s",
                inv_type, target[:50],
                ai_analysis.get("confidence_score", 0),
                ai_analysis.get("final_risk_level", "Unknown"),
            )
            return ai_analysis

        except Exception as e:
            logger.error("AI enrichment failed for %s/%s: %s", inv_type, target[:50], str(e))
            return self._default_enrichment(inv_type, target, result_data)

    def correlate_iocs(self, investigations: list[dict]) -> dict:
        """
        Correlate IOCs across multiple investigations.
        
        Args:
            investigations: List of investigation dicts (with result_data)
            
        Returns:
            Correlation analysis dict
        """
        # 1. Aggregate IOCs
        all_iocs = aggregate_iocs_from_investigations(investigations)
        
        # 2. Basic deterministic correlation
        basic_correlation = find_basic_correlations(all_iocs)

        # 3. AI-powered correlation (if configured and enough IOCs)
        if self.is_configured and len(all_iocs) >= 2:
            try:
                messages = build_correlation_prompt(all_iocs)
                raw_response = self._groq.chat(messages)
                if raw_response:
                    ai_correlation = parse_correlation_response(raw_response)
                    # Merge AI and basic correlation
                    ai_correlation["basic_analysis"] = basic_correlation
                    return ai_correlation
            except Exception as e:
                logger.error("AI IOC correlation failed: %s", str(e))

        # Fallback to basic correlation
        return {
            "correlation_summary": f"Analyzed {len(all_iocs)} IOCs across {len(investigations)} investigations.",
            "ioc_clusters": basic_correlation.get("clusters", []),
            "campaign_indicators": [],
            "threat_actors": [],
            "recommendations": [
                "Review the identified IOC clusters for potential campaign connections.",
                "Cross-reference high-risk IOCs with your threat intelligence feeds.",
            ],
            "basic_analysis": basic_correlation,
            "ai_status": "unavailable" if self.is_configured else "not_configured",
        }

    def generate_executive_report(self, investigations: list[dict]) -> dict:
        """
        Generate an executive threat intelligence report.
        
        Args:
            investigations: List of investigation dicts to include in the report
            
        Returns:
            Executive report dict
        """
        # Prepare investigation summaries with AI context
        inv_summaries = []
        for inv in investigations[:20]:
            result_data = inv.get("result_data") or {}
            ai_analysis = result_data.get("ai_analysis") or {}
            inv_summaries.append({
                "id": inv.get("id", ""),
                "type": inv.get("type", ""),
                "target": inv.get("target", ""),
                "threat_score": inv.get("threat_score", 0),
                "status": inv.get("status", ""),
                "created_at": str(inv.get("created_at", "")),
                "ai_summary": ai_analysis.get("executive_summary", "No AI analysis available"),
            })

        if self.is_configured:
            try:
                messages = build_executive_report_prompt(inv_summaries)
                raw_response = self._groq.chat(messages, max_tokens=6000)
                if raw_response:
                    report = parse_executive_report_response(raw_response)
                    report["investigation_count"] = len(investigations)
                    return report
            except Exception as e:
                logger.error("Executive report generation failed: %s", str(e))

        # Fallback: generate basic report without AI
        return self._basic_executive_report(investigations)

    def get_status(self) -> dict:
        """Get the current status of all AI services."""
        groq_status = self._groq.health_check() if self.is_configured else {"status": "not_configured"}
        tavily_key = settings.TAVILY_API_KEY or ""
        tavily_configured = bool(tavily_key) and not tavily_key.startswith("your_")
        tavily_status = self._tavily.health_check() if tavily_configured else {"status": "not_configured"}

        return {
            "ai_enabled": self._ai_enabled,
            "groq": groq_status,
            "tavily": tavily_status,
            "cache": ai_cache.stats(),
            "model": self._groq.model,
        }

    # ── Private helpers ───────────────────────────────────────────────── #

    def _default_enrichment(self, inv_type: str, target: str, result_data: dict) -> dict:
        """Generate default enrichment when AI is unavailable."""
        threat_score = result_data.get("threat_score", 0)
        rules = (
            result_data.get("rules_triggered", [])
            or result_data.get("matched_rules", [])
            or result_data.get("indicators", [])
        )

        recommendations = generate_default_recommendations(
            inv_type, threat_score, "Unknown", rules
        )
        mitre_mapping = map_rules_to_mitre(rules, inv_type)

        return {
            "executive_summary": f"Deterministic analysis completed with a threat score of {threat_score}/100.",
            "technical_summary": "AI-powered analysis was not available for this investigation.",
            "threat_explanation": "",
            "attack_narrative": "",
            "confidence_score": threat_score,
            "mitre_mapping": mitre_mapping,
            "recommendations": recommendations,
            "risk_level": self._score_to_risk(threat_score),
            "threat_indicators": [],
            "campaign_info": None,
            "ai_status": "unavailable",
            "final_threat_score": threat_score,
            "final_risk_level": self._score_to_risk(threat_score),
        }

    @staticmethod
    def _build_tavily_query(inv_type: str, target: str, result_data: dict) -> str:
        """Build a search query for Tavily based on investigation type."""
        if inv_type == "URL":
            domain = result_data.get("domain", "")
            return f"cybersecurity threat {domain}"
        elif inv_type == "EMAIL":
            sender_domain = result_data.get("sender_domain", "")
            return f"phishing scam {sender_domain}"
        elif inv_type == "PHONE":
            return f"phone scam {target}"
        elif inv_type == "QR":
            content = result_data.get("content", "")[:100]
            return f"malicious QR code {content}"
        elif inv_type == "OCR":
            text = result_data.get("extracted_text", "")[:100]
            return f"social engineering scam {text}"
        return f"cybersecurity threat {target}"

    @staticmethod
    def _check_corroboration(ai_analysis: dict, threat_intel: Optional[str]) -> bool:
        """Check if threat intel corroborates AI findings."""
        if not threat_intel:
            return False
        ai_risk = ai_analysis.get("risk_level", "").lower()
        return ai_risk in ("critical", "high") and len(threat_intel) > 100

    @staticmethod
    def _score_to_risk(score: int) -> str:
        if score >= 80:
            return "Critical"
        elif score >= 60:
            return "High"
        elif score >= 40:
            return "Medium"
        elif score >= 20:
            return "Low"
        return "Safe"

    def _basic_executive_report(self, investigations: list[dict]) -> dict:
        """Generate a basic executive report without AI."""
        total = len(investigations)
        high_risk = sum(1 for inv in investigations if (inv.get("threat_score") or 0) >= 60)
        medium_risk = sum(1 for inv in investigations if 30 <= (inv.get("threat_score") or 0) < 60)

        return {
            "executive_summary": (
                f"This report covers {total} investigation(s). "
                f"{high_risk} were classified as high risk and {medium_risk} as medium risk. "
                f"AI-powered analysis was not available for report generation."
            ),
            "technical_findings": [
                {
                    "finding": f"{inv.get('type', 'Unknown')} investigation: {inv.get('target', 'N/A')} — Score: {inv.get('threat_score', 0)}/100",
                    "severity": "High" if (inv.get("threat_score") or 0) >= 60 else "Medium" if (inv.get("threat_score") or 0) >= 30 else "Low",
                    "evidence": "Deterministic analysis"
                }
                for inv in investigations[:10]
            ],
            "indicators_of_compromise": [],
            "mitre_mapping": [],
            "risk_rating": "High" if high_risk > 0 else "Medium" if medium_risk > 0 else "Low",
            "recommendations": [
                {"priority": "Immediate", "action": "Review all high-risk investigations.", "rationale": "Potential active threats."},
                {"priority": "Short-term", "action": "Correlate IOCs across investigations.", "rationale": "Identify campaign-level patterns."},
            ],
            "next_steps": [
                "Configure AI API keys for enhanced analysis.",
                "Export and share high-risk IOCs with your SOC team.",
            ],
            "investigation_count": total,
            "ai_status": "unavailable",
        }


# Module-level singleton
ai_service = AIService()
