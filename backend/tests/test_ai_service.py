import pytest
from unittest.mock import patch, MagicMock
from app.services.ai.ai_service import AIService
from app.services.ai.ai_cache import ai_cache
from app.services.ai.response_parser import parse_enrichment_response, parse_correlation_response
import json

@pytest.fixture
def ai_service_mock():
    # Patch the singleton so we don't interfere with real settings
    with patch("app.services.ai.ai_service.settings") as mock_settings:
        mock_settings.GROQ_API_KEY = "test_key"
        mock_settings.TAVILY_API_KEY = "test_tavily"
        mock_settings.AI_ENABLED = True
        
        service = AIService()
        # Reset initialized state for test
        service._initialized = False
        service.__init__()
        
        # Mock providers
        service._groq = MagicMock()
        service._tavily = MagicMock()
        
        yield service

@pytest.fixture
def clear_cache():
    ai_cache.clear()
    yield
    ai_cache.clear()

def test_ai_service_configured(ai_service_mock):
    """Test that the service correctly reports its configuration state."""
    assert ai_service_mock.is_configured is True
    
    # Test unconfigured state
    with patch("app.services.ai.ai_service.settings") as mock_settings:
        mock_settings.GROQ_API_KEY = "your_groq_api_key" # default value
        mock_settings.AI_ENABLED = True
        service = AIService()
        service._initialized = False
        service.__init__()
        assert service.is_configured is False

def test_enrich_investigation_success(ai_service_mock, clear_cache):
    """Test successful AI enrichment."""
    # Mock LLM response
    ai_service_mock._groq.chat.return_value = json.dumps({
        "executive_summary": "Test summary",
        "confidence_score": 85,
        "risk_level": "High"
    })
    
    # Mock Tavily response
    ai_service_mock._tavily.search_threat_intel.return_value = "Test intel"
    
    result_data = {"threat_score": 50, "url": "http://evil.com"}
    result = ai_service_mock.enrich_investigation("URL", "http://evil.com", result_data)
    
    assert result is not None
    assert result["executive_summary"] == "Test summary"
    assert "final_threat_score" in result
    assert result["ai_status"] == "completed"
    
    # Verify cache was updated
    assert ai_cache.stats()["total_entries"] == 1

def test_enrich_investigation_fallback_on_llm_failure(ai_service_mock, clear_cache):
    """Test that the service falls back gracefully when LLM fails."""
    # Mock LLM returning None (e.g. timeout or API error)
    ai_service_mock._groq.chat.return_value = None
    
    result_data = {"threat_score": 75, "rules_triggered": ["Suspicious keywords detected"]}
    result = ai_service_mock.enrich_investigation("URL", "http://evil.com", result_data)
    
    assert result is not None
    assert result["ai_status"] == "unavailable"
    assert result["final_threat_score"] == 75
    # Should have generated default recommendations
    assert len(result["recommendations"]) > 0
    # Should have mapped rule to MITRE
    assert len(result["mitre_mapping"]) > 0

def test_response_parser_robustness():
    """Test that the JSON parser handles malformed LLM outputs."""
    # 1. Clean JSON
    res1 = parse_enrichment_response('{"executive_summary": "Clean"}')
    assert res1["executive_summary"] == "Clean"
    
    # 2. Markdown wrapped JSON
    res2 = parse_enrichment_response('```json\n{"executive_summary": "Markdown"}\n```')
    assert res2["executive_summary"] == "Markdown"
    
    # 3. Preamble text before JSON
    res3 = parse_enrichment_response('Here is my analysis: {"executive_summary": "Preamble"}')
    assert res3["executive_summary"] == "Preamble"
    
    # 4. Completely invalid output (fallback)
    res4 = parse_enrichment_response('Sorry, I cannot process this.')
    assert res4["ai_status"] == "partial"
    assert "Sorry" in res4["executive_summary"]

def test_ai_cache(clear_cache):
    """Test the TTL cache operations."""
    data = {"test": 123}
    result_hash = ai_cache.hash_result({"threat_score": 10})
    
    # Set and get
    ai_cache.set("URL", "test.com", result_hash, data)
    cached = ai_cache.get("URL", "test.com", result_hash)
    assert cached == data
    
    # Miss
    assert ai_cache.get("URL", "other.com", result_hash) is None

def test_ioc_correlator(ai_service_mock):
    """Test IOC correlation logic."""
    investigations = [
        {"id": "1", "type": "URL", "target": "evil.com", "result_data": {"domain": "evil.com", "iocs": [{"type": "IP", "value": "1.1.1.1"}]}},
        {"id": "2", "type": "EMAIL", "target": "phish", "result_data": {"sender_domain": "evil.com", "iocs": [{"type": "IP", "value": "2.2.2.2"}]}},
    ]
    
    ai_service_mock._groq.chat.return_value = json.dumps({"correlation_summary": "Correlated!"})
    
    result = ai_service_mock.correlate_iocs(investigations)
    
    assert result is not None
    # Basic correlation should have found the shared domain 'evil.com'
    assert len(result["basic_analysis"]["clusters"]) == 1
    assert "evil.com" in result["basic_analysis"]["clusters"][0]["pivot"]
