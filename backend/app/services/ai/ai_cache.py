"""
AI Cache — In-memory TTL cache to avoid redundant LLM calls.
"""
import hashlib
import json
import time
import logging
from typing import Any, Optional

logger = logging.getLogger(__name__)


class AICache:
    """Simple in-memory TTL cache for AI responses."""

    def __init__(self, ttl_seconds: int = 3600):
        self._cache: dict[str, dict] = {}
        self._ttl = ttl_seconds

    @staticmethod
    def _make_key(inv_type: str, target: str, result_hash: str) -> str:
        """Create a deterministic cache key from investigation parameters."""
        raw = f"{inv_type}:{target}:{result_hash}"
        return hashlib.sha256(raw.encode()).hexdigest()

    @staticmethod
    def hash_result(result_data: dict) -> str:
        """Hash the deterministic result data for cache keying."""
        # Sort keys for deterministic serialization
        serialized = json.dumps(result_data, sort_keys=True, default=str)
        return hashlib.md5(serialized.encode()).hexdigest()

    def get(self, inv_type: str, target: str, result_hash: str) -> Optional[dict]:
        """Retrieve a cached AI response if it exists and hasn't expired."""
        key = self._make_key(inv_type, target, result_hash)
        entry = self._cache.get(key)
        if entry is None:
            return None
        if time.time() - entry["timestamp"] > self._ttl:
            del self._cache[key]
            logger.debug("Cache expired for key %s", key[:16])
            return None
        logger.info("AI cache HIT for %s/%s", inv_type, target[:50])
        return entry["data"]

    def set(self, inv_type: str, target: str, result_hash: str, data: dict) -> None:
        """Store an AI response in the cache."""
        key = self._make_key(inv_type, target, result_hash)
        self._cache[key] = {
            "data": data,
            "timestamp": time.time(),
        }
        logger.debug("AI cache SET for key %s", key[:16])

    def clear(self) -> None:
        """Clear the entire cache."""
        self._cache.clear()
        logger.info("AI cache cleared")

    def stats(self) -> dict:
        """Return cache statistics."""
        now = time.time()
        active = sum(1 for v in self._cache.values() if now - v["timestamp"] <= self._ttl)
        return {
            "total_entries": len(self._cache),
            "active_entries": active,
            "expired_entries": len(self._cache) - active,
            "ttl_seconds": self._ttl,
        }


# Singleton instance
ai_cache = AICache()
