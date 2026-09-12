import time
from collections import defaultdict
from typing import Dict, List
from fastapi import HTTPException, status
from app.core.config import settings

class RateLimiter:
    """Sliding-window in-memory rate limiter per client/user key."""
    def __init__(self, requests_per_minute: int = 20):
        self.requests_per_minute = requests_per_minute
        self.window_seconds = 60.0
        self.records: Dict[str, List[float]] = defaultdict(list)

    def is_allowed(self, key: str) -> bool:
        now = time.time()
        window_start = now - self.window_seconds
        
        # Clean expired timestamps
        self.records[key] = [ts for ts in self.records[key] if ts > window_start]
        
        if len(self.records[key]) >= self.requests_per_minute:
            return False
            
        self.records[key].append(now)
        return True

    def check_rate_limit(self, key: str):
        if not self.is_allowed(key):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Maximum {self.requests_per_minute} messages per minute allowed."
            )

chat_rate_limiter = RateLimiter(requests_per_minute=settings.CHAT_RATE_LIMIT)
