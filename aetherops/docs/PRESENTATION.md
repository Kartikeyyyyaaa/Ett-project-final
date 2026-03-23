# AetherOps — presentation script

## Setup (before the audience)

1. **Local stack**: `make compose` from repo root (or `make api` + `make web` for dev).
2. Open **http://localhost:8088** for the web UI (compose) or **http://localhost:5173** with API on **8080**.
3. Optional: Grafana **http://localhost:3000** (admin / aetherops), Prometheus **http://localhost:9090**.

## Moment 1 — Self-healing

1. Run `./scripts/demo-self-heal.sh` (with API reachable).
2. Point to the 3D rack: one unit flashes red when status is `Failed`, then returns to green as the API reconciles (simulating a Deployment controller).

**Line:** “The control plane keeps desired state; transient failures are corrected without manual intervention.”

## Moment 2 — GitOps (Argo CD)

1. Fork the repo and set `infra/argocd/application.yaml` `repoURL` to your Git remote.
2. Install Argo CD in a cluster, apply the Application manifest.
3. Toggle **light/dark** in `apps/web/src/hooks/useTheme.ts` default or in `styles.css` tokens — commit and push.
4. Show Argo CD UI: **OutOfSync → Synced** and rolling update.

**Line:** “Git is the source of truth; the cluster converges automatically.”

## Moment 3 — Security gate

1. Push a change under `examples/insecure-image/` or run workflow **Security gate** manually in GitHub Actions.
2. Trivy fails on **HIGH/CRITICAL** against the deliberately weak base image.

**Line:** “Vulnerable artifacts never reach production — the pipeline is the gate.”

## Grafana 3D / Canvas

Install the **Canvas** or **Three.js** community plugin in Grafana and embed your observability URL or a custom panel. This repo’s primary 3D experience is the **React + react-three-fiber** dashboard in `apps/web` for a reliable demo without plugin versions.

## Istio service graph

With Istio installed and metrics enabled, open **Kiali** or Grafana’s service graph to show traffic between `aetherops-web` and `aetherops-edge-gateway` using `infra/istio/virtualservice.yaml` as a starting point.

## Chaos Mesh

Apply `infra/chaos-mesh/pod-chaos-example.yaml` only on a disposable cluster. Shows controlled pod failure during a resilience segment.
