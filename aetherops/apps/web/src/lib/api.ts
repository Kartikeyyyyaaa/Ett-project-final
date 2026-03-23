export type PodState = {
  name: string;
  namespace: string;
  status: "Running" | "Pending" | "Failed" | "Unknown";
  role: string;
};

const base = "";

export async function fetchPods(): Promise<PodState[]> {
  const res = await fetch(`${base}/api/v1/pods`);
  if (!res.ok) throw new Error("pods");
  const data = (await res.json()) as { pods: PodState[] };
  return data.pods;
}

export async function simulateCpuLoad(load: number): Promise<void> {
  await fetch(`${base}/api/v1/simulate/cpu`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ load: Math.min(1, Math.max(0, load)) }),
  });
}

export async function failPod(name: string): Promise<void> {
  await fetch(`${base}/api/v1/pods/${encodeURIComponent(name)}/fail`, {
    method: "POST",
  });
}
