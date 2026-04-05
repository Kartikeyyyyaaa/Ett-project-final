# AetherOps (v1.0.0 Production Release)

**AetherOps** is a demo-oriented **multi-cloud edge AI orchestrator**: lightweight Kubernetes at the edge (K3s), central clusters (EKS/GKE patterns), **Istio** for traffic and service graphs, **NATS** (with Kafka as an alternative) for event streaming, **Chaos Mesh** for resilience demos, and **Argo CD** for GitOps.

This repository gives you:

- A **3D observability** view (React + Three.js / react-three-fiber): a server rack with per-pod status lights that turn **red** when a pod is failed and **green** when healthy.
- **Live object detection** in the browser (TensorFlow.js COCO-SSD) with a **simulated CPU load** slider — turn up “resolution load” to narrate autoscaling.
- An **edge API** (FastAPI) exposing pod state, Prometheus metrics, and a **self-healing** loop that flips failed pods back to `Running` (presentation stand-in for a Deployment reconciler).
- **Docker Compose** for Prometheus + Grafana + NATS + the stack.
- **Kubernetes**, **Istio**, **Argo CD**, and **Chaos Mesh** manifests to take the story into a real cluster when you are ready.

## Quick start (local)

**Option A — full stack (recommended for demos)**

```bash
cd infra
docker compose up --build
```

- Web UI: [http://localhost:8088](http://localhost:8088) (proxies `/api` to the edge gateway)
- Edge API: [http://localhost:8080](http://localhost:8080)
- Prometheus: [http://localhost:9090](http://localhost:9090)
- Grafana: [http://localhost:3000](http://localhost:3000) (default admin / `aetherops` — change in production)
- NATS: `4222` (monitoring `8222`)

**Option B — dev (hot reload)**

```bash
# Terminal 1
make api

# Terminal 2
make web
```

Open [http://localhost:5173](http://localhost:5173). The Vite dev server proxies `/api` and `/metrics` to the API on port **`8081` by default** (many Macs already use `8080` for Java/IDE tools). Override with `AETHEROPS_API_PORT` in both terminals if needed.

## Presentation moments

See [docs/PRESENTATION.md](docs/PRESENTATION.md) for a short script: self-healing (`scripts/demo-self-heal.sh`), GitOps with Argo CD, and the **security gate** workflow that scans a deliberately vulnerable image under `examples/insecure-image/`.

## Grafana “Canvas / Three.js”

The primary 3D experience for your talk is the **first-party web dashboard** (`apps/web`), so the demo works offline and version-pins cleanly. You can additionally install Grafana **Canvas** or **Three.js** plugins and embed the same UI or metrics — see the presentation doc.

## Project layout

| Path | Purpose |
|------|---------|
| `apps/web` | Vite + React + react-three-fiber + TF.js inference UI |
| `services/edge-gateway` | FastAPI gateway, `/api/v1/pods`, `/metrics` |
| `infra/docker-compose.yml` | Local stack |
| `infra/k8s` | Namespaced deployments and HPA |
| `infra/istio` | Gateway, `VirtualService`, `DestinationRule` |
| `infra/argocd` | Sample `Application` (set your `repoURL`) |
| `infra/chaos-mesh` | Example `PodChaos` |
| `.github/workflows` | CI build + Trivy; optional failing security gate |

## License

MIT — use freely for portfolios and presentations.
