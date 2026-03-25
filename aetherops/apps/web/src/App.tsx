import { useCallback, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { ServerRackScene } from "./components/ServerRackScene";
import { LiveInference } from "./components/LiveInference";
import { useTheme } from "./hooks/useTheme";
import { PodState, fetchPods, simulateCpuLoad } from "./lib/api";

export function App() {
  const { theme, toggleTheme } = useTheme();
  const [pods, setPods] = useState<PodState[]>([]);
  const [edgeConnected, setEdgeConnected] = useState(false);
  const [cpuLoad, setCpuLoad] = useState(0.12);
  const [showArch, setShowArch] = useState(false);

  const refreshPods = useCallback(async () => {
    try {
      const list = await fetchPods();
      setPods(list);
      setEdgeConnected(true);
    } catch {
      setEdgeConnected(false);
      setPods([]);
    }
  }, []);

  useEffect(() => {
    refreshPods();
    const id = setInterval(refreshPods, 1500);
    return () => clearInterval(id);
  }, [refreshPods]);

  const summary = useMemo(() => {
    const failed = pods.filter((p) => p.status !== "Running").length;
    return { failed, total: pods.length };
  }, [pods]);

  const workerReplicas = Math.min(
    3,
    Math.max(1, Math.ceil(cpuLoad * 2.2))
  );

  const [prevReplicas, setPrevReplicas] = useState(workerReplicas);
  const [replicaAnim, setReplicaAnim] = useState(false);
  useEffect(() => {
    if (workerReplicas !== prevReplicas) {
      setReplicaAnim(true);
      const timer = setTimeout(() => setReplicaAnim(false), 400);
      setPrevReplicas(workerReplicas);
      return () => clearTimeout(timer);
    }
  }, [workerReplicas, prevReplicas]);

  const handleResolutionChange = useCallback(
    async (load: number) => {
      setCpuLoad(load);
      try {
        await simulateCpuLoad(load);
      } catch {
        /* offline demo */
      }
    },
    []
  );

  if (pods.length === 0 && !edgeConnected) {
    return (
      <div className={`app-shell ${theme}`} style={{ alignItems: "center", justifyContent: "center" }}>
        <h2 style={{ color: "var(--accent)", fontFamily: "var(--mono)", animation: "warnFlash 1.5s infinite alternate" }}>Waking up Edge Orchestrator...</h2>
      </div>
    );
  }

  return (
    <div className={`app-shell ${theme} ${cpuLoad > 0.85 ? "danger-flash" : ""}`}>
      {showArch && (
        <div onClick={() => setShowArch(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center'}}>
          <div onClick={e => e.stopPropagation()} style={{ background:'var(--bg-panel)', padding:'2rem', borderRadius:'14px', maxWidth:'500px', border:'1px solid var(--border)'}}>
            <h3>AetherOps Architecture</h3>
            <p><strong>Cloud Layer:</strong> EKS / GKE central management planes.</p>
            <p><strong>Edge Layer:</strong> K3s clusters running close to data sources.</p>
            <p><strong>Message Bus:</strong> NATS embedded JetStream for real-time state sync.</p>
            <p><strong>Orchestration:</strong> React (Client) ↔ FastAPI (Edge API) ↔ Pods.</p>
            <button className="btn" style={{ marginTop: '1rem' }} onClick={() => setShowArch(false)}>Close</button>
          </div>
        </div>
      )}
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark" aria-hidden />
          <div>
            <h1>AetherOps</h1>
            <span>Multi-cloud edge AI orchestrator</span>
          </div>
        </div>
        <div className="header-actions">
          <span
            className={`status-pill ${edgeConnected ? "ok" : "warn"}`}
            title="Edge API gateway"
          >
            {edgeConnected ? "EDGE LINK ✓" : "EDGE OFFLINE (demo)"}
          </span>
          <button
            type="button"
            className="theme-toggle"
            onClick={() => setShowArch(true)}
            aria-label="View architecture"
            style={{ marginRight: '0.2rem' }}
          >
            ℹ️ Info
          </button>
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? "☀ Light" : "🌙 Dark"}
          </button>
        </div>
      </header>

      <main className="main-grid">
        <section className="panel">
          <div className="panel-header">
            <span>3D observability — edge rack</span>
            <small>
              {summary.failed > 0
                ? `${summary.failed} alert(s)`
                : "All pods healthy"}
            </small>
          </div>
          <div className="panel-body">
            <Canvas camera={{ position: [4.2, 2.6, 5.2], fov: 45 }}>
              <color attach="background" args={["#020617"]} />
              <ambientLight intensity={0.35} />
              <spotLight
                position={[6, 8, 4]}
                angle={0.35}
                penumbra={0.6}
                intensity={1.2}
                castShadow
              />
              <ServerRackScene pods={pods} />
              <Environment preset="city" />
              <OrbitControls
                enablePan
                minPolarAngle={0.35}
                maxPolarAngle={Math.PI / 2.05}
              />
            </Canvas>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <span>Live AI inferencing</span>
            <small>COCO-SSD · edge worker pool</small>
          </div>
          <div className="panel-body" style={{ minHeight: 320 }}>
            <LiveInference onLoadChange={handleResolutionChange} />
          </div>
        </section>

        <div className="metrics-row">
          <div className="metric-card" title="Simulated metric causing the orchestrator to scale the worker deployment.">
            <h3>Simulated CPU (edge)</h3>
            <div className={`metric-value ${cpuLoad > 0.85 ? "danger-flash" : ""}`}>{(cpuLoad * 100).toFixed(0)}%</div>
            <div className="metric-sub">
              Raise resolution to spike load — HPA scales workers
            </div>
          </div>
          <div className="metric-card" title="Actively managed Horizontal Pod Autoscaling (HPA) replica instances.">
            <h3>Worker replicas</h3>
            <div className={`metric-value ${replicaAnim ? "replica-anim" : ""}`}>{workerReplicas}</div>
            <div className="metric-sub">
              Auto-scaled when load &gt; 75% (demo heuristic)
            </div>
          </div>
          <div className="metric-card" title="Live status check of the internal Kubernetes clusters running our microservices.">
            <h3>Pod health</h3>
            <div className="metric-value">
              {summary.total - summary.failed}/{summary.total}
            </div>
            <div className="metric-sub">Running / total (edge API)</div>
          </div>
        </div>
      </main>

      <footer className="footer-bar">
        AetherOps · K3s edge · Kafka/NATS · Istio · Argo CD · Chaos Mesh
      </footer>
    </div>
  );
}
