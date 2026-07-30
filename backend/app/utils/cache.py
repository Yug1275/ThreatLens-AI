import time
from typing import Any, Dict, Tuple
from functools import wraps
from threading import Lock

class TTLCache:
    def __init__(self, ttl_seconds: int = 60):
        self.ttl = ttl_seconds
        self.cache: Dict[str, Tuple[float, Any]] = {}
        self.lock = Lock()

    def get(self, key: str) -> Any:
        with self.lock:
            if key in self.cache:
                timestamp, value = self.cache[key]
                if time.time() - timestamp < self.ttl:
                    return value
                else:
                    del self.cache[key]
        return None

    def set(self, key: str, value: Any):
        with self.lock:
            self.cache[key] = (time.time(), value)

    def invalidate(self, key: str):
        with self.lock:
            if key in self.cache:
                del self.cache[key]

# Shared instances for different domains
dashboard_cache = TTLCache(ttl_seconds=60)
