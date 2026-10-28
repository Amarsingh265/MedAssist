"""Authenticated, rate-limited HomeCare assistant endpoint."""
from collections import defaultdict, deque
from threading import Lock
from time import monotonic

from fastapi import APIRouter, Depends, HTTPException, status

from .. import models, schemas
from ..deps import get_current_user
from ..utils.homecare import get_homecare_response

router = APIRouter(prefix="/api/chatbot", tags=["chatbot"])


class UserRateLimiter:
    """Small per-process limiter; use a shared store for multi-worker deployment."""

    def __init__(self, max_requests: int = 30, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._requests: dict[int, deque[float]] = defaultdict(deque)
        self._lock = Lock()

    def allow(self, user_id: int, now: float | None = None) -> bool:
        current = monotonic() if now is None else now
        cutoff = current - self.window_seconds
        with self._lock:
            requests = self._requests[user_id]
            while requests and requests[0] <= cutoff:
                requests.popleft()
            if len(requests) >= self.max_requests:
                return False
            requests.append(current)
            if len(self._requests) > 10000:
                expired_users = [key for key, values in self._requests.items() if not values or values[-1] <= cutoff]
                for key in expired_users:
                    self._requests.pop(key, None)
            return True


chat_limiter = UserRateLimiter()


@router.post("", response_model=schemas.ChatResponse)
def chat(
    payload: schemas.ChatRequest,
    current_user: models.User = Depends(get_current_user),
):
    if not chat_limiter.allow(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many messages. Please wait a minute before trying again.",
            headers={"Retry-After": "60"},
        )
    return schemas.ChatResponse(**get_homecare_response(payload.message, payload.language))
