"""FastAPI Application and SSE Streaming Endpoints for ShipSwarm AI."""

from __future__ import annotations

import json
from typing import AsyncGenerator
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse

from shipswarm import __version__
from shipswarm.builder.orchestrator import CloudEngineOrchestrator
from shipswarm.models.schemas import (
    AuditReport,
    AuditRequest,
    BuildReport,
    BuildRequest,
    SwarmEvent,
)
from shipswarm.swarm.orchestrator import ShipSwarmOrchestrator


def create_app() -> FastAPI:
    """Create and configure the ShipSwarm FastAPI application."""
    app = FastAPI(
        title="ShipSwarm AI",
        description="Autonomous Multi-Agent Production-Readiness Swarm (AWS Strands)",
        version=__version__,
    )

    # Enable CORS for local Vite dev server and production deployments
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    orchestrator = ShipSwarmOrchestrator()
    cloud_engine = CloudEngineOrchestrator()

    @app.get("/health")
    async def health_check():
        """Health check endpoint required by the Ship Gate."""
        return {
            "status": "ok",
            "version": __version__,
            "service": "shipswarm-api",
            "swarm": "online",
            "provider": "aws-strands",
        }

    @app.post("/api/build/stream")
    async def stream_build(request: BuildRequest):
        """Stream autonomous cloud building, provisioning, and verification over SSE."""
        async def event_generator() -> AsyncGenerator[dict, None]:
            try:
                async for event in cloud_engine.stream_build(request):
                    yield {
                        "event": event.event_type.value,
                        "data": event.model_dump_json(),
                    }
            except Exception as exc:
                err_event = SwarmEvent(
                    event_type="error",
                    agent_name="CloudEngine",
                    message=f"Autonomous build error: {exc}",
                )
                yield {
                    "event": "error",
                    "data": err_event.model_dump_json(),
                }

        return EventSourceResponse(event_generator())

    @app.post("/api/audit", response_model=AuditReport)
    async def run_audit(request: AuditRequest) -> AuditReport:
        """Run the full swarm audit synchronously and return the final report."""
        try:
            return await orchestrator.run_audit(request)
        except ValueError as val_err:
            raise HTTPException(status_code=400, detail=str(val_err))
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Audit failed: {exc}")

    @app.post("/api/audit/stream")
    async def stream_audit(request: AuditRequest):
        """Stream peer-to-peer swarm deliberation and evaluation events over SSE."""
        async def event_generator() -> AsyncGenerator[dict, None]:
            try:
                async for event in orchestrator.stream_audit(request):
                    yield {
                        "event": event.event_type.value,
                        "data": event.model_dump_json(),
                    }
            except Exception as exc:
                err_event = SwarmEvent(
                    event_type="error",
                    agent_name="System",
                    message=f"Stream error: {exc}",
                )
                yield {
                    "event": "error",
                    "data": err_event.model_dump_json(),
                }

        return EventSourceResponse(event_generator())

    @app.post("/api/export-patch")
    async def export_patch(report: AuditReport):
        """Export the remediation patch as a downloadable text file."""
        content = report.remediation_patch or "# No remediation patch generated"
        return Response(
            content=content,
            media_type="text/plain",
            headers={"Content-Disposition": "attachment; filename=shipswarm_remediation.patch"},
        )

    # Mount static frontend build if present
    import os
    from fastapi.staticfiles import StaticFiles

    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
    dist_dir = os.path.join(root_dir, "frontend", "dist")
    if os.path.isdir(dist_dir):
        app.mount("/", StaticFiles(directory=dist_dir, html=True), name="frontend")

    return app


app = create_app()
