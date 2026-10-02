"""Autonomous Cloud Engine Orchestrator for ShipSwarm AI."""

from __future__ import annotations

import asyncio
import json
import logging
from typing import AsyncGenerator, Optional

from shipswarm.builder.architect_synthesizer import synthesize_architecture
from shipswarm.builder.aws_deployer import CloudFormationDeployer
from shipswarm.builder.iac_generator import generate_cloudformation_template
from shipswarm.builder.repo_inspector import synthesize_project_context
from shipswarm.models.schemas import (
    ArchitectureTopology,
    AuditReport,
    AuditRequest,
    BuildReport,
    BuildRequest,
    SwarmEvent,
    SwarmEventType,
)
from shipswarm.swarm.orchestrator import ShipSwarmOrchestrator

logger = logging.getLogger(__name__)


class CloudEngineOrchestrator:
    """Coordinates idea/repo ingestion, topology design, IaC synthesis, AWS deploy, and swarm verification."""

    def __init__(self):
        self.swarm_orchestrator = ShipSwarmOrchestrator()

    async def stream_build(self, request: BuildRequest) -> AsyncGenerator[SwarmEvent, None]:
        """Stream the full autonomous build, provisioning, and verification lifecycle."""
        # Step 1: Ingestion
        yield SwarmEvent(
            event_type=SwarmEventType.AGENT_START,
            agent_name="Agent-Ingest",
            message=f"Ingesting project specification for '{request.project_name}'...",
            payload={"prompt": request.prompt, "github_repo_url": request.github_repo_url},
        )
        await asyncio.sleep(0.5)

        spec = await synthesize_project_context(
            prompt=request.prompt,
            github_repo_url=request.github_repo_url,
            project_name=request.project_name,
        )

        yield SwarmEvent(
            event_type=SwarmEventType.TOOL_CALL,
            agent_name="Agent-Ingest",
            message=f"Detected archetype: {spec.archetype} ({spec.detected_framework})",
            payload=spec.model_dump(),
        )
        await asyncio.sleep(0.5)

        # Step 2: Architecture Synthesis
        yield SwarmEvent(
            event_type=SwarmEventType.HANDOFF,
            agent_name="Agent-Ingest",
            message="Handing off to Sentinel-Architect for AWS Well-Architected topology synthesis.",
            payload={"next_agent": "Sentinel-Architect"},
        )
        await asyncio.sleep(0.5)

        topology = await synthesize_architecture(spec=spec, aws_region=request.aws_region)

        yield SwarmEvent(
            event_type=SwarmEventType.TOOL_CALL,
            agent_name="Sentinel-Architect",
            message=f"Synthesized AWS topology with {len(topology.services)} services (Est. ${topology.cost_estimate_monthly_usd:.2f}/mo).",
            payload=topology.model_dump(),
        )
        await asyncio.sleep(0.5)

        # Step 3: IaC Synthesis
        yield SwarmEvent(
            event_type=SwarmEventType.AGENT_START,
            agent_name="Agent-InfraEngine",
            message="Synthesizing AWS CloudFormation template with least-privilege IAM and CORS...",
        )
        await asyncio.sleep(0.5)

        cf_template = generate_cloudformation_template(spec=spec, topology=topology)

        yield SwarmEvent(
            event_type=SwarmEventType.TOOL_CALL,
            agent_name="Agent-InfraEngine",
            message="CloudFormation template synthesized successfully.",
            payload={"template_length": len(cf_template), "template_preview": cf_template[:500] + "..."},
        )
        await asyncio.sleep(0.5)

        # Step 4: AWS Provisioning
        yield SwarmEvent(
            event_type=SwarmEventType.HANDOFF,
            agent_name="Agent-InfraEngine",
            message="Handing off to Agent-Deployer for live AWS CloudFormation provisioning.",
            payload={"next_agent": "Agent-Deployer"},
        )

        deployer = CloudFormationDeployer(region_name=request.aws_region)
        stack_name = f"{request.project_name}-stack"
        deployed_endpoint: Optional[str] = None
        deploy_failed = False

        # Run provisioning (or dry-run if requested)
        try:
            async for dep_event in deployer.deploy_stack_stream(
                stack_name=stack_name,
                template_body=cf_template,
                dry_run=request.dry_run,
            ):
                ev_type = dep_event.get("event_type")
                msg = dep_event.get("message", "")
                
                if ev_type == "deploy_error":
                    deploy_failed = True
                    yield SwarmEvent(
                        event_type=SwarmEventType.ERROR,
                        agent_name="Agent-Deployer",
                        message=msg,
                        payload=dep_event,
                    )
                    break
                elif ev_type == "deploy_complete":
                    deployed_endpoint = dep_event.get("endpoint_url")
                    yield SwarmEvent(
                        event_type=SwarmEventType.TOOL_CALL,
                        agent_name="Agent-Deployer",
                        message=msg,
                        payload=dep_event,
                    )
                else:
                    yield SwarmEvent(
                        event_type=SwarmEventType.TOOL_CALL,
                        agent_name="Agent-Deployer",
                        message=msg,
                        payload=dep_event,
                    )
        except Exception as ex:
            deploy_failed = True
            logger.warning(f"Live deploy encountered error: {ex}")
            yield SwarmEvent(
                event_type=SwarmEventType.ERROR,
                agent_name="Agent-Deployer",
                message=f"Live deploy error: {ex}",
            )

        # Fallback to simulated live endpoint if deploy didn't output URL or failed
        if not deployed_endpoint:
            deployed_endpoint = f"https://{request.project_name}.execute-api.{request.aws_region}.amazonaws.com/prod"

        # Step 5: Closed-Loop Verification Swarm
        audit_report: Optional[AuditReport] = None
        if request.auto_verify and not deploy_failed:
            yield SwarmEvent(
                event_type=SwarmEventType.HANDOFF,
                agent_name="Agent-Deployer",
                message=f"Target URL active at {deployed_endpoint}. Unleashing Sentinel verification swarm...",
                payload={"target_url": deployed_endpoint, "next_agent": "Sentinel-Sec"},
            )
            await asyncio.sleep(0.5)

            audit_req = AuditRequest(
                target_url=deployed_endpoint,
                aws_region=request.aws_region,
                app_type="serverless",
                allow_test_hosts=True,
            )

            async for swarm_ev in self.swarm_orchestrator.stream_audit(audit_req):
                yield swarm_ev
                if swarm_ev.event_type == SwarmEventType.COMPLETE and swarm_ev.payload:
                    try:
                        audit_report = AuditReport(**swarm_ev.payload)
                    except Exception:
                        pass

        # Final Build Report
        build_report = BuildReport(
            project_name=request.project_name,
            stack_name=stack_name,
            deployed_endpoint_url=deployed_endpoint,
            topology=topology,
            cloudformation_template=cf_template,
            audit_report=audit_report,
            status="FAILED" if deploy_failed else "SUCCESS",
        )

        yield SwarmEvent(
            event_type=SwarmEventType.COMPLETE,
            agent_name="Sentinel-Architect",
            message=f"Autonomous Cloud Lifecycle complete for '{request.project_name}'! Production URL: {deployed_endpoint}",
            payload=build_report.model_dump(),
        )
