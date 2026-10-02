"""Unit tests for Sentinel-Sec security prober tools."""

import httpx
import pytest
from shipswarm.tools.security_prober import (
    run_cors_audit,
    run_error_leak_audit,
    run_security_headers_audit,
)


def test_security_headers_all_present():
    headers = {
        "strict-transport-security": "max-age=31536000; includeSubDomains",
        "content-security-policy": "default-src 'self'",
        "x-frame-options": "DENY",
        "x-content-type-options": "nosniff",
        "referrer-policy": "strict-origin-when-cross-origin",
    }
    transport = httpx.MockTransport(lambda req: httpx.Response(200, headers=headers))
    client = httpx.Client(transport=transport)

    result = run_security_headers_audit("https://test.example.com", client=client)
    assert result["security_header_score"] == 100
    assert len(result["missing_headers"]) == 0
    assert len(result["present_headers"]) == 5


def test_security_headers_missing():
    # Only standard headers
    headers = {"content-type": "application/json"}
    transport = httpx.MockTransport(lambda req: httpx.Response(200, headers=headers))
    client = httpx.Client(transport=transport)

    result = run_security_headers_audit("https://test.example.com", client=client)
    assert result["security_header_score"] == 0
    assert len(result["missing_headers"]) == 5


def test_cors_insecure_reflection():
    headers = {
        "access-control-allow-origin": "https://evil-unauthorized-origin.com",
        "access-control-allow-credentials": "true",
    }
    transport = httpx.MockTransport(lambda req: httpx.Response(204, headers=headers))
    client = httpx.Client(transport=transport)

    result = run_cors_audit("https://test.example.com", client=client)
    assert result["is_insecure"] is True
    assert any("CRITICAL" in f for f in result["findings"])


def test_cors_secure_origin():
    headers = {"access-control-allow-origin": "https://app.mycompany.com"}
    transport = httpx.MockTransport(lambda req: httpx.Response(204, headers=headers))
    client = httpx.Client(transport=transport)

    result = run_cors_audit("https://test.example.com", client=client)
    assert result["is_insecure"] is False


def test_error_leak_stack_trace():
    body = "Traceback (most recent call last):\n  File 'app.py', line 42, in index\nZeroDivisionError: division by zero"
    transport = httpx.MockTransport(lambda req: httpx.Response(500, text=body))
    client = httpx.Client(transport=transport)

    result = run_error_leak_audit("https://test.example.com", client=client)
    assert result["leaks_detected"] is True
    assert len(result["matched_patterns"]) > 0


def test_error_clean_response():
    body = '{"error": "Not found", "code": 404}'
    transport = httpx.MockTransport(lambda req: httpx.Response(404, text=body))
    client = httpx.Client(transport=transport)

    result = run_error_leak_audit("https://test.example.com", client=client)
    assert result["leaks_detected"] is False
