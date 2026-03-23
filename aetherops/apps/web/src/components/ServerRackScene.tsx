import { useMemo } from "react";
import { PodState } from "../lib/api";

type PodSlot = {
  name: string;
  x: number;
  y: number;
  z: number;
};

const SLOTS: PodSlot[] = [
  { name: "aetherops-api", x: -0.35, y: 0.55, z: 0.1 },
  { name: "aetherops-worker", x: 0.35, y: 0.55, z: 0.1 },
  { name: "aetherops-inference", x: -0.35, y: 0.05, z: 0.1 },
  { name: "aetherops-stream", x: 0.35, y: 0.05, z: 0.1 },
];

function PodLight({
  podName,
  pods,
}: {
  podName: string;
  pods: PodState[];
}) {
  const pod = pods.find((p) => p.name === podName);
  const standby = pods.length === 0;
  const ok = standby ? true : pod?.status === "Running";
  const color = standby ? "#64748b" : ok ? "#34d399" : "#f87171";
  const emissive = standby ? "#1e293b" : ok ? "#064e3b" : "#7f1d1d";

  return (
    <mesh position={[0, 0, 0.06]} castShadow>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={standby ? 0.35 : ok ? 0.9 : 2.2}
        metalness={0.2}
        roughness={0.35}
      />
    </mesh>
  );
}

function RackUnit({
  slot,
  pods,
}: {
  slot: PodSlot;
  pods: PodState[];
}) {
  return (
    <group position={[slot.x, slot.y, slot.z]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.95, 0.38, 0.45]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[-0.42, 0, 0.23]}>
        <boxGeometry args={[0.06, 0.22, 0.02]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <group position={[-0.25, 0, 0.24]}>
        <PodLight podName={slot.name} pods={pods} />
      </group>
    </group>
  );
}

export function ServerRackScene({ pods }: { pods: PodState[] }) {
  const floor = useMemo(
    () => (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.85, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#020617" metalness={0.1} roughness={0.85} />
      </mesh>
    ),
    []
  );

  return (
    <group>
      {floor}
      <mesh castShadow position={[0, 0.15, 0]}>
        <boxGeometry args={[1.2, 1.6, 0.6]} />
        <meshStandardMaterial color="#0f172a" metalness={0.55} roughness={0.35} />
      </mesh>
      {SLOTS.map((slot) => (
        <RackUnit key={slot.name} slot={slot} pods={pods} />
      ))}
    </group>
  );
}
