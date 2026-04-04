/**
 * Represents the simulated state of a Kubernetes pod within the application.
 */
export type PodState = {
  name: string;
  namespace: string;
  status: "Running" | "Pending" | "Failed" | "Unknown";
  role: string;
};

const base = "";

/**
 * Fetches the current list of pods and their health statuses from the backend.
 * @returns {Promise<PodState[]>} An array of active or failed pod objects.
 * @throws {Error} Throws an error if the network request fails or API is unreachable.
 */
export async function fetchPods(): Promise<PodState[]> {
  try {
    const res = await fetch(`${base}/api/v1/pods`);
    if (!res.ok) throw new Error("pods");
    const data = (await res.json()) as { pods: PodState[] };
    return data.pods;
  } catch (err) {
    console.warn("Edge API offline, falling back to mock data");
    return [
      { name: "aetherops-api", namespace: "mock", status: "Running", role: "api" },
      { name: "aetherops-worker", namespace: "mock", status: "Running", role: "worker" }
    ];
  }
}

/**
 * Sends a simulated CPU load value to the orchestrator to trigger autoscaling scaling policies.
 * @param {number} load - A decimal value ranging from 0.0 to 1.0 representing CPU stress.
 * @returns {Promise<void>} Resolves when the value is successfully posted.
 */
export async function simulateCpuLoad(load: number): Promise<void> {
  await fetch(`${base}/api/v1/simulate/cpu`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ load: Math.min(1, Math.max(0, load)) }),
  });
}

/**
 * Forces a specific pod state to transition to "Failed", demonstrating self-healing behaviors.
 * @param {string} name - The string identifier of the pod (e.g. 'aetherops-worker').
 * @returns {Promise<void>} Resolves when the failure state is successfully toggled.
 */
export async function failPod(name: string): Promise<void> {
  await fetch(`${base}/api/v1/pods/${encodeURIComponent(name)}/fail`, {
    method: "POST",
  });
}

