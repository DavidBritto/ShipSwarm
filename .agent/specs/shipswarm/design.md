# Design: ShipSwarm AI

> Technical Architecture & Implementation Design

## 1. System Architecture

ShipSwarm AI is composed of an event-driven frontend dashboard communicating via HTTP and Server-Sent Events (SSE) with a FastAPI backend that hosts the **Autonomous Cloud Engine** and the **Strands Multi-Agent Swarm**.

```mermaid
flowchart TD
    Client["Vite + React Dashboard\n(Dual Mode: Build & Ship OR Audit)"]
    FastAPI["FastAPI Backend\n(/api/build & /api/audit)"]
    SSE["SSE Event Stream"]

    subgraph AutonomousBuilder ["Phase 1: Autonomous Cloud Engine"]
        direction TB
        Ingest["Repo & Prompt Inspector\n(Natural Language / GitHub)"]
        ArchAgent["Sentinel-Architect\n(AWS Topology Synthesis)"]
        IaCEngine["IaC Engine\n(CloudFormation / CDK)"]
        Deployer["AWS Deployer\n(Boto3 CloudFormation Provisioning)"]

        Ingest --> ArchAgent
        ArchAgent --> IaCEngine
        IaCEngine --> Deployer
    end

    subgraph VerificationSwarm ["Phase 2: Strands Peer-to-Peer Verification"]
        direction LR
        Sec["Sentinel-Sec\n(Security Red-Team)"]
        Chaos["Sentinel-Chaos\n(Concurrency & Latency)"]
        CW["Sentinel-CloudWatch\n(AWS Telemetry)"]
        Healer["Sentinel-Architect\n(ShipScore & Self-Heal)"]

        Sec -->|handoff_to_agent| Chaos
        Chaos -->|handoff_to_agent| CW
        CW -->|handoff_to_agent| Healer
    end

    AWSCloud["Live AWS Infrastructure\n(API Gateway / Lambda / S3 / DynamoDB)"]
    Bedrock["Amazon Bedrock\n(Nova Pro / Claude 3.5)"]

    Client -->|POST /api/build or /api/audit| FastAPI
    FastAPI -->|Live JSON SSE Events| SSE --> Client
    FastAPI --> AutonomousBuilder
    AutonomousBuilder -->|Deploy Stack| AWSCloud
    AutonomousBuilder -->|Converse API| Bedrock
    Deployer -->|Extract Target URL| VerificationSwarm
    Sec -->|Red-Team Probes| AWSCloud
    Chaos -->|Async Burst Waves| AWSCloud
    CW -->|CloudWatch Telemetry| AWSCloud
    Healer -->|If Failed: Auto-Remediate Patch| Deployer
```

## 2. Component Design

### 2.1 Backend Modules (`src/shipswarm/`)
- `builder/repo_inspector.py`: Analyzes GitHub repositories (inspecting `package.json`, `pyproject.toml`, Dockerfiles, requirements) or parses natural language prompts into normalized app specifications.
- `builder/architect_synthesizer.py`: Uses Bedrock to design optimal AWS architecture topologies (Serverless API vs Container vs Static Edge).
- `builder/iac_generator.py`: Generates validated AWS CloudFormation / CDK templates with IAM least-privilege policies, CORS, and CloudWatch alarms.
- `builder/aws_deployer.py`: Manages AWS CloudFormation stack lifecycle via Boto3, streaming stack creation events in real-time, capturing output URLs, and triggering rollbacks/patches upon failure.
- `tools/security_prober.py`: Tool calling functions decorated with `@tool` for CORS, Security Headers, Auth token bypass heuristics, and error-disclosure checks using `httpx`.
- `tools/chaos_prober.py`: Asynchronous concurrent runner executing HTTP burst waves (10, 25, 50 calls) measuring min, mean, p50, p95, p99 latencies and HTTP status codes.
- `tools/aws_telemetry.py`: Boto3 queries for CloudWatch metrics (`AWS/ApiGateway`, `AWS/Lambda`, `AWS/ApplicationELB`) across a target time window.
- `swarm/agents.py`: Definition of the 4 Strands agents using `BedrockModel` with custom system prompts, specialized tools, and auto-injected `handoff_to_agent`.
- `swarm/orchestrator.py`: Initializer for `Swarm(nodes=[...], entry_point=sec_agent)` with event-listener hooks that emit structured SSE events.
- `server/app.py`: FastAPI app with `/health`, `/api/build` (deploy new stack), `/api/audit` (audit existing URL), and `/api/export-patch`.

### 2.2 Frontend Dashboard (`frontend/`)
- `SwarmConsole`: Real-time terminal displaying peer handoffs, agent reasoning, and executed tools.
- `ShipScoreRadar`: Multi-axis radar chart showing Security, Reliability, Performance, Observability, and Cost resilience.
- `TelemetryView`: Latency percentiles chart (p50, p95, p99) and CloudWatch metric cards.
- `RemediationPanel`: Interactive diff viewer showing the exact CDK/code patch with a copy/download action.

## 3. Data Models & Schemas

```python
from pydantic import BaseModel, HttpUrl
from typing import List, Dict, Optional, Literal

class AuditRequest(BaseModel):
    target_url: HttpUrl
    aws_region: Optional[str] = "us-east-1"
    app_type: Literal["api", "web", "serverless"] = "api"
    aws_service: Optional[str] = "apigateway"

class Finding(BaseModel):
    id: str
    severity: Literal["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"]
    category: Literal["SECURITY", "PERFORMANCE", "RELIABILITY", "OBSERVABILITY"]
    title: str
    description: str
    evidence: str
    remediation_code: Optional[str] = None

class LatencyMetrics(BaseModel):
    sample_count: int
    p50_ms: float
    p95_ms: float
    p99_ms: float
    error_percentage: float

class SwarmEvent(BaseModel):
    event_type: Literal["agent_start", "tool_call", "handoff", "finding", "complete", "error"]
    agent_name: str
    message: str
    payload: Optional[Dict] = None

class AuditReport(BaseModel):
    target_url: str
    ship_score: int  # 0 to 100
    grade: Literal["A", "B", "C", "D", "F"]
    latency: LatencyMetrics
    findings: List[Finding]
    remediation_patch: str
```

## 4. Error Handling & Edge Cases

- **SSRF Protection:** Ensure target URLs do not resolve to `127.0.0.1`, `169.254.169.254` (AWS metadata service), or private RFC 1918 ranges before dispatching probes.
- **Target Unreachable / Timeouts:** If a target fails to respond within 5 seconds, retry once. If still failing, register an `UNREACHABLE_ENDPOINT` finding with 0 score penalty on availability and conclude the run safely.
- **Bedrock Throttling:** Built-in exponential backoff retry strategy via `ModelRetryStrategy` in Strands.
- **Swarm Loop Prevention:** Swarm configured with `max_handoffs=12` and `repetitive_handoff_detection_window=3` to prevent circular infinite handoffs.

## 5. Security & Isolation

- **Read-Only / Safe Probing:** Security tools only perform safe, non-destructive HTTP requests with standard payloads (no destructive database drops or mass fuzzing).
- **Environment Isolation:** AWS credentials used by Boto3 are restricted to read-only CloudWatch (`cloudwatch:GetMetricData`) and Bedrock model invocations (`bedrock:InvokeModel`).

## 6. Testing Strategy

- **Unit Tests:**
  - `test_security_prober.py`: Test security header checks and CORS validation with mock HTTP responses.
  - `test_chaos_prober.py`: Test latency percentile computation with synthetic response arrays.
  - `test_schemas.py`: Validate Pydantic models and SSRF protection regex.
- **Integration Tests:**
  - `test_swarm.py`: End-to-end swarm execution using a test HTTP target and mock Bedrock model.
  - `test_api.py`: FastAPI test client testing the SSE streaming generator.

## 7. Observability & Deployment (The Ship Gate)

- Deployable as a production service on AWS via AWS CDK / CloudFormation:
  - Frontend built and hosted on S3 + CloudFront / AWS Amplify.
  - Backend running containerized on AWS App Runner or AWS Lambda (via Mangum adapter).
- Documented proof of agent execution preserved in `deploy/aws_deployment_log.md` with timestamps and CLI outputs.
