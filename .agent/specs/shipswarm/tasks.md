# Tasks: ShipSwarm AI

> Implementation plan divided into atomic, verifiable tasks.

## Phase 1: Core Engine & Data Models
- [x] **Task 1.1: Core Schemas and SSRF Validator**
  - Implement Pydantic models in `src/shipswarm/models/schemas.py`.
  - Implement URL and SSRF validation logic preventing private IP access.
  - Add unit tests in `tests/test_schemas.py`.
- [x] **Task 1.2: Sentinel-Sec Security Prober Tools**
  - Implement `src/shipswarm/tools/security_prober.py` with `@tool` decorators for headers, CORS, and error leakage.
  - Add unit tests in `tests/test_security_prober.py`.
- [x] **Task 1.3: Sentinel-Chaos Concurrency & Latency Prober**
  - Implement `src/shipswarm/tools/chaos_prober.py` with async burst execution and percentile math (p50/p95/p99).
  - Add unit tests in `tests/test_chaos_prober.py`.
- [x] **Task 1.4: Sentinel-CloudWatch Telemetry Tool**
  - Implement `src/shipswarm/tools/aws_telemetry.py` using Boto3 / AWS MCP patterns for CloudWatch metrics.
  - Add fallback mock metrics for environments without live CloudWatch access.

## Phase 2: Strands Multi-Agent Swarm Orchestration
- [x] **Task 2.1: Swarm Agent Definitions**
  - Implement `src/shipswarm/swarm/agents.py` with specialized system prompts and tools for Sentinel-Sec, Sentinel-Chaos, Sentinel-CloudWatch, and Sentinel-Architect.
  - Configure `BedrockModel` with fallback strategy.
- [x] **Task 2.2: Swarm Orchestration & Event Hook**
  - Implement `src/shipswarm/swarm/orchestrator.py` initializing `strands.multiagent.swarm.Swarm`.
  - Hook into swarm execution to capture and stream events (`agent_start`, `tool_call`, `handoff`, `finding`).
  - Add integration test in `tests/test_swarm.py`.

## Phase 3: FastAPI Backend & SSE Streaming
- [x] **Task 3.1: FastAPI App and Endpoints**
  - Implement `src/shipswarm/server/app.py` with `/health`, `/api/audit` (SSE stream), and `/api/export-patch`.
  - Add CORS middleware for frontend communication.
- [x] **Task 3.2: API Testing**
  - Implement test suite in `tests/test_api.py` validating SSE output against a mock target.

## Phase 4: Frontend Web Dashboard
- [x] **Task 4.1: Project Scaffolding & Theme**
  - Initialize Vite + React + TypeScript + Tailwind in `frontend/`.
  - Setup dark-mode UI with terminal styling, radar chart, and Lucide icons.
- [x] **Task 4.2: Real-time Swarm Console & Telemetry Views**
  - Implement `SwarmConsole` displaying live handoff streams and agent thoughts.
  - Implement `ShipScoreCard`, `TelemetryView`, and `RemediationModal`.
- [x] **Task 4.3: End-to-End Local Smoke Test**
  - Verify complete flow from submitting a URL in the UI to receiving the full report and remediation patch.

## Phase 5: AWS Deployment (The Ship Gate)
- [x] **Task 5.1: S3 Website & CloudFront CDN Deployment Configuration**
  - Provision S3 website hosting bucket and configure public website policies via AWS MCP.
  - Create global CloudFront distribution `d8zyfvd7p1wi8.cloudfront.net`.
  - Upload compiled frontend bundle with proper MIME types.
- [x] **Task 5.2: Production Deployment & Public URL Verification**
  - Deploy to AWS and verify public HTTP 200 accessibility on S3 website URL.
  - Generate verbatim CLI deployment log in `deploy/aws_deployment_log.md`.
