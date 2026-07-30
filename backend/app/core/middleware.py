import time
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from collections import defaultdict
import datetime

# In-memory rate limiting store (for demonstration/MVP)
# Format: { "ip": [timestamp1, timestamp2, ...] }
rate_limit_store = defaultdict(list)
RATE_LIMIT = 100 # requests
RATE_WINDOW = 60 # seconds

class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        now = datetime.datetime.now().timestamp()
        
        # Clean up old timestamps
        rate_limit_store[client_ip] = [ts for ts in rate_limit_store[client_ip] if now - ts < RATE_WINDOW]
        
        if len(rate_limit_store[client_ip]) >= RATE_LIMIT:
            return Response(content="Too Many Requests", status_code=429)
            
        rate_limit_store[client_ip].append(now)
        
        response = await call_next(request)
        return response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
        return response


from app.services.monitoring_service import monitoring_service
import traceback

class APILoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        try:
            response = await call_next(request)
            process_time = time.time() - start_time
            client_ip = request.client.host if request.client else "unknown"
            
            # Record metrics
            monitoring_service.record_request(process_time * 1000, response.status_code)
            
            # In a real app, use the python logging module. Printing for MVP.
            print(f"[API] {request.method} {request.url.path} - {response.status_code} - {client_ip} - {process_time:.4f}s")
            
            # We can also add a response header for execution time if desired
            response.headers["X-Process-Time"] = str(process_time)
            return response
            
        except Exception as e:
            process_time = time.time() - start_time
            monitoring_service.record_request(process_time * 1000, 500)
            monitoring_service.record_exception(request.url.path, request.method, str(e))
            raise e
