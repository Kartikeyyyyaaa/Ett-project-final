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

  return (
    <div className={`app-shell ${theme}`}>
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
          <div className="metric-card">
            <h3>Simulated CPU (edge)</h3>
            <div className="metric-value">{(cpuLoad * 100).toFixed(0)}%</div>
            <div className="metric-sub">
              Raise resolution to spike load — HPA scales workers
            </div>
          </div>
          <div className="metric-card">
            <h3>Worker replicas</h3>
            <div className="metric-value">{workerReplicas}</div>
            <div className="metric-sub">
              Auto-scaled when load &gt; 75% (demo heuristic)
            </div>
          </div>
          <div className="metric-card">
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
