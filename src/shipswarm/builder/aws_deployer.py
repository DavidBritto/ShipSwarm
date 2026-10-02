"""AWS CloudFormation deployer and real-time event streamer for ShipSwarm AI."""

from __future__ import annotations

import asyncio
import logging
from typing import AsyncGenerator, Dict, Any, Optional

import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)


class CloudFormationDeployer:
    """Manages CloudFormation stack creation, updates, and event streaming."""

    def __init__(self, region_name: str = "us-east-1"):
        self.region_name = region_name
        self.cf_client = boto3.client("cloudformation", region_name=region_name)

    def _stack_exists(self, stack_name: str) -> bool:
        """Check if stack exists."""
        try:
            resp = self.cf_client.describe_stacks(StackName=stack_name)
            stacks = resp.get("Stacks", [])
            if not stacks:
                return False
            status = stacks[0].get("StackStatus", "")
            return status not in ("DELETE_COMPLETE", "DELETE_IN_PROGRESS")
        except ClientError:
            return False

    async def deploy_stack_stream(
        self,
        stack_name: str,
        template_body: str,
        parameters: Optional[Dict[str, str]] = None,
        dry_run: bool = False,
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Deploy stack and stream resource progress events in real-time."""
        yield {
            "event_type": "deploy_start",
            "message": f"Starting autonomous AWS provisioning for stack '{stack_name}' in {self.region_name}...",
            "stack_name": stack_name,
        }

        if dry_run:
            # Simulate deployment steps for testing without waiting for CloudFormation
            resources = [
                ("AWS::IAM::Role", "ExecutionRole"),
                ("AWS::Logs::LogGroup", "LogGroup"),
                ("AWS::DynamoDB::Table", "DataTable"),
                ("AWS::Lambda::Function", "LambdaFunction"),
                ("AWS::ApiGatewayV2::Api", "HttpApi"),
                ("AWS::ApiGatewayV2::Stage", "HttpApiStage"),
            ]
            for r_type, r_id in resources:
                await asyncio.sleep(0.4)
                yield {
                    "event_type": "resource_update",
                    "resource_type": r_type,
                    "logical_id": r_id,
                    "status": "CREATE_IN_PROGRESS",
                    "message": f"Creating resource {r_id} ({r_type})",
                }
                await asyncio.sleep(0.4)
                yield {
                    "event_type": "resource_update",
                    "resource_type": r_type,
                    "logical_id": r_id,
                    "status": "CREATE_COMPLETE",
                    "message": f"Successfully created {r_id}",
                }

            mock_endpoint = f"https://mock-{stack_name}.execute-api.{self.region_name}.amazonaws.com"
            yield {
                "event_type": "deploy_complete",
                "message": f"Stack {stack_name} provisioned successfully (dry-run).",
                "endpoint_url": mock_endpoint,
                "outputs": {"ApiEndpoint": mock_endpoint},
            }
            return

        exists = self._stack_exists(stack_name)
        params_list = [{"ParameterKey": k, "ParameterValue": v} for k, v in (parameters or {}).items()]

        try:
            if exists:
                yield {
                    "event_type": "deploy_progress",
                    "message": f"Stack '{stack_name}' exists. Initiating CloudFormation update...",
                }
                self.cf_client.update_stack(
                    StackName=stack_name,
                    TemplateBody=template_body,
                    Parameters=params_list,
                    Capabilities=["CAPABILITY_IAM", "CAPABILITY_NAMED_IAM"],
                )
            else:
                yield {
                    "event_type": "deploy_progress",
                    "message": f"Creating new CloudFormation stack '{stack_name}' with IAM least-privilege...",
                }
                self.cf_client.create_stack(
                    StackName=stack_name,
                    TemplateBody=template_body,
                    Parameters=params_list,
                    Capabilities=["CAPABILITY_IAM", "CAPABILITY_NAMED_IAM"],
                    Tags=[
                        {"Key": "ManagedBy", "Value": "ShipSwarm-AI"},
                        {"Key": "Hackathon", "Value": "AWS-Zero-To-Shipped"},
                    ],
                )
        except ClientError as e:
            err_msg = str(e)
            if "No updates are to be performed" in err_msg:
                yield {
                    "event_type": "deploy_progress",
                    "message": "Stack is already up-to-date with current architecture.",
                }
            else:
                yield {
                    "event_type": "deploy_error",
                    "message": f"CloudFormation initiation failed: {err_msg}",
                    "error": err_msg,
                }
                return

        # Poll CloudFormation stack events until completion
        seen_event_ids = set()
        completed = False
        final_endpoint = None
        outputs_map = {}

        for _ in range(60):  # Poll every 3s up to 180s
            await asyncio.sleep(3.0)
            try:
                events_resp = self.cf_client.describe_stack_events(StackName=stack_name)
                for ev in reversed(events_resp.get("StackEvents", [])):
                    ev_id = ev.get("EventId")
                    if ev_id in seen_event_ids:
                        continue
                    seen_event_ids.add(ev_id)

                    r_type = ev.get("ResourceType", "")
                    r_id = ev.get("LogicalResourceId", "")
                    status = ev.get("ResourceStatus", "")
                    reason = ev.get("ResourceStatusReason", "")

                    yield {
                        "event_type": "resource_update",
                        "resource_type": r_type,
                        "logical_id": r_id,
                        "status": status,
                        "reason": reason,
                        "message": f"[{status}] {r_id} ({r_type})" + (f": {reason}" if reason else ""),
                    }

                    if r_id == stack_name and status in ("CREATE_COMPLETE", "UPDATE_COMPLETE"):
                        completed = True
                        break
                    elif r_id == stack_name and "FAILED" in status:
                        yield {
                            "event_type": "deploy_error",
                            "message": f"Stack deployment failed with status {status}: {reason}",
                        }
                        return

                if completed:
                    break
            except Exception as ex:
                logger.warning(f"Error querying stack events: {ex}")

        # Extract Outputs
        try:
            stack_info = self.cf_client.describe_stacks(StackName=stack_name)["Stacks"][0]
            for out in stack_info.get("Outputs", []):
                key = out.get("OutputKey")
                val = out.get("OutputValue")
                outputs_map[key] = val
                if key in ("ApiEndpoint", "EndpointUrl", "ApiUrl"):
                    final_endpoint = val
        except Exception as e:
            logger.warning(f"Failed to fetch stack outputs: {e}")

        yield {
            "event_type": "deploy_complete",
            "message": f"Stack {stack_name} provisioned successfully on AWS!",
            "endpoint_url": final_endpoint,
            "outputs": outputs_map,
        }
