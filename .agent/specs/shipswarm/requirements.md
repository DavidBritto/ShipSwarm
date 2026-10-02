# Requirements: ShipSwarm AI

> Autonomous Multi-Agent Cloud Creation & Operations Engine ("Zero to Shipped")

## Feature: ShipSwarm AI Autonomous Cloud Engine

### User Story 0: Idea & GitHub Repository Ingestion
As a founder or developer, I want to input a natural language product prompt or a GitHub repository URL so that the swarm can autonomously deduce required cloud services, runtime dependencies, and scaling targets.

#### Acceptance Criteria (EARS)
- **WHEN** the user inputs a natural language prompt or public GitHub repo URL **THE SYSTEM SHALL** parse application archetype (REST API, full-stack web, event-driven microservice) and persistence requirements.
- **IF** the GitHub repository is private or unreachable **THEN THE SYSTEM SHALL** prompt for public access or fallback to prompt-driven architectural inference.
- **WHILE** ingesting project specifications **THE SYSTEM SHALL** enforce security boundaries (reject malicious repository URLs or prompt injection payloads).
- **AS SOON AS** ingestion finishes **THE SYSTEM SHALL** trigger handoff to Agent-Architect with normalized architecture parameters.

### User Story 0.5: Autonomous IaC Synthesis & AWS Provisioning
As a cloud builder with zero DevOps overhead, I want the swarm to synthesize production-ready AWS CloudFormation / CDK code and provision it directly to AWS so that I have a live, working URL in minutes.

#### Acceptance Criteria (EARS)
- **WHEN** Agent-Architect completes the topology specification **THE SYSTEM SHALL** generate syntactically valid CloudFormation / CDK templates adhering to AWS Well-Architected least-privilege standards.
- **WHILE** provisioning is executing **THE SYSTEM SHALL** stream live AWS CloudFormation stack creation events (stack status, resource creation steps) via SSE to the client.
- **IF** stack creation fails on AWS **THEN THE SYSTEM SHALL** capture CloudFormation failure events, invoke Agent-Architect to synthesize a patch, and retry deployment.
- **AS SOON AS** the stack reaches `CREATE_COMPLETE` **THE SYSTEM SHALL** extract the public output endpoint (API Gateway URL / CloudFront domain) and route it to the Sentinel verification swarm.

### User Story 1: Target Endpoint Audit & Swarm Execution
As a developer or founder shipping a newly deployed AWS application, I want to submit my public URL and architecture metadata so that an autonomous agent swarm can actively test its security, performance, and cloud health.

#### Acceptance Criteria (EARS)
- **WHEN** the user submits a valid public HTTPS target URL **THE SYSTEM SHALL** initialize the Strands Swarm with Sentinel-Sec, Sentinel-Chaos, Sentinel-CloudWatch, and Sentinel-Architect.
- **IF** the target URL is unreachable, malformed, or resolves to a private IP (SSRF protection) **THEN THE SYSTEM SHALL** reject execution with a clear validation error code and message.
- **WHILE** the swarm agents are executing tools and performing handoffs **THE SYSTEM SHALL** stream real-time JSON event packets over Server-Sent Events (SSE) to the connected client.
- **WHERE** AWS credentials and region are provided or auto-detected in the environment **THE SYSTEM SHALL** enable Sentinel-CloudWatch to pull server-side metrics during the audit.
- **AS SOON AS** all active swarm evaluations finish **THE SYSTEM SHALL** compute the aggregate ShipScore™ (0-100) and generate the consolidated audit report.

### User Story 2: Active Red-Team Security Probing
As a security-conscious engineer, I want an autonomous security agent to probe my public endpoint for common vulnerabilities so that I can catch critical oversights before users or attackers do.

#### Acceptance Criteria (EARS)
- **WHEN** Sentinel-Sec begins probing **THE SYSTEM SHALL** test security headers (HSTS, CSP, X-Frame-Options, CORS `*`), open methods, and common injection patterns against the target URL.
- **IF** a security probe triggers a server 500 error or exposes sensitive stack traces **THEN THE SYSTEM SHALL** flag a HIGH severity finding with the exact reproduction payload.
- **WHILE** running security probes **THE SYSTEM SHALL** respect rate limits (maximum 10 requests per second) to prevent self-inflicted denial of service.
- **WHEN** Sentinel-Sec completes its probe suite **THE SYSTEM SHALL** trigger a handoff (`handoff_to_agent`) to Sentinel-Chaos with the initial endpoint baseline.

### User Story 3: Chaos & Concurrency Stress-Testing
As a cloud builder, I want to know how my application behaves under burst traffic so that I can identify latency spikes and cold starts before scaling.

#### Acceptance Criteria (EARS)
- **WHEN** Sentinel-Chaos receives control **THE SYSTEM SHALL** execute structured concurrent burst waves (e.g. 10, 25, 50 concurrent async requests).
- **WHILE** the burst test runs **THE SYSTEM SHALL** collect request latencies, calculate p50, p95, p99 percentiles, and record HTTP status distributions.
- **IF** error rates exceed 10% during a burst wave **THEN THE SYSTEM SHALL** throttle back and register a degraded reliability finding.
- **AS SOON AS** concurrency waves finish **THE SYSTEM SHALL** trigger a handoff to Sentinel-CloudWatch with the burst timestamp window.

### User Story 4: Telemetry Auditing & Remediation Synthesis
As a startup team, I want actionable remediation code and architecture patches rather than raw logs so that I can fix vulnerabilities and bottlenecks in minutes.

#### Acceptance Criteria (EARS)
- **WHEN** Sentinel-CloudWatch receives the evaluation timestamp window **THE SYSTEM SHALL** query CloudWatch metrics (5xx rates, Lambda error count/duration, API Gateway latency) via Boto3.
- **WHEN** Sentinel-Architect receives handoffs and data from all peers **THE SYSTEM SHALL** synthesize findings into a normalized ShipScore™ and generate concrete CDK/Terraform and code remediation patches.
- **WHERE** the user clicks "Export Remediation" in the dashboard **THE SYSTEM SHALL** provide a downloadable zip/patch file with runnable fix scripts.

---

## Ambiguity Checklist

- [x] Defined actors: "User" (cloud builder submitting endpoint), "Sentinel Agents" (individual Strands autonomous agents), "Client" (web UI dashboard).
- [x] Negative cases defined: Invalid/private URLs (SSRF), network timeouts, rate limit throttling, degraded reliability.
- [x] Explicit limits: Rate limits (max 10 req/s on security), burst waves (10, 25, 50 requests), p50/p95/p99 latency calculations.
- [x] Temporal constraints: Real-time SSE streaming, timeout handling within 60s per agent wave.
