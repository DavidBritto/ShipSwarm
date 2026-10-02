# Steering

> Persistent project context for ShipSwarm AI.

## Purpose

ShipSwarm AI is an autonomous, peer-to-peer multi-agent cloud creation and operations engine ("Zero to Shipped") powered by the AWS Strands Agents SDK and Amazon Bedrock. It transforms natural language product prompts or GitHub repositories into fully architected, provisioned, hardened, and verified live AWS cloud infrastructures, closing the loop with active multi-agent red-team security probing, concurrent chaos stress-testing, and self-healing.

## Principles

- **Concepts > Code:** Every agent has a clear, non-overlapping boundary, specialized prompt, and strict contract.
- **Action over Generation:** Agents do not merely output markdown; they synthesize AWS CDK / CloudFormation templates, provision real resources via Boto3, and actively attack/benchmark live endpoints.
- **End-to-End Autonomous Lifecycle:** Complete "Zero to Shipped" pipeline: Idea/Repo -> Cloud Topology -> IaC Synthesis -> AWS Provisioning -> Live Swarm Stress Test -> Verified Public URL.
- **Fail Gracefully & Self-Heal:** Deployment errors or runtime vulnerabilities trigger closed-loop self-healing by the Sentinel-Architect agent.
- **Zero Fluff:** Code and artifacts must be production-grade, typed, and verifiable against EARS criteria.
- **Verifiable Ship Gate:** Every deployed artifact must be publicly reachable on AWS with documented agent connection proof.

## Stack

- **Core Framework:** AWS Strands Agents SDK (`strands-agents` v1.57+ with `Swarm` and `BedrockModel`)
- **Language / Runtime:** Python 3.12 managed via `uv`
- **Backend API:** FastAPI with Server-Sent Events (SSE) for real-time swarm streaming
- **Cloud & AI Provider:** Amazon Bedrock (Nova Pro / Claude 3.5 Sonnet / Haiku via Converse API)
- **Infrastructure & Deployer:** AWS CloudFormation / Boto3 / AWS CDK (Python)
- **Telemetry & Ops:** AWS MCP (`aws___run_script` / Boto3 for CloudWatch & Lambda metrics)
- **Frontend UI:** Vite + React + Tailwind CSS + Lucide Icons (deployed on AWS S3 & CloudFront CDN)

## Project Structure

```
zero-to-shipped/
├── .agent/
│   ├── steering.md
│   └── specs/
│       └── shipswarm/
│           ├── requirements.md
│           ├── design.md
│           ├── tasks.md
│           └── verification.md
├── src/
│   └── shipswarm/
│       ├── __init__.py
│       ├── config.py
│       ├── models/
│       │   ├── __init__.py
│       │   └── schemas.py
│       ├── builder/
│       │   ├── __init__.py
│       │   ├── repo_inspector.py
│       │   ├── architect_synthesizer.py
│       │   ├── iac_generator.py
│       │   └── aws_deployer.py
│       ├── tools/
│       │   ├── __init__.py
│       │   ├── security_prober.py
│       │   ├── chaos_prober.py
│       │   └── aws_telemetry.py
│       ├── swarm/
│       │   ├── __init__.py
│       │   ├── agents.py
│       │   └── orchestrator.py
│       └── server/
│           ├── __init__.py
│           ├── app.py
│           └── routes.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── tests/
│   ├── test_security_prober.py
│   ├── test_chaos_prober.py
│   ├── test_swarm.py
│   └── test_api.py
├── pyproject.toml
└── README.md
```

## Agent Rules

- Follow Spec-Driven Development (SDD): Update specs before code when contracts change.
- Keep requirements testable with explicit EARS keywords.
- Slices must be atomic, focused, and test-covered.
- Verify the Ship Gate (public reachable URL on AWS) before final submission.

## Conventions

- `requirements.md` → The **what** (User stories & EARS criteria)
- `design.md` → The **how** (Architecture, data flow, component design, failure modes)
- `tasks.md` → The **order** (Incremental delivery order)
- `verification.md` → The **done checklist** (Traceability & test verification)
- `steering.md` → **Context** and stack definitions
