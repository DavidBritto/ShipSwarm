# AWS Deployment & Coding Agent Execution Log

**Project:** ShipSwarm AI  
**Event:** AWS Zero to Shipped Hackathon 2026  
**Agent:** Antigravity Coding Assistant (Connected via Official AWS MCP Server)  
**AWS Account ID:** `585929637997`  
**Target Region:** `us-east-1` (N. Virginia)  
**Timestamp:** `2026-10-02T20:13:48Z` (Invalidation: `I4RU4X6HNUXHPD5WY3AI2QEHX5`)

---

## 1. Verified Live Public Endpoints (Ship Gate)

| Component | Endpoint | Status |
| :--- | :--- | :--- |
| **CloudFront Global HTTPS** | `https://d8zyfvd7p1wi8.cloudfront.net` | HTTP 200 (Deployed) |
| **S3 Website Production** | `http://shipswarm-frontend-585929637997.s3-website-us-east-1.amazonaws.com` | HTTP 200 OK |
| **Local Full-Stack Server** | `http://localhost:8000/health` | HTTP 200 OK (FastAPI + Strands) |

### Live HTTP Verification Probe

```bash
$ curl -I "http://shipswarm-frontend-585929637997.s3-website-us-east-1.amazonaws.com"

HTTP/1.1 200 OK
x-amz-id-2: /eHDy0zhAohApXByDEVqBKwiEirddR1Z3ONryJoBOGE7sDrFY4WUxxnzgriwKJb099A5Ti3yskM=
x-amz-request-id: NERYQG69J4QV7C7F
Date: Fri, 02 Oct 2026 00:13:26 GMT
Last-Modified: Fri, 02 Oct 2026 00:13:12 GMT
ETag: "7a67698d181ae6d335f36702a1908a9c"
Content-Type: text/html
Content-Length: 458
Server: AmazonS3
```

---

## 2. Documented AI Agent Connection to AWS

The AI coding agent interacted with AWS using the **AWS Model Context Protocol (MCP)** tool `aws___run_script` with asynchronous `call_boto3` execution.

### Step 2.1: Identity Verification
```json
{
  "service": "sts",
  "operation": "GetCallerIdentity",
  "result": {
    "UserId": "585929637997",
    "Account": "585929637997",
    "Arn": "arn:aws:iam::585929637997:root"
  }
}
```

### Step 2.2: S3 Bucket Provisioning & Website Policy
```python
# Executed by Coding Agent via aws___run_script
bucket_name = "shipswarm-frontend-585929637997"

# 1. Create S3 Bucket
await call_boto3(service_name="s3", operation_name="CreateBucket", params={"Bucket": bucket_name})

# 2. Configure S3 Website Hosting
await call_boto3(
    service_name="s3",
    operation_name="PutBucketWebsite",
    params={
        "Bucket": bucket_name,
        "WebsiteConfiguration": {
            "IndexDocument": {"Suffix": "index.html"},
            "ErrorDocument": {"Key": "index.html"},
        }
    }
)

# 3. Apply Public Read Website Bucket Policy
policy = {
    "Version": "2012-10-17",
    "Statement": [{
        "Sid": "PublicReadGetObject",
        "Effect": "Allow",
        "Principal": "*",
        "Action": "s3:GetObject",
        "Resource": f"arn:aws:s3:::{bucket_name}/*"
    }]
}
await call_boto3(service_name="s3", operation_name="PutBucketPolicy", params={"Bucket": bucket_name, "Policy": json.dumps(policy)})
```

### Step 2.3: CloudFront Global CDN Distribution
```python
# Executed by Coding Agent via aws___run_script
dist_config = {
    "CallerReference": f"shipswarm-{int(time.time())}",
    "Comment": "ShipSwarm AI Frontend - AWS Zero to Shipped Hackathon",
    "Enabled": True,
    "Origins": {
        "Quantity": 1,
        "Items": [{
            "Id": "S3-ShipSwarm-Website",
            "DomainName": "shipswarm-frontend-585929637997.s3-website-us-east-1.amazonaws.com",
            "CustomOriginConfig": {
                "HTTPPort": 80,
                "HTTPSPort": 443,
                "OriginProtocolPolicy": "http-only"
            }
        }]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-ShipSwarm-Website",
        "ViewerProtocolPolicy": "redirect-to-https",
        "AllowedMethods": {"Quantity": 2, "Items": ["GET", "HEAD"]},
        "MinTTL": 0, "DefaultTTL": 86400, "MaxTTL": 31536000
    }
}
# Result: Created CloudFront Distribution E32SRSMQI9XROF (d8zyfvd7p1wi8.cloudfront.net)
```

---

## 3. Technology Stack & Frameworks

* **AI Agent Orchestration:** AWS Strands Agents SDK (`strands-agents` v1.57.2 with `strands.multiagent.swarm.Swarm`)
* **LLM Foundation:** Amazon Bedrock (`amazon.nova-pro-v1:0`, `anthropic.claude-3-5-sonnet`)
* **Agent Operations & Telemetry:** AWS MCP Server (`aws___run_script` / Boto3 CloudWatch)
* **Backend:** Python 3.12, FastAPI, SSE-Starlette, Pydantic v2
* **Frontend:** Vite, React 19, TypeScript, Tailwind CSS, Lucide Icons
* **Package Manager:** `uv` 0.12.19
