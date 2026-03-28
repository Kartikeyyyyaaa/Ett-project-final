"""Prometheus metrics configuration for the AetherOps API."""
from prometheus_client import Counter, Gauge

REQUESTS = Counter(
    "aetherops_http_requests_total",
    "Total HTTP requests to the Edge API",
    ["path"]
)

CPU_LOAD = Gauge(
    "aetherops_simulated_cpu_load",
    "Current simulated edge CPU load from 0-1"
)

POD_STATUS = Gauge(
    "aetherops_pod_up",
    "Binary status: 1 if pod is Running else 0",
    ["pod"]
)
