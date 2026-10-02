"""AWS Architecture synthesizer powered by Amazon Bedrock for ShipSwarm AI."""

from __future__ import annotations

import json
from typing import Optional

from shipswarm.builder.repo_inspector import ProjectSpecification
from shipswarm.models.schemas import ArchitectureTopology
from shipswarm.swarm.agents import ResilientSwarmModel


def generate_default_topology(spec: ProjectSpecification) -> ArchitectureTopology:
    """Deterministic fallback topology based on AWS Well-Architected Framework."""
    services = [
        "Amazon API Gateway (HTTP API v2)",
        "AWS Lambda (Python 3.12 Serverless)",
        "Amazon DynamoDB (On-Demand Capacity)",
        "Amazon CloudWatch Logs & Metrics",
        "AWS IAM (Least-Privilege Execution Role)",
    ]

    diagram = f"""flowchart TD
    Client["Client / Public Internet"]
    APIGW["Amazon API Gateway (HTTP API)"]
    LambdaFn["AWS Lambda ({spec.detected_framework})"]
    DDB[("Amazon DynamoDB ({spec.name}-store)")]
    CW["Amazon CloudWatch Logs & Metrics"]

    Client -->|HTTPS Traffic| APIGW
    APIGW -->|Proxy Integration| LambdaFn
    LambdaFn -->|Read / Write| DDB
    LambdaFn -.->|Structured Telemetry| CW
"""

    rationale = (
        f"Serverless event-driven architecture designed for high availability, zero idle costs, "
        f"and sub-50ms latency. Uses Amazon API Gateway HTTP API v2 for low-overhead routing to "
        f"an AWS Lambda execution runtime with an on-demand DynamoDB table for scalable persistence."
    )

    return ArchitectureTopology(
        architecture_name=f"{spec.name}-serverless-stack",
        app_archetype=spec.archetype,
        services=services,
        rationale=rationale,
        cost_estimate_monthly_usd=1.50,
        diagram_mermaid=diagram,
    )


async def synthesize_architecture(
    spec: ProjectSpecification,
    aws_region: str = "us-east-1",
    model: Optional[ResilientSwarmModel] = None,
) -> ArchitectureTopology:
    """Synthesize architecture topology using Amazon Bedrock with robust fallback."""
    if model is None:
        model = ResilientSwarmModel(region_name=aws_region)

    prompt = (
        f"You are the AWS Lead Cloud Architect for ShipSwarm AI.\n"
        f"Design an optimal AWS Well-Architected cloud topology for:\n"
        f"Project Name: {spec.name}\n"
        f"Archetype: {spec.archetype}\n"
        f"Framework: {spec.detected_framework}\n"
        f"Description: {spec.description}\n"
        f"Region: {aws_region}\n\n"
        f"Return ONLY a valid JSON object matching this exact schema:\n"
        f"{{\n"
        f'  "architecture_name": "string",\n'
        f'  "services": ["service1", "service2", "service3"],\n'
        f'  "rationale": "string explaining AWS Well-Architected alignment",\n'
        f'  "cost_estimate_monthly_usd": 2.50,\n'
        f'  "diagram_mermaid": "valid flowchart TD mermaid code"\n'
        f"}}\n"
    )

    try:
        response_text = model.invoke(prompt)
        # Parse JSON
        start_idx = response_text.find("{")
        end_idx = response_text.rfind("}") + 1
        if start_idx != -1 and end_idx > start_idx:
            data = json.loads(response_text[start_idx:end_idx])
            return ArchitectureTopology(
                architecture_name=data.get("architecture_name", f"{spec.name}-stack"),
                app_archetype=spec.archetype,
                services=data.get("services", ["AWS Lambda", "Amazon API Gateway", "Amazon DynamoDB"]),
                rationale=data.get("rationale", "Synthesized AWS Well-Architected serverless stack."),
                cost_estimate_monthly_usd=float(data.get("cost_estimate_monthly_usd", 2.0)),
                diagram_mermaid=data.get("diagram_mermaid", ""),
            )
    except Exception:
        pass

    return generate_default_topology(spec)
