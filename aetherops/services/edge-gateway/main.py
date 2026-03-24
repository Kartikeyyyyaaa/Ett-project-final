"""AetherOps edge API gateway — pod simulation, metrics, NATS-friendly hooks."""

from __future__ import annotations

import asyncio
import random
from dataclasses import dataclass, asdict
from typing import Any

from pydantic import BaseModel, Field

from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import CONTENT_TYPE_LATEST, Counter, Gauge, generate_latest

app = FastAPI(title="AetherOps Edge Gateway", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

REQUESTS = Counter("aetherops_http_requests_total", "HTTP requests", ["path"])
CPU_LOAD = Gauge("aetherops_simulated_cpu_load", "Simulated edge CPU load 0-1")
POD_STATUS = Gauge(
    "aetherops_pod_up",
    "1 if pod Running else 0",
    ["pod"],
)


@dataclass
class Pod:
    name: str
    namespace: str
    status: str
    role: str


# Seed pods matching 3D rack labels
_pods: dict[str, Pod] = {
    "aetherops-api": Pod(
        "aetherops-api", "aetherops", "Running", "api"
    ),
    "aetherops-worker": Pod(
        "aetherops-worker", "aetherops", "Running", "inference"
    ),
    "aetherops-inference": Pod(
        "aetherops-inference", "aetherops", "Running", "model-server"
    ),
    "aetherops-stream": Pod(
        "aetherops-stream", "aetherops", "Running", "streaming"
    ),
}

_sim_load = 0.12


def _sync_metrics() -> None:
    CPU_LOAD.set(_sim_load)
    for name, p in _pods.items():
        POD_STATUS.labels(pod=name).set(1 if p.status == "Running" else 0)


@app.get("/health")
def health() -> dict[str, str]:
    """Retrieve the baseline health status of the orchestrator API."""
    REQUESTS.labels(path="/health").inc()
    return {"status": "ok", "service": "aetherops-edge-gateway"}


@app.get("/api/v1/pods")
def list_pods() -> dict[str, Any]:
    """List all deployed pods across the edge environment alongside their simulated statuses."""
    REQUESTS.labels(path="/api/v1/pods").inc()
    return {"pods": [asdict(p) for p in _pods.values()]}


@app.post("/api/v1/pods/{name}/fail")
def fail_pod(name: str) -> dict[str, str]:
    """Force a specific pod into a Failed state to demonstrate self-healing reconciliation."""
    REQUESTS.labels(path="/api/v1/pods/fail").inc()
    if name in _pods:
        _pods[name].status = "Failed"
    _sync_metrics()
    return {"result": "failed", "pod": name}


@app.post("/api/v1/pods/{name}/recover")
def recover_pod(name: str) -> dict[str, str]:
    """Manually recover a pod or toggle its status directly back to Running phase."""
    REQUESTS.labels(path="/api/v1/pods/recover").inc()
    if name in _pods:
        _pods[name].status = "Running"
    _sync_metrics()
    return {"result": "running", "pod": name}


class CpuSim(BaseModel):
    load: float = Field(0.2, ge=0.0, le=1.0)


@app.post("/api/v1/simulate/cpu")
def simulate_cpu(body: CpuSim) -> dict[str, float]:
    """Override the global simulated CPU load metric which triggers Horizontal Pod Autoscaling."""
    global _sim_load
    REQUESTS.labels(path="/api/v1/simulate/cpu").inc()
    _sim_load = body.load
    _sync_metrics()
    return {"load": _sim_load}


@app.get("/metrics")
def metrics() -> Response:
    """Expose Prometheus system and custom edge metrics directly for scraping instances."""
    REQUESTS.labels(path="/metrics").inc()
    _sync_metrics()
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


async def _self_heal_loop() -> None:
    """Simulate Kubernetes reconciliation: failed pods return to Running."""
    while True:
        await asyncio.sleep(2.0)
        for p in _pods.values():
            if p.status == "Failed":
                if random.random() < 0.85:
                    p.status = "Running"
        _sync_metrics()


@app.on_event("startup")
async def on_startup() -> None:
    _sync_metrics()
    asyncio.create_task(_self_heal_loop())
