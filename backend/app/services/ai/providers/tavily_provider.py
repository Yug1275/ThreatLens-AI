"""
Tavily Threat Intelligence Provider — Phase 9 AI Intelligence Engine
Uses Tavily Search API for real-time threat intelligence lookups.
"""
import time
import logging
import httpx
from typing import Optional

logger = logging.getLogger(__name__)

TAVILY_API_URL = "https://api.tavily.com/search"


class TavilyProvider:
    """Handles communication with the Tavily Search API for threat intelligence."""

    def __init__(
        self,
        api_key: str,
        timeout: int = 15,
        max_retries: int = 2,
    ):
        self.api_key = api_key
        self.timeout = timeout
        self.max_retries = max_retries
        self._client = None

    def _get_client(self) -> httpx.Client:
        """Lazy-initialize the HTTP client."""
        if self._client is None or self._client.is_closed:
            self._client = httpx.Client(
                timeout=httpx.Timeout(self.timeout, connect=10.0),
                headers={"Content-Type": "application/json"},
            )
        return self._client

    def search_threat_intel(self, query: str, search_depth: str = "basic") -> Optional[str]:
        """
        Search for threat intelligence on a target (domain, URL, IP, email, etc.).
        Returns a formatted string of findings, or None on failure.
        """
        if not self.api_key or self.api_key.startswith("your_"):
            logger.debug("Tavily API key not configured, skipping threat intel lookup")
            return None

        payload = {
            "api_key": self.api_key,
            "query": f"cybersecurity threat intelligence {query}",
            "search_depth": search_depth,
            "include_answer": True,
            "max_results": 5,
        }

        last_error = None
        for attempt in range(1, self.max_retries + 1):
            try:
                start_time = time.time()
                client = self._get_client()
                response = client.post(TAVILY_API_URL, json=payload)
                elapsed = round((time.time() - start_time) * 1000, 2)

                if response.status_code == 200:
                    data = response.json()
                    logger.info("Tavily search success: query='%s', time=%sms", query[:50], elapsed)
                    return self._format_results(data)

                elif response.status_code == 429:
                    wait = 2 ** attempt
                    logger.warning("Tavily rate limited (attempt %d/%d)", attempt, self.max_retries)
                    time.sleep(wait)
                    last_error = "Rate limited"

                elif response.status_code == 401:
                    logger.error("Tavily API key is invalid")
                    return None

                else:
                    logger.error("Tavily API error %d: %s", response.status_code, response.text[:300])
                    return None

            except httpx.TimeoutException:
                logger.warning("Tavily request timed out (attempt %d/%d)", attempt, self.max_retries)
                last_error = "Timeout"

            except httpx.ConnectError:
                logger.error("Tavily API connection failed")
                return None

            except Exception as e:
                logger.error("Tavily unexpected error: %s", str(e))
                return None

        logger.error("Tavily failed after %d attempts: %s", self.max_retries, last_error)
        return None

    @staticmethod
    def _format_results(data: dict) -> str:
        """Format Tavily search results into a string for LLM context injection."""
        parts = []

        # Include the AI-generated answer if available
        answer = data.get("answer")
        if answer:
            parts.append(f"Threat Intel Summary: {answer}")

        # Include top search results
        results = data.get("results", [])
        for i, result in enumerate(results[:5], 1):
            title = result.get("title", "Unknown Source")
            content = result.get("content", "")[:300]
            url = result.get("url", "")
            parts.append(f"\nSource {i}: {title}")
            parts.append(f"  URL: {url}")
            parts.append(f"  Content: {content}")

        return "\n".join(parts) if parts else None

    def health_check(self) -> dict:
        """Check if the Tavily API is reachable and the key is valid."""
        if not self.api_key or self.api_key.startswith("your_"):
            return {"status": "not_configured", "message": "API key not set"}

        try:
            client = self._get_client()
            response = client.post(
                TAVILY_API_URL,
                json={
                    "api_key": self.api_key,
                    "query": "test",
                    "max_results": 1,
                },
            )
            if response.status_code == 200:
                return {"status": "healthy"}
            elif response.status_code == 401:
                return {"status": "invalid_key", "message": "API key is invalid"}
            else:
                return {"status": "error", "message": f"HTTP {response.status_code}"}
        except Exception as e:
            return {"status": "unreachable", "message": str(e)}

    def close(self):
        """Close the HTTP client."""
        if self._client and not self._client.is_closed:
            self._client.close()
