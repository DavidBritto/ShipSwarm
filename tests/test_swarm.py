"""Unit and integration tests for ShipSwarm agents and orchestrator."""

import asyncio
import httpx
import pytest
from shipswarm.models.schemas import AuditRequest, SwarmEventType
from shipswarm.swarm.agents import create_shipswarm_agents
from shipswarm.swarm.orchestrator import ShipSwarmOrchestrator, compute_ship_score


def test_create_shipswarm_agents():
    agents = create_shipswarm_agents(region_name="us-east-1")
    assert "security" in agents
    assert "chaos" in agents
    assert "cloudwatch" in agents
    assert "architect" in agents

    assert len(agents["security"].tool_names) == 3
    assert len(agents["chaos"].tool_names) == 1
    assert len(agents["cloudwatch"].tool_names) == 1
    assert len(agents["architect"].tool_names) == 0


@pytest.mark.asyncio
async def test_orchestrator_stream_audit_mocked():
    # Mock transport that returns clean HTTP 200 responses with basic headers
    async def handler(request):
        await asyncio.sleep(0.005)
        headers = {
            "content-type": "application/json",
            "strict-transport-security": "max-age=31536000",
        }
        return httpx.Response(200, headers=headers, text='{"status":"healthy"}')

    transport = httpx.MockTransport(handler)
    client = httpx.AsyncClient(transport=transport)

    req = AuditRequest(
        target_url="http://localhost:8080/health",
        allow_test_hosts=True,
        app_type="api",
        aws_region="us-east-1",
    )

    orchestrator = ShipSwarmOrchestrator(region_name="us-east-1")
    events = []

    async for event in orchestrator.stream_audit(req, client=client):
        events.append(event)

    # Verify event sequencing:
    event_types = [e.event_type for e in events]
    assert SwarmEventType.AGENT_START in event_types
    assert SwarmEventType.TOOL_CALL in event_types
    assert SwarmEventType.HANDOFF in event_types
    assert SwarmEventType.COMPLETE in event_types

    # Check that handoffs occurred between all specialists
    handoffs = [e for e in events if e.event_type == SwarmEventType.HANDOFF]
    assert len(handoffs) >= 3

    # Check final complete event
    complete_event = events[-1]
    assert complete_event.event_type == SwarmEventType.COMPLETE
    assert complete_event.payload is not None
    assert "ship_score" in complete_event.payload
    assert "remediation_patch" in complete_event.payload
    assert complete_event.payload["ship_score"] > 0


@pytest.mark.asyncio
async def test_orchestrator_run_audit_report():
    async def handler(request):
        return httpx.Response(200, text='{"ok": true}')

    transport = httpx.MockTransport(handler)
    client = httpx.AsyncClient(transport=transport)

    req = AuditRequest(
        target_url="http://localhost:8080/api",
        allow_test_hosts=True,
    )
    orchestrator = ShipSwarmOrchestrator()
    report = await orchestrator.run_audit(req, client=client)

    assert report.ship_score >= 0
    assert report.ship_score <= 100
    assert report.grade in ("A", "B", "C", "D", "F")
    assert report.latency.sample_count > 0
    assert len(report.remediation_patch) > 0
