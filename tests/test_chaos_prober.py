"""Unit tests for Sentinel-Chaos concurrency and latency tools."""

import asyncio
import httpx
import pytest
from shipswarm.tools.chaos_prober import calculate_percentile, execute_burst_wave


def test_percentile_calculation():
    data = [10.0, 20.0, 30.0, 40.0, 50.0, 60.0, 70.0, 80.0, 90.0, 100.0]
    assert calculate_percentile(data, 50.0) == 55.0
    assert calculate_percentile(data, 95.0) == 95.5
    assert calculate_percentile(data, 99.0) == 99.1


@pytest.mark.asyncio
async def test_execute_burst_wave_mock():
    # Mock transport responding in 10ms with 200 OK
    async def handler(request):
        await asyncio.sleep(0.01)
        return httpx.Response(200, text="OK")

    transport = httpx.MockTransport(handler)
    client = httpx.AsyncClient(transport=transport)

    result = await execute_burst_wave("https://test.example.com", concurrency=10, client=client)

    assert result["total_requests"] == 10
    assert result["error_percentage"] == 0.0
    assert result["status_counts"].get("200") == 10
    assert result["p50_ms"] > 0.0
    assert result["min_ms"] > 0.0


@pytest.mark.asyncio
async def test_execute_burst_wave_with_errors():
    # Mock transport alternating 200 and 500
    counter = 0

    async def handler(request):
        nonlocal counter
        counter += 1
        code = 200 if counter % 2 == 0 else 500
        return httpx.Response(code, text="Error" if code == 500 else "OK")

    transport = httpx.MockTransport(handler)
    client = httpx.AsyncClient(transport=transport)

    result = await execute_burst_wave("https://test.example.com", concurrency=10, client=client)

    assert result["total_requests"] == 10
    assert result["error_percentage"] == 50.0
    assert result["status_counts"]["200"] == 5
    assert result["status_counts"]["500"] == 5
