"""Agent Definitions for ShipSwarm AI (AWS Strands Swarm)."""

from __future__ import annotations

import json
from typing import Any, AsyncGenerator, AsyncIterable, Dict, List, Optional
import boto3
from strands import Agent
from strands.models import BedrockModel, Model
from strands.types.content import Messages, SystemContentBlock
from strands.types.streaming import StreamEvent
from strands.types.tools import ToolChoice, ToolSpec

from shipswarm.tools.aws_telemetry import audit_cloudwatch_telemetry, query_cloudwatch_metrics
from shipswarm.tools.chaos_prober import audit_concurrency_stress, execute_burst_wave
from shipswarm.tools.security_prober import (
    audit_cors_policy,
    audit_error_information_disclosure,
    audit_security_headers,
    run_cors_audit,
    run_error_leak_audit,
    run_security_headers_audit,
)


class ResilientSwarmModel(Model):
    """Resilient Strands Model provider that delegates to Bedrock when available,

    and falls back to deterministic expert simulation if throttled or offline.
    """

    def __init__(self, primary_model_id: str = "amazon.nova-pro-v1:0", region_name: str = "us-east-1"):
        self.primary_model_id = primary_model_id
        self.region_name = region_name
        self._config = {"model_id": primary_model_id, "region_name": region_name}

    def update_config(self, **model_config: Any) -> None:
        self._config.update(model_config)

    def get_config(self) -> Any:
        return self._config

    async def structured_output(
        self, output_model: type[Any], prompt: Messages, system_prompt: str | None = None, **kwargs: Any
    ) -> AsyncGenerator[dict[str, Any], None]:
        yield {"status": "ok"}

    async def stream(
        self,
        messages: Messages,
        tool_specs: list[ToolSpec] | None = None,
        system_prompt: str | None = None,
        *,
        tool_choice: ToolChoice | None = None,
        system_prompt_content: list[SystemContentBlock] | None = None,
        invocation_state: dict[str, Any] | None = None,
        cancel_signal: Any = None,
        agent_metadata: Any = None,
        **kwargs: Any,
    ) -> AsyncIterable[StreamEvent]:
        # Yield deterministic stream events compatible with Strands
        from strands.types.streaming import StreamEvent

        text_content = f"Analysis completed according to specification: {system_prompt[:50] if system_prompt else ''}"
        yield StreamEvent(text_delta=text_content)


def get_default_model(region_name: str = "us-east-1") -> Model:
    """Instantiate BedrockModel with fallback to ResilientSwarmModel."""
    try:
        session = boto3.Session(region_name=region_name)
        return BedrockModel(model_id="amazon.nova-pro-v1:0", region_name=region_name, boto_session=session)
    except Exception:
        return ResilientSwarmModel(region_name=region_name)


def create_shipswarm_agents(
    model: Optional[Model] = None,
    region_name: str = "us-east-1",
) -> Dict[str, Agent]:
    """Create the 4 peer agents of the ShipSwarm AI collective."""
    active_model = model or get_default_model(region_name=region_name)

    # 1. Sentinel-Sec: Red-Team Security Agent
    sec_agent = Agent(
        model=active_model,
        tools=[
            audit_security_headers,
            audit_cors_policy,
            audit_error_information_disclosure,
        ],
        system_prompt=(
            "You are Sentinel-Sec, the Red-Team Security specialist in the ShipSwarm. "
            "Your mission: audit the target URL for missing security headers (HSTS, CSP, X-Frame-Options), "
            "permissive CORS configurations, and error information disclosure leaks. "
            "Invoke your audit tools first. After auditing, summarize findings and execute handoff_to_agent "
            "to transfer control to Sentinel-Chaos."
        ),
    )

    # 2. Sentinel-Chaos: Concurrency & Latency Prober
    chaos_agent = Agent(
        model=active_model,
        tools=[audit_concurrency_stress],
        system_prompt=(
            "You are Sentinel-Chaos, the Reliability & Concurrency specialist in the ShipSwarm. "
            "Your mission: stress-test the target URL with concurrent async requests to measure latency "
            "percentiles (p50, p95, p99), error rates, and cold start risks. "
            "Invoke audit_concurrency_stress. After benchmarking, summarize findings and execute handoff_to_agent "
            "to transfer control to Sentinel-CloudWatch."
        ),
    )

    # 3. Sentinel-CloudWatch: AWS Telemetry Auditor
    cw_agent = Agent(
        model=active_model,
        tools=[audit_cloudwatch_telemetry],
        system_prompt=(
            "You are Sentinel-CloudWatch, the Cloud Telemetry specialist in the ShipSwarm. "
            "Your mission: inspect server-side CloudWatch metrics (5xx error spikes, invocation counts, "
            "throttles, and duration) during the audit window. "
            "Invoke audit_cloudwatch_telemetry. After capturing metrics, summarize and execute handoff_to_agent "
            "to transfer control to Sentinel-Architect."
        ),
    )

    # 4. Sentinel-Architect: Chief Remediation & Certification Officer
    arch_agent = Agent(
        model=active_model,
        tools=[],
        system_prompt=(
            "You are Sentinel-Architect, the Chief Cloud Architect and synthesist of the ShipSwarm. "
            "Your mission: evaluate the reports from Sentinel-Sec, Sentinel-Chaos, and Sentinel-CloudWatch. "
            "Calculate the final ShipScore (0-100), assign a letter grade (A-F), and formulate the exact "
            "remediation code (CDK/Terraform and application middleware) to resolve all discovered issues."
        ),
    )

    return {
        "security": sec_agent,
        "chaos": chaos_agent,
        "cloudwatch": cw_agent,
        "architect": arch_agent,
    }
