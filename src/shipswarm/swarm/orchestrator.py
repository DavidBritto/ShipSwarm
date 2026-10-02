"""Orchestration Engine and Streaming Event Dispatcher for ShipSwarm AI."""

from __future__ import annotations

import asyncio
import time
from typing import AsyncGenerator, Dict, List, Optional
import httpx

from shipswarm.models.schemas import (
    AuditReport,
    AuditRequest,
    CloudWatchMetrics,
    Finding,
    FindingCategory,
    FindingSeverity,
    LatencyMetrics,
    SwarmEvent,
    SwarmEventType,
)
from shipswarm.tools.aws_telemetry import query_cloudwatch_metrics
from shipswarm.tools.chaos_prober import execute_burst_wave
from shipswarm.tools.security_prober import (
    run_cors_audit,
    run_error_leak_audit,
    run_security_headers_audit,
)


def compute_ship_score(
    security_score: int,
    latency_metrics: LatencyMetrics,
    cloudwatch_metrics: CloudWatchMetrics,
    findings: List[Finding],
) -> tuple[int, str]:
    """Calculate the normalized ShipScore (0-100) and letter grade."""
    score = 100

    # Security penalties
    for f in findings:
        if f.severity == FindingSeverity.CRITICAL:
            score -= 25
        elif f.severity == FindingSeverity.HIGH:
            score -= 15
        elif f.severity == FindingSeverity.MEDIUM:
            score -= 8
        elif f.severity == FindingSeverity.LOW:
            score -= 3

    # Performance / Latency penalties
    if latency_metrics.p95_ms > 1500.0:
        score -= 20
    elif latency_metrics.p95_ms > 600.0:
        score -= 10
    elif latency_metrics.p95_ms > 250.0:
        score -= 5

    # Reliability / Error rate penalties
    if latency_metrics.error_percentage > 10.0:
        score -= 25
    elif latency_metrics.error_percentage > 1.0:
        score -= 12

    # CloudWatch error rate penalties
    if cloudwatch_metrics.error_rate > 5.0:
        score -= 15

    score = max(5, min(100, score))

    if score >= 90:
        grade = "A"
    elif score >= 80:
        grade = "B"
    elif score >= 70:
        grade = "C"
    elif score >= 60:
        grade = "D"
    else:
        grade = "F"

    return score, grade


def generate_remediation_patch(
    target_url: str,
    findings: List[Finding],
    latency: LatencyMetrics,
    app_type: str = "api",
) -> str:
    """Generate concrete, production-ready CDK and application remediation code."""
    patch_lines = [
        f"# ShipSwarm AI Remediation Patch for {target_url}",
        "# Generated automatically by Sentinel-Architect (AWS Strands Swarm)",
        "# ----------------------------------------------------------------",
        "",
        "## 1. AWS CloudFront Security Headers Policy (CDK Python)",
        "```python",
        "from aws_cdk import aws_cloudfront as cloudfront",
        "",
        "security_headers_policy = cloudfront.ResponseHeadersPolicy(",
        "    self, 'ShipSwarmSecurityHeaders',",
        "    response_headers_policy_name='ShipSwarm-Hardened-Policy',",
        "    security_headers_behavior=cloudfront.ResponseSecurityHeadersBehavior(",
        "        strict_transport_security=cloudfront.ResponseHeadersStrictTransportSecurity(",
        "            access_control_max_age=31536000,",
        "            include_subdomains=True,",
        "            preload=True,",
        "            override=True",
        "        ),",
        "        content_security_policy=cloudfront.ResponseHeadersContentSecurityPolicy(",
        "            content_security_policy=\"default-src 'self'; frame-ancestors 'none';\",",
        "            override=True",
        "        ),",
        "        frame_options=cloudfront.ResponseHeadersFrameOptions(",
        "            frame_option=cloudfront.HeadersFrameOption.DENY,",
        "            override=True",
        "        ),",
        "        content_type_options=cloudfront.ResponseHeadersContentTypeOptions(",
        "            override=True",
        "        )",
        "    )",
        ")",
        "```",
        "",
        "## 2. FastAPI Security & CORS Hardening Middleware",
        "```python",
        "from fastapi import FastAPI",
        "from fastapi.middleware.cors import CORSMiddleware",
        "from starlette.middleware.base import BaseHTTPMiddleware",
        "",
        "app = FastAPI()",
        "",
        "# Explicit trusted origins (avoid wildcard with credentials)",
        "app.add_middleware(",
        "    CORSMiddleware,",
        "    allow_origins=['https://my-verified-app.com'],",
        "    allow_credentials=True,",
        "    allow_methods=['GET', 'POST', 'PUT', 'DELETE'],",
        "    allow_headers=['Authorization', 'Content-Type'],",
        ")",
        "",
        "class SecurityHeadersMiddleware(BaseHTTPMiddleware):",
        "    async def dispatch(self, request, call_next):",
        "        response = await call_next(request)",
        "        response.headers['X-Content-Type-Options'] = 'nosniff'",
        "        response.headers['X-Frame-Options'] = 'DENY'",
        "        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'",
        "        return response",
        "",
        "app.add_middleware(SecurityHeadersMiddleware)",
        "```",
    ]

    if latency.p95_ms > 400.0:
        patch_lines.extend([
            "",
            "## 3. Lambda Concurrency & Cold Start Mitigation (CDK Python)",
            "```python",
            "# Provisioned concurrency to eliminate cold start spikes",
            "api_handler.add_version(",
            "    name='prod-v1',",
            "    provisioned_concurrent_executions=2",
            ")",
            "```",
        ])

    return "\n".join(patch_lines)


class ShipSwarmOrchestrator:
    """Coordinates the peer-to-peer swarm execution and event streaming."""

    def __init__(self, region_name: str = "us-east-1"):
        self.region_name = region_name

    async def stream_audit(
        self,
        request: AuditRequest,
        client: Optional[httpx.AsyncClient] = None,
    ) -> AsyncGenerator[SwarmEvent, None]:
        """Stream real-time peer-to-peer swarm deliberation and evaluation events."""
        target_url = request.target_url
        findings: List[Finding] = []

        # =====================================================================
        # Phase 1: Sentinel-Sec (Red-Team Security Specialist)
        # =====================================================================
        yield SwarmEvent(
            event_type=SwarmEventType.AGENT_START,
            agent_name="Sentinel-Sec",
            message=f"Sentinel-Sec activated. Probing security headers, CORS, and information disclosure for {target_url}",
        )
        await asyncio.sleep(0.3)

        # Audit security headers
        yield SwarmEvent(
            event_type=SwarmEventType.TOOL_CALL,
            agent_name="Sentinel-Sec",
            message="Invoking tool: audit_security_headers",
            payload={"tool": "audit_security_headers", "target_url": target_url},
        )
        sec_headers = run_security_headers_audit(target_url)
        await asyncio.sleep(0.2)

        if sec_headers.get("missing_headers"):
            for missing in sec_headers["missing_headers"]:
                sev = FindingSeverity.HIGH if missing in ("Strict-Transport-Security", "Content-Security-Policy") else FindingSeverity.MEDIUM
                f = Finding(
                    id=f"SEC-HDR-{missing[:4].upper()}",
                    severity=sev,
                    category=FindingCategory.SECURITY,
                    title=f"Missing Security Header: {missing}",
                    description=f"Endpoint is missing the recommended {missing} header.",
                    evidence=f"Present headers: {list(sec_headers.get('present_headers', {}).keys())}",
                    remediation_code=f"Add {missing} via CloudFront ResponseHeadersPolicy or reverse proxy.",
                    agent_source="Sentinel-Sec",
                )
                findings.append(f)
                yield SwarmEvent(
                    event_type=SwarmEventType.FINDING,
                    agent_name="Sentinel-Sec",
                    message=f"Discovered: {f.title} ({f.severity.value})",
                    payload=f.model_dump(),
                )

        # Audit CORS
        yield SwarmEvent(
            event_type=SwarmEventType.TOOL_CALL,
            agent_name="Sentinel-Sec",
            message="Invoking tool: audit_cors_policy",
            payload={"tool": "audit_cors_policy", "target_url": target_url},
        )
        cors_res = run_cors_audit(target_url)
        await asyncio.sleep(0.2)

        if cors_res.get("is_insecure"):
            f = Finding(
                id="SEC-CORS-001",
                severity=FindingSeverity.HIGH,
                category=FindingCategory.SECURITY,
                title="Permissive or Reflected CORS Origin Policy",
                description="Endpoint reflects arbitrary external origins or allows wildcards.",
                evidence=f"Access-Control-Allow-Origin: {cors_res.get('allow_origin')}",
                remediation_code="Explicitly allow only whitelisted frontend domains in CORS headers.",
                agent_source="Sentinel-Sec",
            )
            findings.append(f)
            yield SwarmEvent(
                event_type=SwarmEventType.FINDING,
                agent_name="Sentinel-Sec",
                message=f"Discovered: {f.title} ({f.severity.value})",
                payload=f.model_dump(),
            )

        # Audit error leaks
        yield SwarmEvent(
            event_type=SwarmEventType.TOOL_CALL,
            agent_name="Sentinel-Sec",
            message="Invoking tool: audit_error_information_disclosure",
            payload={"tool": "audit_error_information_disclosure", "target_url": target_url},
        )
        leak_res = run_error_leak_audit(target_url)
        await asyncio.sleep(0.2)

        if leak_res.get("leaks_detected"):
            f = Finding(
                id="SEC-LEAK-001",
                severity=FindingSeverity.CRITICAL,
                category=FindingCategory.SECURITY,
                title="Stack Trace / Environment Leak in Error Response",
                description="Endpoint discloses internal stack traces or debug information.",
                evidence=f"Matched patterns: {leak_res.get('matched_patterns')}",
                remediation_code="Ensure production error handlers return generic JSON errors without stack traces.",
                agent_source="Sentinel-Sec",
            )
            findings.append(f)
            yield SwarmEvent(
                event_type=SwarmEventType.FINDING,
                agent_name="Sentinel-Sec",
                message=f"Discovered: {f.title} ({f.severity.value})",
                payload=f.model_dump(),
            )

        # Handoff to Sentinel-Chaos
        yield SwarmEvent(
            event_type=SwarmEventType.HANDOFF,
            agent_name="Sentinel-Sec",
            message="Sentinel-Sec security assessment complete. Executing handoff_to_agent -> Sentinel-Chaos.",
            payload={"target_agent": "Sentinel-Chaos", "security_findings_count": len(findings)},
        )
        await asyncio.sleep(0.4)

        # =====================================================================
        # Phase 2: Sentinel-Chaos (Concurrency & Latency Specialist)
        # =====================================================================
        yield SwarmEvent(
            event_type=SwarmEventType.AGENT_START,
            agent_name="Sentinel-Chaos",
            message=f"Sentinel-Chaos taking over. Firing concurrency waves to measure p50/p95/p99 and cold starts.",
        )
        await asyncio.sleep(0.3)

        yield SwarmEvent(
            event_type=SwarmEventType.TOOL_CALL,
            agent_name="Sentinel-Chaos",
            message="Invoking tool: audit_concurrency_stress (concurrency=15)",
            payload={"tool": "audit_concurrency_stress", "concurrency": 15},
        )
        burst_res = await execute_burst_wave(target_url, concurrency=15, client=client)
        await asyncio.sleep(0.2)

        latency_metrics = LatencyMetrics(
            sample_count=burst_res.get("total_requests", 0),
            p50_ms=burst_res.get("p50_ms", 0.0),
            p95_ms=burst_res.get("p95_ms", 0.0),
            p99_ms=burst_res.get("p99_ms", 0.0),
            min_ms=burst_res.get("min_ms", 0.0),
            max_ms=burst_res.get("max_ms", 0.0),
            error_percentage=burst_res.get("error_percentage", 0.0),
            status_codes=burst_res.get("status_counts", {}),
        )

        yield SwarmEvent(
            event_type=SwarmEventType.METRIC_UPDATE,
            agent_name="Sentinel-Chaos",
            message=f"Concurrency metrics: p50={latency_metrics.p50_ms}ms, p95={latency_metrics.p95_ms}ms, errors={latency_metrics.error_percentage}%",
            payload=latency_metrics.model_dump(),
        )

        if burst_res.get("cold_start_detected"):
            f = Finding(
                id="PERF-COLDSTART-001",
                severity=FindingSeverity.MEDIUM,
                category=FindingCategory.PERFORMANCE,
                title="Lambda / Container Cold Start Latency Spike Detected",
                description=f"Max response time ({latency_metrics.max_ms}ms) exceeded p50 ({latency_metrics.p50_ms}ms) by {burst_res.get('cold_start_ratio')}x.",
                evidence=f"Cold start ratio: {burst_res.get('cold_start_ratio')}x",
                remediation_code="Configure Provisioned Concurrency or optimize container image layer size.",
                agent_source="Sentinel-Chaos",
            )
            findings.append(f)
            yield SwarmEvent(
                event_type=SwarmEventType.FINDING,
                agent_name="Sentinel-Chaos",
                message=f"Discovered: {f.title} ({f.severity.value})",
                payload=f.model_dump(),
            )

        if latency_metrics.error_percentage > 5.0:
            f = Finding(
                id="REL-ERR-001",
                severity=FindingSeverity.HIGH,
                category=FindingCategory.RELIABILITY,
                title="High Error Rate During Concurrent Burst",
                description=f"Endpoint failed {latency_metrics.error_percentage}% of concurrent requests.",
                evidence=f"Status codes: {latency_metrics.status_codes}",
                remediation_code="Inspect compute concurrency limits and configure exponential backoff / dead-letter queues.",
                agent_source="Sentinel-Chaos",
            )
            findings.append(f)
            yield SwarmEvent(
                event_type=SwarmEventType.FINDING,
                agent_name="Sentinel-Chaos",
                message=f"Discovered: {f.title} ({f.severity.value})",
                payload=f.model_dump(),
            )

        # Handoff to Sentinel-CloudWatch
        yield SwarmEvent(
            event_type=SwarmEventType.HANDOFF,
            agent_name="Sentinel-Chaos",
            message="Sentinel-Chaos benchmark complete. Executing handoff_to_agent -> Sentinel-CloudWatch.",
            payload={"target_agent": "Sentinel-CloudWatch", "p95_ms": latency_metrics.p95_ms},
        )
        await asyncio.sleep(0.4)

        # =====================================================================
        # Phase 3: Sentinel-CloudWatch (AWS Telemetry Specialist)
        # =====================================================================
        yield SwarmEvent(
            event_type=SwarmEventType.AGENT_START,
            agent_name="Sentinel-CloudWatch",
            message=f"Sentinel-CloudWatch taking over. Correlating AWS CloudWatch metrics in region {request.aws_region}.",
        )
        await asyncio.sleep(0.3)

        yield SwarmEvent(
            event_type=SwarmEventType.TOOL_CALL,
            agent_name="Sentinel-CloudWatch",
            message="Invoking tool: audit_cloudwatch_telemetry",
            payload={"tool": "audit_cloudwatch_telemetry", "region": request.aws_region},
        )
        cw_raw = query_cloudwatch_metrics(region_name=request.aws_region or "us-east-1", service=request.aws_service or "apigateway")
        await asyncio.sleep(0.2)

        cw_metrics = CloudWatchMetrics(
            invocations=cw_raw.get("invocations", 0),
            error_count=cw_raw.get("error_count", 0),
            error_rate=cw_raw.get("error_rate", 0.0),
            avg_duration_ms=cw_raw.get("avg_duration_ms", 0.0),
            throttles=cw_raw.get("throttles", 0),
            region=request.aws_region or "us-east-1",
        )

        yield SwarmEvent(
            event_type=SwarmEventType.METRIC_UPDATE,
            agent_name="Sentinel-CloudWatch",
            message=f"CloudWatch telemetry ({cw_raw.get('mode')}): invocations={cw_metrics.invocations}, 5xx_errors={cw_metrics.error_count}",
            payload=cw_metrics.model_dump(),
        )

        # Handoff to Sentinel-Architect
        yield SwarmEvent(
            event_type=SwarmEventType.HANDOFF,
            agent_name="Sentinel-CloudWatch",
            message="Sentinel-CloudWatch telemetry captured. Executing handoff_to_agent -> Sentinel-Architect.",
            payload={"target_agent": "Sentinel-Architect"},
        )
        await asyncio.sleep(0.4)

        # =====================================================================
        # Phase 4: Sentinel-Architect (Synthesis & Remediation)
        # =====================================================================
        yield SwarmEvent(
            event_type=SwarmEventType.AGENT_START,
            agent_name="Sentinel-Architect",
            message="Sentinel-Architect synthesizing swarm evidence, calculating ShipScore, and generating remediation patches.",
        )
        await asyncio.sleep(0.3)

        sec_score = sec_headers.get("security_header_score", 50)
        perf_score = max(10, min(100, int(100 - (latency_metrics.p95_ms / 20.0))))
        rel_score = max(10, min(100, int(100 - (latency_metrics.error_percentage * 5))))

        ship_score, grade = compute_ship_score(sec_score, latency_metrics, cw_metrics, findings)
        remediation_patch = generate_remediation_patch(target_url, findings, latency_metrics, request.app_type)

        summary = (
            f"ShipSwarm autonomous audit of {target_url} completed with ShipScore {ship_score}/100 (Grade: {grade}). "
            f"Discovered {len(findings)} actionable findings across Security, Performance, and CloudWatch telemetry. "
            f"Latency p95 is {latency_metrics.p95_ms}ms with {latency_metrics.error_percentage}% error rate under burst."
        )

        final_report = AuditReport(
            target_url=target_url,
            ship_score=ship_score,
            grade=grade,
            security_score=sec_score,
            performance_score=perf_score,
            reliability_score=rel_score,
            latency=latency_metrics,
            cloudwatch=cw_metrics,
            findings=findings,
            remediation_patch=remediation_patch,
            executive_summary=summary,
        )

        yield SwarmEvent(
            event_type=SwarmEventType.COMPLETE,
            agent_name="Sentinel-Architect",
            message=f"ShipSwarm deliberation concluded. ShipScore: {ship_score}/100 [{grade}].",
            payload=final_report.model_dump(),
        )

    async def run_audit(
        self,
        request: AuditRequest,
        client: Optional[httpx.AsyncClient] = None,
    ) -> AuditReport:
        """Run the full swarm audit and return the final report."""
        final_report: Optional[AuditReport] = None
        async for event in self.stream_audit(request, client=client):
            if event.event_type == SwarmEventType.COMPLETE and event.payload:
                final_report = AuditReport.model_validate(event.payload)

        if not final_report:
            raise RuntimeError("Swarm audit completed without generating a final report.")
        return final_report
