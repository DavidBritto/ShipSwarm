"""Tests for Autonomous Cloud Engine (builder, synthesizer, iac, deployer)."""

import json
import pytest
from fastapi.testclient import TestClient

from shipswarm.builder.architect_synthesizer import generate_default_topology, synthesize_architecture
from shipswarm.builder.aws_deployer import CloudFormationDeployer
from shipswarm.builder.iac_generator import generate_cloudformation_template
from shipswarm.builder.repo_inspector import inspect_prompt, inspect_github_repo
from shipswarm.models.schemas import BuildRequest
from shipswarm.server.app import create_app


def test_inspect_prompt():
    spec = inspect_prompt("Build a serverless REST API with DynamoDB called my-cool-api")
    assert spec.name == "my-cool-api"
    assert spec.archetype == "api"
    assert "fastapi" in spec.detected_framework
    assert "/health" in spec.suggested_endpoints


def test_inspect_prompt_web():
    spec = inspect_prompt("Create a Next.js frontend landing page with CloudFront")
    assert spec.archetype == "web"
    assert "nextjs" in spec.detected_framework


@pytest.mark.asyncio
async def test_inspect_github_repo_parsing():
    spec = await inspect_github_repo("https://github.com/tiangolo/fastapi")
    assert spec.name == "fastapi"
    assert spec.archetype in ("api", "serverless")


def test_iac_generator_valid_cf():
    spec = inspect_prompt("REST API with DynamoDB", project_name="demo-service")
    topology = generate_default_topology(spec)
    cf_json = generate_cloudformation_template(spec, topology)
    
    # Verify it parses as valid JSON
    parsed = json.loads(cf_json)
    assert parsed["AWSTemplateFormatVersion"] == "2010-09-09"
    assert "HttpApi" in parsed["Resources"]
    assert "LambdaFunction" in parsed["Resources"]
    assert "DataTable" in parsed["Resources"]
    assert "ExecutionRole" in parsed["Resources"]
    assert "ApiEndpoint" in parsed["Outputs"]


@pytest.mark.asyncio
async def test_deployer_dry_run_stream():
    deployer = CloudFormationDeployer(region_name="us-east-1")
    events = []
    async for ev in deployer.deploy_stack_stream(stack_name="test-stack", template_body="{}", dry_run=True):
        events.append(ev)

    assert len(events) >= 5
    assert events[0]["event_type"] == "deploy_start"
    assert events[-1]["event_type"] == "deploy_complete"
    assert "endpoint_url" in events[-1]


def test_api_build_stream_endpoint():
    app = create_app()
    client = TestClient(app)
    
    payload = {
        "prompt": "Create an automated customer analytics API",
        "project_name": "analytics-api",
        "aws_region": "us-east-1",
        "auto_verify": False,
        "dry_run": True,
    }
    
    response = client.post("/api/build/stream", json=payload)
    assert response.status_code == 200
    assert "text/event-stream" in response.headers.get("content-type", "")
    assert "Agent-Ingest" in response.text
    assert "Sentinel-Architect" in response.text
