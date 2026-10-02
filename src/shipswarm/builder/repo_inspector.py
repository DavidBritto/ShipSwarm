"""GitHub repository and natural language prompt inspector for ShipSwarm AI."""

from __future__ import annotations

import re
from typing import Dict, List, Literal, Optional
from urllib.parse import urlparse

import httpx
from pydantic import BaseModel, Field


class ProjectSpecification(BaseModel):
    """Normalized specification extracted from a prompt or repository."""

    name: str
    archetype: Literal["api", "web", "serverless", "event-driven"] = "serverless"
    detected_framework: str = "generic"
    dependencies: List[str] = Field(default_factory=list)
    description: str = ""
    suggested_endpoints: List[str] = Field(default_factory=lambda: ["/health", "/api/items"])
    env_vars: Dict[str, str] = Field(default_factory=dict)


def _parse_github_repo_coords(repo_url: str) -> Optional[tuple[str, str]]:
    """Extract owner and repo name from GitHub URL."""
    try:
        parsed = urlparse(repo_url.strip())
        if "github.com" not in parsed.netloc:
            return None
        parts = [p for p in parsed.path.strip("/").split("/") if p]
        if len(parts) >= 2:
            owner = parts[0]
            repo = parts[1].replace(".git", "")
            return owner, repo
        return None
    except Exception:
        return None


async def inspect_github_repo(repo_url: str) -> ProjectSpecification:
    """Inspect a public GitHub repository to detect framework and structure."""
    coords = _parse_github_repo_coords(repo_url)
    if not coords:
        # Fallback to general parsing
        name = "github-app"
        return ProjectSpecification(
            name=name,
            archetype="api",
            detected_framework="unknown",
            description=f"Public repository: {repo_url}",
        )

    owner, repo = coords
    name = re.sub(r"[^a-zA-Z0-9-]", "-", repo).lower()

    # Attempt to fetch repo manifests (package.json, pyproject.toml, requirements.txt, README.md)
    branches = ["main", "master"]
    manifest_files = [
        "pyproject.toml",
        "requirements.txt",
        "package.json",
        "README.md",
    ]

    detected_framework = "python-serverless"
    archetype: Literal["api", "web", "serverless", "event-driven"] = "serverless"
    dependencies: List[str] = []
    description = f"Repository imported from https://github.com/{owner}/{repo}"

    async with httpx.AsyncClient(timeout=5.0) as client:
        for branch in branches:
            # Check package.json (Node/TS)
            pkg_url = f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}/package.json"
            try:
                resp = await client.get(pkg_url)
                if resp.status_code == 200:
                    data = resp.json()
                    deps = {**data.get("dependencies", {}), **data.get("devDependencies", {})}
                    dependencies = list(deps.keys())[:10]
                    if "next" in deps:
                        detected_framework = "nextjs"
                        archetype = "web"
                    elif "express" in deps or "fastify" in deps:
                        detected_framework = "node-api"
                        archetype = "api"
                    if "description" in data and data["description"]:
                        description = data["description"]
                    break
            except Exception:
                pass

            # Check requirements.txt or pyproject.toml (Python)
            req_url = f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}/requirements.txt"
            try:
                resp = await client.get(req_url)
                if resp.status_code == 200:
                    lines = [line.strip().split("==")[0].split(">=")[0] for line in resp.text.splitlines() if line.strip() and not line.startswith("#")]
                    dependencies = lines[:10]
                    if any("fastapi" in dep.lower() for dep in lines):
                        detected_framework = "fastapi"
                        archetype = "api"
                    elif any("flask" in dep.lower() for dep in lines):
                        detected_framework = "flask"
                        archetype = "api"
                    break
            except Exception:
                pass

    return ProjectSpecification(
        name=name,
        archetype=archetype,
        detected_framework=detected_framework,
        dependencies=dependencies,
        description=description,
    )


def inspect_prompt(prompt_text: str, project_name: str = "shipswarm-app") -> ProjectSpecification:
    """Analyze a natural language product prompt to infer archetype and tech stack."""
    lower = prompt_text.lower()

    archetype: Literal["api", "web", "serverless", "event-driven"] = "serverless"
    detected_framework = "fastapi"
    suggested_endpoints = ["/health", "/api/items", "/api/stats"]

    if any(k in lower for k in ("next", "react", "frontend", "dashboard", "landing", "web")):
        archetype = "web"
        detected_framework = "nextjs-cloudfront"
        suggested_endpoints = ["/", "/health", "/api/hello"]
    elif any(k in lower for k in ("queue", "event", "sqs", "sns", "webhook", "stream", "kafka")):
        archetype = "event-driven"
        detected_framework = "event-lambda"
        suggested_endpoints = ["/webhook", "/health"]
    elif any(k in lower for k in ("api", "graphql", "rest", "crud", "microservice", "service")):
        archetype = "api"
        detected_framework = "fastapi-serverless"
        suggested_endpoints = ["/health", "/api/v1/resource", "/api/v1/metrics"]

    # Extract name hints if user specified "for [name]" or "called [name]"
    name_match = re.search(r"(?:called|named|project)\s+([a-zA-Z0-9_-]+)", prompt_text, re.IGNORECASE)
    if name_match:
        project_name = name_match.group(1).lower()

    name = re.sub(r"[^a-zA-Z0-9-]", "-", project_name).strip("-") or "shipswarm-app"

    return ProjectSpecification(
        name=name,
        archetype=archetype,
        detected_framework=detected_framework,
        description=prompt_text.strip(),
        suggested_endpoints=suggested_endpoints,
    )


async def synthesize_project_context(
    prompt: Optional[str] = None,
    github_repo_url: Optional[str] = None,
    project_name: str = "shipswarm-app",
) -> ProjectSpecification:
    """Entry point to normalize any combination of prompt or repo URL into a ProjectSpecification."""
    if github_repo_url:
        spec = await inspect_github_repo(github_repo_url)
        if prompt:
            spec.description = f"{spec.description} | Additional Instructions: {prompt}"
        return spec
    elif prompt:
        return inspect_prompt(prompt, project_name=project_name)
    else:
        return ProjectSpecification(name=project_name, description="Default AWS Serverless application")
