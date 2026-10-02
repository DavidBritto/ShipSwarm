"""Integration tests for FastAPI server and SSE streaming endpoints."""

import json
from fastapi.testclient import TestClient
import pytest
from shipswarm.server.app import create_app


@pytest.fixture
def client():
    app = create_app()
    return TestClient(app)


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["swarm"] == "online"
    assert data["provider"] == "aws-strands"


def test_audit_ssrf_rejection(client):
    payload = {
        "target_url": "http://127.0.0.1:8000/api",
        "allow_test_hosts": False,
    }
    response = client.post("/api/audit", json=payload)
    assert response.status_code == 422 or response.status_code == 400


def test_audit_export_patch(client):
    report_data = {
        "target_url": "https://test.example.com",
        "ship_score": 85,
        "grade": "B",
        "security_score": 80,
        "performance_score": 90,
        "reliability_score": 85,
        "latency": {
            "sample_count": 10,
            "p50_ms": 45.0,
            "p95_ms": 120.0,
            "p99_ms": 180.0,
            "error_percentage": 0.0,
        },
        "cloudwatch": {
            "invocations": 100,
            "error_count": 0,
            "error_rate": 0.0,
            "avg_duration_ms": 50.0,
            "throttles": 0,
            "region": "us-east-1",
        },
        "findings": [],
        "remediation_patch": "# Sample remediation patch",
        "executive_summary": "Clean bill of health",
    }
    response = client.post("/api/export-patch", json=report_data)
    assert response.status_code == 200
    assert "attachment" in response.headers.get("content-disposition", "")
    assert response.text == "# Sample remediation patch"
