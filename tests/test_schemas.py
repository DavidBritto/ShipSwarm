"""Unit tests for ShipSwarm schemas and SSRF validation."""

import pytest
from shipswarm.models.schemas import (
    AuditRequest,
    Finding,
    FindingCategory,
    FindingSeverity,
    LatencyMetrics,
    is_private_ip,
    validate_target_url,
)


def test_private_ip_detection():
    assert is_private_ip("127.0.0.1") is True
    assert is_private_ip("10.0.0.1") is True
    assert is_private_ip("192.168.1.100") is True
    assert is_private_ip("172.16.0.5") is True
    assert is_private_ip("169.254.169.254") is True
    assert is_private_ip("0.0.0.0") is True
    assert is_private_ip("8.8.8.8") is False
    assert is_private_ip("1.1.1.1") is False


def test_ssrf_prohibited_hosts():
    with pytest.raises(ValueError, match="Prohibited target host"):
        validate_target_url("http://localhost:8000/api")

    with pytest.raises(ValueError, match="Prohibited target host"):
        validate_target_url("http://127.0.0.1:3000")

    with pytest.raises(ValueError, match="Prohibited target host"):
        validate_target_url("http://169.254.169.254/latest/meta-data")


def test_allow_test_hosts():
    # When allow_test_hosts=True, local test URLs are permitted for mocking
    url = validate_target_url("http://localhost:8000/api", allow_test_hosts=True)
    assert url == "http://localhost:8000/api"


def test_valid_audit_request_with_test_flag():
    req = AuditRequest(
        target_url="http://localhost:8000",
        allow_test_hosts=True,
        app_type="api",
        aws_region="us-east-1",
    )
    assert req.target_url == "http://localhost:8000"
    assert req.app_type == "api"


def test_finding_model():
    finding = Finding(
        id="SEC-001",
        severity=FindingSeverity.HIGH,
        category=FindingCategory.SECURITY,
        title="Missing Content-Security-Policy",
        description="The endpoint does not return a CSP header.",
        evidence="Headers: {'content-type': 'application/json'}",
        remediation_code="add_header Content-Security-Policy \"default-src 'self'\";",
    )
    assert finding.severity == FindingSeverity.HIGH
    assert finding.category == FindingCategory.SECURITY
