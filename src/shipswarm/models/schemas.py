"""Pydantic schemas and SSRF validation for ShipSwarm AI."""

from __future__ import annotations

import ipaddress
import socket
from enum import Enum
from typing import Dict, List, Literal, Optional
from urllib.parse import urlparse

from pydantic import BaseModel, Field, field_validator, model_validator


class FindingSeverity(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    INFO = "INFO"


class FindingCategory(str, Enum):
    SECURITY = "SECURITY"
    PERFORMANCE = "PERFORMANCE"
    RELIABILITY = "RELIABILITY"
    OBSERVABILITY = "OBSERVABILITY"


class SwarmEventType(str, Enum):
    AGENT_START = "agent_start"
    TOOL_CALL = "tool_call"
    HANDOFF = "handoff"
    FINDING = "finding"
    METRIC_UPDATE = "metric_update"
    COMPLETE = "complete"
    ERROR = "error"


def is_private_ip(ip_str: str) -> bool:
    """Check if an IP address is private, loopback, link-local, or reserved."""
    try:
        ip = ipaddress.ip_address(ip_str)
        return (
            ip.is_private
            or ip.is_loopback
            or ip.is_link_local
            or ip.is_reserved
            or ip.is_multicast
            or str(ip) in ("0.0.0.0", "255.255.255.255")
        )
    except ValueError:
        return False


def validate_target_url(url_str: str, allow_test_hosts: bool = False) -> str:
    """Validate target URL for protocol and SSRF protection."""
    parsed = urlparse(url_str.strip())
    if parsed.scheme not in ("http", "https"):
        raise ValueError("Target URL must use http or https protocol.")

    hostname = parsed.hostname
    if not hostname:
        raise ValueError("Invalid target URL: missing hostname.")

    if not allow_test_hosts:
        # Prevent localhost / loopback
        if hostname.lower() in ("localhost", "127.0.0.1", "0.0.0.0", "169.254.169.254"):
            raise ValueError(f"Prohibited target host: {hostname} (SSRF protection).")

        # Resolve hostname to check resolved IP
        try:
            resolved_ips = socket.gethostbyname_ex(hostname)[2]
            for ip in resolved_ips:
                if is_private_ip(ip):
                    raise ValueError(f"Target host resolves to prohibited IP: {ip} (SSRF protection).")
        except socket.gaierror:
            # If domain cannot be resolved, raise clear error
            raise ValueError(f"Could not resolve target host: {hostname}")

    return url_str.strip()


class AuditRequest(BaseModel):
    """Payload to initiate an autonomous swarm audit."""

    target_url: str = Field(..., description="Public endpoint URL to audit (https://...)")
    aws_region: Optional[str] = Field("us-east-1", description="AWS region for telemetry audit")
    app_type: Literal["api", "web", "serverless"] = Field("api", description="Type of application")
    aws_service: Optional[str] = Field("apigateway", description="Primary AWS compute or gateway service")
    allow_test_hosts: bool = Field(False, description="Internal flag to allow test/mock hosts in unit tests")

    @model_validator(mode="after")
    def check_url(self) -> "AuditRequest":
        validate_target_url(self.target_url, allow_test_hosts=self.allow_test_hosts)
        return self


class Finding(BaseModel):
    """Specific vulnerability, bottleneck, or observation discovered by an agent."""

    id: str
    severity: FindingSeverity
    category: FindingCategory
    title: str
    description: str
    evidence: str
    remediation_code: Optional[str] = None
    agent_source: str = "Sentinel-Sec"


class LatencyMetrics(BaseModel):
    """Metrics calculated during concurrency waves."""

    sample_count: int = 0
    p50_ms: float = 0.0
    p95_ms: float = 0.0
    p99_ms: float = 0.0
    min_ms: float = 0.0
    max_ms: float = 0.0
    error_percentage: float = 0.0
    status_codes: Dict[str, int] = Field(default_factory=dict)


class CloudWatchMetrics(BaseModel):
    """AWS CloudWatch telemetry captured during the audit."""

    invocations: int = 0
    error_count: int = 0
    error_rate: float = 0.0
    avg_duration_ms: float = 0.0
    throttles: int = 0
    region: str = "us-east-1"


class SwarmEvent(BaseModel):
    """Real-time event emitted during swarm deliberation."""

    event_type: SwarmEventType
    agent_name: str
    message: str
    payload: Optional[Dict] = None
    timestamp: float = Field(default_factory=lambda: __import__("time").time())


class AuditReport(BaseModel):
    """Final synthesis report produced by Sentinel-Architect."""

    target_url: str
    ship_score: int = Field(..., ge=0, le=100, description="Overall ShipScore from 0 to 100")
    grade: Literal["A", "B", "C", "D", "F"]
    security_score: int = Field(..., ge=0, le=100)
    performance_score: int = Field(..., ge=0, le=100)
    reliability_score: int = Field(..., ge=0, le=100)
    latency: LatencyMetrics
    cloudwatch: CloudWatchMetrics
    findings: List[Finding] = Field(default_factory=list)
    remediation_patch: str = Field("", description="CDK or code patch fixing issues")
    executive_summary: str = Field("", description="Architect synthesis narrative")
