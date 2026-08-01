"""
Groq LLM Provider — Phase 9 AI Intelligence Engine
Uses Groq's OpenAI-compatible API with LLaMA 3.3 70B.
"""
import time
import logging
import httpx
from typing import Optional

logger = logging.getLogger(__name__)

# Groq API endpoint (OpenAI-compatible)
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"


class GroqProvider:
    """Handles communication with the Groq LLM API."""

    def __init__(
        self,
        api_key: str,
        model: str = "llama-3.3-70b-versatile",
        timeout: int = 30,
        max_retries: int = 3,
    ):
        self.api_key = api_key
        self.model = model
        self.timeout = timeout
        self.max_retries = max_retries
        self._client = None

    def _get_client(self) -> httpx.Client:
        """Lazy-initialize the HTTP client."""
        if self._client is None or self._client.is_closed:
            self._client = httpx.Client(
                timeout=httpx.Timeout(self.timeout, connect=10.0),
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
            )
        return self._client

    def chat(self, messages: list[dict], temperature: float = 0.1, max_tokens: int = 4096) -> Optional[str]:
        """
        Send a chat completion request to Groq.
        Returns the response text or None on failure.
        Uses exponential backoff for retries.
        """
        if not self.api_key or self.api_key.startswith("your_"):
            logger.warning("Groq API key not configured, skipping AI enrichment")
            return None

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "response_format": {"type": "json_object"},
        }

        last_error = None
        for attempt in range(1, self.max_retries + 1):
            try:
                start_time = time.time()
                client = self._get_client()
                response = client.post(GROQ_API_URL, json=payload)
                elapsed = round((time.time() - start_time) * 1000, 2)

                if response.status_code == 200:
                    data = response.json()
                    content = data["choices"][0]["message"]["content"]
                    tokens_used = data.get("usage", {})
                    logger.info(
                        "Groq API success: model=%s, tokens=%s, time=%sms",
                        self.model,
                        tokens_used.get("total_tokens", "?"),
                        elapsed,
                    )
                    return content

                elif response.status_code == 429:
                    # Rate limited — wait and retry
                    retry_after = int(response.headers.get("retry-after", 2 ** attempt))
                    logger.warning(
                        "Groq rate limited (attempt %d/%d), retrying in %ds",
                        attempt, self.max_retries, retry_after,
                    )
                    time.sleep(retry_after)
                    last_error = f"Rate limited (429)"

                elif response.status_code in (500, 502, 503):
                    # Server error — retry with backoff
                    wait = 2 ** attempt
                    logger.warning(
                        "Groq server error %d (attempt %d/%d), retrying in %ds",
                        response.status_code, attempt, self.max_retries, wait,
                    )
                    time.sleep(wait)
                    last_error = f"Server error ({response.status_code})"

                else:
                    # Client error — don't retry
                    error_body = response.text[:500]
                    logger.error(
                        "Groq API error %d: %s", response.status_code, error_body,
                    )
                    return None

            except httpx.TimeoutException:
                wait = 2 ** attempt
                logger.warning(
                    "Groq request timed out (attempt %d/%d, timeout=%ds), retrying in %ds",
                    attempt, self.max_retries, self.timeout, wait,
                )
                time.sleep(wait)
                last_error = "Timeout"

            except httpx.ConnectError:
                logger.error("Groq API connection failed — is the network available?")
                return None

            except Exception as e:
                logger.error("Groq unexpected error: %s", str(e))
                return None

        logger.error("Groq API failed after %d attempts: %s", self.max_retries, last_error)
        return None

    def health_check(self) -> dict:
        """Check if the Groq API is reachable and the key is valid."""
        if not self.api_key or self.api_key.startswith("your_"):
            return {"status": "not_configured", "message": "API key not set"}

        try:
            client = self._get_client()
            response = client.post(
                GROQ_API_URL,
                json={
                    "model": self.model,
                    "messages": [{"role": "user", "content": "Hi"}],
                    "max_tokens": 5,
                },
            )
            if response.status_code == 200:
                return {"status": "healthy", "model": self.model}
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
