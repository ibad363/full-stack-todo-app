from __future__ import annotations

import asyncio
import time
from dataclasses import dataclass
from typing import Dict

from fastapi import Request


@dataclass
class _Bucket:
    tokens: float
    last_refill_ts: float


class TokenBucketRateLimiter:
    """In-memory token bucket rate limiter.

    Notes:
        - This is per-process memory; in multi-worker deployments, each worker has its own buckets.
        - Designed primarily for local/dev and simple deployments.
    """

    def __init__(
        self,
        *,
        capacity: int,
        refill_per_second: float,
    ):
        self._capacity = float(capacity)
        self._refill_per_second = float(refill_per_second)
        self._buckets: Dict[str, _Bucket] = {}
        self._lock = asyncio.Lock()

    async def allow(self, key: str, cost: float = 1.0) -> bool:
        now = time.monotonic()

        async with self._lock:
            bucket = self._buckets.get(key)
            if bucket is None:
                bucket = _Bucket(tokens=self._capacity, last_refill_ts=now)
                self._buckets[key] = bucket

            # Refill
            elapsed = max(0.0, now - bucket.last_refill_ts)
            if elapsed:
                bucket.tokens = min(self._capacity, bucket.tokens + elapsed * self._refill_per_second)
                bucket.last_refill_ts = now

            if bucket.tokens < cost:
                return False

            bucket.tokens -= cost
            return True


def get_client_key(request: Request) -> str:
    # Prefer a stable IP-like key.
    # If behind a proxy, operators can adjust this to use X-Forwarded-For.
    return request.client.host if request.client else "unknown"
