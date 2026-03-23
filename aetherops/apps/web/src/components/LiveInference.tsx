import { useCallback, useEffect, useRef, useState } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

type Props = {
  onLoadChange: (load: number) => void;
};

export function LiveInference({ onLoadChange }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolution, setResolution] = useState(0.5);
  const modelRef = useRef<cocoSsd.ObjectDetection | null>(null);
  const rafRef = useRef<number>(0);

  const loadModel = useCallback(async () => {
    try {
      const m = await cocoSsd.load({ base: "mobilenet_v2" });
      modelRef.current = m;
      setReady(true);
    } catch (e) {
      setError("Could not load model (network may be required)");
      console.error(e);
    }
  }, []);

  useEffect(() => {
    void loadModel();
  }, [loadModel]);

  useEffect(() => {
    onLoadChange(resolution);
  }, [resolution, onLoadChange]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const videoEl = videoRef.current;
    if (!videoEl) return;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 640, height: 480 },
          audio: false,
        });
        const v = videoRef.current;
        if (!v) return;
        v.srcObject = stream;
        await v.play();
      } catch {
        setError("Camera permission denied or unavailable");
      }
    }
    void start();
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const model = modelRef.current;
    if (!video || !canvas || !model || !ready) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let last = 0;
    const interval = 120;

    const tick = async (t: number) => {
      rafRef.current = requestAnimationFrame(tick);
      if (t - last < interval) return;
      last = t;
      if (video.readyState >= 2) {
        const w = video.videoWidth;
        const h = video.videoHeight;
        if (w && h) {
          canvas.width = w;
          canvas.height = h;
          ctx.drawImage(video, 0, 0, w, h);
          const predictions = await model.detect(video);
          predictions.forEach((p) => {
            const [x, y, width, height] = p.bbox;
            ctx.strokeStyle = "#5eead4";
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, width, height);
            ctx.fillStyle = "rgba(7, 10, 18, 0.75)";
            ctx.fillRect(x, y - 18, Math.min(width, 200), 18);
            ctx.fillStyle = "#5eead4";
            ctx.font = "12px JetBrains Mono, monospace";
            ctx.fillText(
              `${p.class} ${(p.score * 100).toFixed(0)}%`,
              x + 4,
              y - 5
            );
          });
        }
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [ready]);

  return (
    <div className="inference-wrap">
      <video ref={videoRef} playsInline muted />
      <canvas ref={canvasRef} />
      <div className="inference-controls">
        <label>
          Resolution load
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={resolution}
            onChange={(e) => setResolution(Number(e.target.value))}
          />
        </label>
        <span className="status-pill ok" style={{ border: "none" }}>
          {ready ? "MODEL READY" : "LOADING…"}
        </span>
        {error && (
          <span className="status-pill warn" style={{ border: "none" }}>
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
