"""AetherOps edge API gateway — pod simulation, metrics, NATS-friendly hooks."""
import asyncio
import logging
from typing import Any
from fastapi import FastAPI, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import CONTENT_TYPE_LATEST, generate_latest

from models import Pod, CpuSim
from metrics import REQUESTS, CPU_LOAD, POD_STATUS
from tasks import self_heal_loop

# Professional logging setup
logging.basicConfig(level=logging.INFO, format="%(levelname)s:\t  %(message)s")
logger = logging.getLogger("aetherops")

app = FastAPI(title="AetherOps Edge Gateway", version="0.1.0")

# Strict CORS enforcement instead of blanket access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8088", "http://localhost:3000"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

_pods: dict[str, Pod] = {
    "aetherops-api": Pod("aetherops-api", "aetherops", "Running", "api"),
    "aetherops-worker": Pod("aetherops-worker", "aetherops", "Running", "inference"),
    "aetherops-inference": Pod("aetherops-inference", "aetherops", "Running", "model-server"),
    "aetherops-stream": Pod("aetherops-stream", "aetherops", "Running", "streaming"),
}

_sim_load = 0.12

def _sync_metrics() -> None:
    CPU_LOAD.set(_sim_load)
    for name, p in _pods.items():
        POD_STATUS.labels(pod=name).set(1 if p.status == "Running" else 0)

@app.on_event("startup")
async def on_startup() -> None:
    logger.info("*"*40)
    logger.info("   AETHEROPS EDGE GATEWAY STARTING")
    logger.info("*"*40)
    _sync_metrics()
    asyncio.create_task(self_heal_loop(_pods, _sync_metrics))

@app.get("/health")
def health() -> dict[str, Any]:
    """Deep health endpoint checking internal states."""
    REQUESTS.labels(path="/health").inc()
    return {
        "status": "ok", 
        "service": "aetherops-edge-gateway",
        "pods_managed": len(_pods)
    }

@app.get("/api/v1/pods")
def list_pods() -> dict[str, Any]:
    REQUESTS.labels(path="/api/v1/pods").inc()
    return {"pods": [p.__dict__ for p in _pods.values()]}

@app.post("/api/v1/pods/{name}/fail")
def fail_pod(name: str) -> dict[str, str]:
    REQUESTS.labels(path="/api/v1/pods/fail").inc()
    if name not in _pods:
        raise HTTPException(status_code=404, detail="Pod not found")
    _pods[name].status = "Failed"
    logger.warning(f"Pod {name} forced to crash!")
    _sync_metrics()
    return {"result": "failed", "pod": name}

@app.post("/api/v1/pods/{name}/recover")
def recover_pod(name: str) -> dict[str, str]:
    REQUESTS.labels(path="/api/v1/pods/recover").inc()
    if name not in _pods:
        raise HTTPException(status_code=404, detail="Pod not found")
    _pods[name].status = "Running"
    logger.info(f"Pod {name} manually recovered.")
    _sync_metrics()
    return {"result": "running", "pod": name}

@app.post("/api/v1/simulate/cpu")
def simulate_cpu(body: CpuSim) -> dict[str, float]:
    global _sim_load
    REQUESTS.labels(path="/api/v1/simulate/cpu").inc()
    _sim_load = body.load
    logger.info(f"Simulated CPU stress set to {_sim_load * 100}%")
    _sync_metrics()
    return {"load": _sim_load}

@app.get("/metrics")
def metrics() -> Response:
    REQUESTS.labels(path="/metrics").inc()
    _sync_metrics()
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
