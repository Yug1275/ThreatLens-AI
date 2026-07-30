import psutil
from collections import deque
import datetime
from typing import Dict, Any, List

class MonitoringService:
    def __init__(self):
        # Store recent request latencies to compute average
        self.recent_latencies = deque(maxlen=100)
        
        # Track overall stats
        self.total_requests = 0
        self.total_errors = 0
        self.total_slow_queries = 0
        
        # Store recent exceptions for the error log
        self.recent_exceptions = deque(maxlen=50)
        
        # Keep track of when the server started
        self.start_time = datetime.datetime.now()

    def record_request(self, latency_ms: float, status_code: int):
        self.total_requests += 1
        self.recent_latencies.append(latency_ms)
        
        if status_code >= 400:
            self.total_errors += 1
            
        if latency_ms > 1000: # 1 second threshold for slow query
            self.total_slow_queries += 1

    def record_exception(self, path: str, method: str, exception_msg: str):
        self.recent_exceptions.appendleft({
            "timestamp": datetime.datetime.now().isoformat(),
            "path": path,
            "method": method,
            "error": exception_msg
        })

    def get_system_metrics(self) -> Dict[str, Any]:
        return {
            "cpu_percent": psutil.cpu_percent(interval=None),
            "memory_percent": psutil.virtual_memory().percent,
            "memory_used_mb": round(psutil.virtual_memory().used / (1024 * 1024), 2),
            "disk_percent": psutil.disk_usage('/').percent
        }

    def get_api_metrics(self) -> Dict[str, Any]:
        avg_latency = 0
        if self.recent_latencies:
            avg_latency = sum(self.recent_latencies) / len(self.recent_latencies)
            
        error_rate = 0
        if self.total_requests > 0:
            error_rate = (self.total_errors / self.total_requests) * 100
            
        return {
            "total_requests": self.total_requests,
            "error_rate_percent": round(error_rate, 2),
            "avg_latency_ms": round(avg_latency, 2),
            "slow_queries": self.total_slow_queries,
            "uptime_seconds": (datetime.datetime.now() - self.start_time).total_seconds()
        }

    def get_recent_errors(self) -> List[Dict[str, str]]:
        return list(self.recent_exceptions)


monitoring_service = MonitoringService()
