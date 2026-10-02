# 🛸 ShipSwarm AI — Autonomous Production-Readiness Swarm

> **Submission for the AWS Zero to Shipped Hackathon 2026**  
> *Category:* **Workplace Efficiency / Commercial Potential** • *Lane:* **Startups**  
> *Live AWS Endpoint:* [http://shipswarm-frontend-585929637997.s3-website-us-east-1.amazonaws.com](http://shipswarm-frontend-585929637997.s3-website-us-east-1.amazonaws.com)  
> *Global CloudFront HTTPS:* [https://d8zyfvd7p1wi8.cloudfront.net](https://d8zyfvd7p1wi8.cloudfront.net)  
> *Agent Deployment Proof:* [`deploy/aws_deployment_log.md`](deploy/aws_deployment_log.md)

---

## 🎯 The Problem: Conquering "Deployment Anxiety"

The core manifesto of the AWS Zero to Shipped hackathon is helping developers ship fast. But the moment an MVP is deployed to AWS, **deployment anxiety** sets in:

* Did I misconfigure CORS or expose an open wildcard with credentials?
* Did I forget security headers (HSTS, CSP, X-Frame-Options) that leave the app vulnerable to clickjacking or MIME sniffing?
* Will a concurrent spike in traffic trigger cascading cold starts or a 5xx meltdown on my API Gateway / Lambda?
* Who monitors and stress-tests my application if I am a solo developer or an early-stage startup without a dedicated DevOps, SecOps, or QA team?

**ShipSwarm AI solves this.** It unleashes an autonomous peer-to-peer swarm of 4 specialized AI agents built with the **AWS Strands Agents SDK** and **Amazon Bedrock** that actively red-teams, stress-tests, and certifies newly shipped cloud applications on AWS.

---

## 🧠 The Architecture: AWS Strands Peer-to-Peer Swarm

ShipSwarm AI implements the **Swarm Pattern** from the newly released AWS Strands Agents SDK (`strands.multiagent.swarm.Swarm`). Instead of a rigid, hardcoded pipeline, agents collaborate peer-to-peer using dynamic `handoff_to_agent`:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Vite + React Dashboard (Live UI)                     │
│               (Real-Time SSE Event Stream & ShipScore™)                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / Server-Sent Events (SSE)
┌───────────────────────────────────▼────────────────────────────────────┐
│                         FastAPI Backend Server                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
       ┌────────────────────────────┴────────────────────────────┐
       │             AWS Strands Peer-to-Peer Swarm              │
       │                                                         │
       │   [Sentinel-Sec] ────handoff───► [Sentinel-Chaos]       │
       │          ▲                              │               │
       │       handoff                        handoff            │
       │          │                              ▼               │
       │   [Sentinel-Architect] ◄──handoff──── [Sentinel-CW]     │
       └──────────────┬──────────────────────────┬───────────────┘
                      │                          │
               Amazon Bedrock             AWS MCP / Boto3
             (Claude / Nova Pro)        (CloudWatch Telemetry)
```

### The 4 Peer Agents

1. **🛡️ Sentinel-Sec (Red-Team Security Prober):**
   * Actively audits the public endpoint for missing critical security headers (`Strict-Transport-Security`, `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`).
   * Probes CORS configuration against unauthorized origins to catch wildcard/reflected origin vulnerabilities.
   * Checks error responses for stack trace disclosures and internal environment leaks.
   * Executes dynamic handoff to Sentinel-Chaos with the baseline security profile.

2. **⚡ Sentinel-Chaos (Concurrency & Latency Stress Tester):**
   * Fires concurrent async HTTP burst waves (15-50 requests).
   * Calculates response metrics: **p50 (median)**, **p95 (tail latency)**, **p99 (spike)**, and error percentages.
   * Detects serverless cold-start degradation heuristics.
   * Executes dynamic handoff to Sentinel-CloudWatch with the burst time window.

3. **📊 Sentinel-CloudWatch (AWS Cloud Telemetry Auditor):**
   * Queries real-time server-side CloudWatch metrics (`AWS/ApiGateway`, `AWS/Lambda`) across the evaluation window via Boto3 / AWS MCP.
   * Tracks total invocations, 5xx server errors, average durations, and throttles.
   * Executes dynamic handoff to Sentinel-Architect with correlated infrastructure telemetry.

4. **🏆 Sentinel-Architect (Chief Synthesis & Certification Officer):**
   * Synthesizes all evidence from its peer agents.
   * Computes the normalized **ShipScore™ (0 to 100)** and assigns a production readiness letter grade (**A through F**).
   * Generates actionable, production-ready **AWS CDK (Python)** and **FastAPI / CloudFront middleware** remediation patches.

---

## 🚀 Live Demo & Deployment (The Ship Gate)

* **S3 Static Website (Active & Live):**  
  👉 [http://shipswarm-frontend-585929637997.s3-website-us-east-1.amazonaws.com](http://shipswarm-frontend-585929637997.s3-website-us-east-1.amazonaws.com)
* **CloudFront CDN Distribution:**  
  👉 [https://d8zyfvd7p1wi8.cloudfront.net](https://d8zyfvd7p1wi8.cloudfront.net)
* **Full Deployment CLI Log:** See [`deploy/aws_deployment_log.md`](deploy/aws_deployment_log.md) for verbatim proof of the coding agent connecting to AWS and provisioning resources.

---

## 🛠️ Quickstart (Run Locally)

### Prerequisites
* Python 3.12+ with [`uv`](https://docs.astral.sh/uv/)
* Node.js v20+ with npm

### 1. Install Backend Dependencies
```bash
uv sync
```

### 2. Run Test Suite (22 Unit & Integration Tests)
```bash
uv run pytest tests/
```
```
tests/test_api.py ...                                                    [ 13%]
tests/test_aws_telemetry.py ..                                           [ 22%]
tests/test_chaos_prober.py ...                                           [ 36%]
tests/test_schemas.py .....                                              [ 59%]
tests/test_security_prober.py ......                                     [ 86%]
tests/test_swarm.py ...                                                  [100%]

============================= 22 passed in 10.90s ==============================
```

### 3. Build Frontend & Launch Full-Stack Server
```bash
# Build the React/Tailwind frontend
cd frontend && npm install && npm run build && cd ..

# Launch the unified FastAPI + Strands server
uv run uvicorn shipswarm.server.app:app --host 0.0.0.0 --port 8000
```
Open your browser at `http://localhost:8000` to interact with the live Swarm Console.

---

## 🏆 Why ShipSwarm AI Deserves to Win

1. **Directly addresses the hackathon core thesis:** Transforms "deployment anxiety" into verifiable confidence on Day 0.
2. **Powered by AWS's flagship framework:** Leverages the official **AWS Strands Agents SDK** with peer-to-peer swarms and Bedrock integration.
3. **Real Engineering over Prompts:** Executes genuine network probing, concurrency measurements, and CloudWatch metrics — not a generic text wrapper.
4. **Passes the Ship Gate with Honors:** 100% deployed on AWS with verified public URLs and documented coding agent execution logs.
