"""Security Prober Tools for Sentinel-Sec (AWS Strands)."""

from __future__ import annotations

import json
import re
from typing import Any, Dict, List
import httpx
from strands import tool

CRITICAL_SECURITY_HEADERS = [
    "Strict-Transport-Security",
    "Content-Security-Policy",
    "X-Frame-Options",
    "X-Content-Type-Options",
    "Referrer-Policy",
]

STACK_TRACE_PATTERNS = [
    re.compile(r"Traceback \(most recent call last\):", re.IGNORECASE),
    re.compile(r"at (?:[A-Za-z0-9_$.]+\s+)?\(?[A-Za-z0-9_$/\\.-]+:\d+:\d+\)?"),  # Node stack
    re.compile(r"Internal Server Error", re.IGNORECASE),
    re.compile(r"AWS_LAMBDA_FUNCTION_NAME", re.IGNORECASE),
    re.compile(r"DEBUG = True", re.IGNORECASE),
    re.compile(r"psycopg2\.", re.IGNORECASE),
    re.compile(r"SyntaxError:", re.IGNORECASE),
]


def run_security_headers_audit(target_url: str, client: httpx.Client | None = None) -> Dict[str, Any]:
    """Audit endpoint for critical security headers."""
    close_client = False
    if client is None:
        client = httpx.Client(timeout=8.0, follow_redirects=True)
        close_client = True

    try:
        response = client.get(target_url)
        headers = {k.lower(): v for k, v in response.headers.items()}

        present_headers = {}
        missing_headers = []

        for h in CRITICAL_SECURITY_HEADERS:
            h_lower = h.lower()
            if h_lower in headers:
                present_headers[h] = headers[h_lower]
            else:
                missing_headers.append(h)

        score = int(100 * (len(present_headers) / len(CRITICAL_SECURITY_HEADERS)))

        return {
            "target_url": target_url,
            "status_code": response.status_code,
            "present_headers": present_headers,
            "missing_headers": missing_headers,
            "security_header_score": score,
            "server_header": headers.get("server", "unknown"),
        }
    except Exception as exc:
        return {
            "target_url": target_url,
            "error": str(exc),
            "security_header_score": 0,
            "missing_headers": CRITICAL_SECURITY_HEADERS,
        }
    finally:
        if close_client:
            client.close()


def run_cors_audit(target_url: str, client: httpx.Client | None = None) -> Dict[str, Any]:
    """Test CORS configuration against arbitrary external origins."""
    close_client = False
    if client is None:
        client = httpx.Client(timeout=8.0)
        close_client = True

    try:
        origin_payload = "https://evil-unauthorized-origin.com"
        headers = {
            "Origin": origin_payload,
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "authorization, content-type",
        }
        response = client.options(target_url, headers=headers)
        res_headers = {k.lower(): v for k, v in response.headers.items()}

        allow_origin = res_headers.get("access-control-allow-origin")
        allow_credentials = res_headers.get("access-control-allow-credentials", "").lower() == "true"

        is_wildcard = allow_origin == "*"
        is_origin_reflected = allow_origin == origin_payload
        is_insecure = (is_wildcard and allow_credentials) or (is_origin_reflected and allow_credentials)

        findings = []
        if is_insecure:
            findings.append("CRITICAL: CORS reflects untrusted origin with Access-Control-Allow-Credentials=true")
        elif is_wildcard:
            findings.append("MEDIUM: CORS allows wildcard Access-Control-Allow-Origin: *")
        elif is_origin_reflected:
            findings.append("HIGH: CORS reflects arbitrary external origins without credential gating")

        return {
            "target_url": target_url,
            "status_code": response.status_code,
            "allow_origin": allow_origin,
            "allow_credentials": allow_credentials,
            "is_insecure": is_insecure or is_origin_reflected,
            "findings": findings,
        }
    except Exception as exc:
        return {
            "target_url": target_url,
            "error": str(exc),
            "is_insecure": False,
            "findings": [f"CORS audit failed: {exc}"],
        }
    finally:
        if close_client:
            client.close()


def run_error_leak_audit(target_url: str, client: httpx.Client | None = None) -> Dict[str, Any]:
    """Test if error responses disclose internal stack traces or environment variables."""
    close_client = False
    if client is None:
        client = httpx.Client(timeout=8.0)
        close_client = True

    try:
        # Trigger potential 404 or bad method error
        probe_url = target_url.rstrip("/") + "/_shipswarm_nonexistent_probe_404"
        response = client.get(probe_url)
        body = response.text

        matched_leaks = []
        for pattern in STACK_TRACE_PATTERNS:
            if pattern.search(body):
                matched_leaks.append(pattern.pattern)

        return {
            "probe_url": probe_url,
            "status_code": response.status_code,
            "leaks_detected": len(matched_leaks) > 0,
            "matched_patterns": matched_leaks,
            "response_snippet": body[:200] if len(matched_leaks) > 0 else "",
        }
    except Exception as exc:
        return {
            "probe_url": target_url,
            "error": str(exc),
            "leaks_detected": False,
            "matched_patterns": [],
        }
    finally:
        if close_client:
            client.close()


@tool
def audit_security_headers(target_url: str) -> str:
    """Analyze security headers on target_url (HSTS, CSP, X-Frame-Options, X-Content-Type-Options)."""
    result = run_security_headers_audit(target_url)
    return json.dumps(result, indent=2)


@tool
def audit_cors_policy(target_url: str) -> str:
    """Audit CORS configuration on target_url for wildcard or reflected origin vulnerabilities."""
    result = run_cors_audit(target_url)
    return json.dumps(result, indent=2)


@tool
def audit_error_information_disclosure(target_url: str) -> str:
    """Probe target_url for stack trace leaks, database errors, or environment exposure."""
    result = run_error_leak_audit(target_url)
    return json.dumps(result, indent=2)
