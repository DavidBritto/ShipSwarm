"""Chaos & Concurrency Prober Tools for Sentinel-Chaos (AWS Strands)."""

from __future__ import annotations

import asyncio
import json
import math
import time
from typing import Any, Dict, List
import httpx
from strands import tool


def calculate_percentile(data: List[float], percentile: float) -> float:
    """Calculate the p-th percentile of a sorted list of floats."""
    if not data:
        return 0.0
    sorted_data = sorted(data)
    k = (len(sorted_data) - 1) * (percentile / 100.0)
    f = math.floor(k)
    c = math.ceil(k)
    if f == c:
        return sorted_data[int(k)]
    d0 = sorted_data[int(f)] * (c - k)
    d1 = sorted_data[int(c)] * (k - f)
    return round(d0 + d1, 2)


async def execute_burst_wave(
    target_url: str,
    concurrency: int = 15,
    timeout_sec: float = 6.0,
    client: httpx.AsyncClient | None = None,
) -> Dict[str, Any]:
    """Fire a concurrent async burst wave against target_url and measure response metrics."""
    close_client = False
    if client is None:
        client = httpx.AsyncClient(timeout=timeout_sec)
        close_client = True

    latencies: List[float] = []
    status_counts: Dict[str, int] = {}
    errors: List[str] = []

    async def single_request(req_id: int):
        start = time.perf_counter()
        try:
            resp = await client.get(target_url)
            elapsed_ms = round((time.perf_counter() - start) * 1000.0, 2)
            latencies.append(elapsed_ms)
            status_str = str(resp.status_code)
            status_counts[status_str] = status_counts.get(status_str, 0) + 1
        except Exception as exc:
            elapsed_ms = round((time.perf_counter() - start) * 1000.0, 2)
            latencies.append(elapsed_ms)
            err_type = type(exc).__name__
            status_counts[err_type] = status_counts.get(err_type, 0) + 1
            errors.append(str(exc))

    try:
        tasks = [single_request(i) for i in range(concurrency)]
        wave_start = time.time()
        await asyncio.gather(*tasks)
        wave_duration_sec = round(time.time() - wave_start, 2)

        total_requests = len(latencies)
        success_requests = sum(count for code, count in status_counts.items() if code.startswith("2"))
        error_count = total_requests - success_requests
        error_pct = round((error_count / total_requests) * 100.0, 2) if total_requests > 0 else 0.0

        p50 = calculate_percentile(latencies, 50.0)
        p95 = calculate_percentile(latencies, 95.0)
        p99 = calculate_percentile(latencies, 99.0)
        min_ms = round(min(latencies), 2) if latencies else 0.0
        max_ms = round(max(latencies), 2) if latencies else 0.0

        # Cold start heuristic: is the maximum latency > 3x the p50 and occurs early?
        cold_start_detected = False
        cold_start_ratio = 1.0
        if p50 > 0 and max_ms > (p50 * 2.5) and max_ms > 300.0:
            cold_start_detected = True
            cold_start_ratio = round(max_ms / p50, 2)

        return {
            "target_url": target_url,
            "concurrency": concurrency,
            "total_requests": total_requests,
            "wave_duration_sec": wave_duration_sec,
            "p50_ms": p50,
            "p95_ms": p95,
            "p99_ms": p99,
            "min_ms": min_ms,
            "max_ms": max_ms,
            "error_percentage": error_pct,
            "status_counts": status_counts,
            "cold_start_detected": cold_start_detected,
            "cold_start_ratio": cold_start_ratio,
        }
    finally:
        if close_client:
            await client.aclose()


@tool
def audit_concurrency_stress(target_url: str, requests_count: int = 20) -> str:
    """Stress-test target_url with concurrent requests to measure latency percentiles and cold starts."""
    # Ensure requests count is bounded safely (between 5 and 50)
    count = max(5, min(int(requests_count), 50))
    result = asyncio.run(execute_burst_wave(target_url, concurrency=count))
    return json.dumps(result, indent=2)
