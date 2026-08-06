"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";

/* -------------------------------------------------------------------------- */
/*  Station art direction — softened TMG Yamal palette (hazy editorial)        */
/* -------------------------------------------------------------------------- */

type Station = {
  src: string;
  /** vertical gradient stops [offset, color] for the fallback texture */
  stops: [number, string][];
  glow: string;
};

const STATIONS: Station[] = [
  {
    src: "/yamal/01-aerial-masterplan.jpg",
    stops: [
      [0, "#12315f"],
      [0.45, "#0f2a52"],
      [1, "#0a1e3f"],
    ],
    glow: "#4e7ba8",
  },
  {
    src: "/yamal/02-marina-crescent.jpg",
    stops: [
      [0, "#123a63"],
      [0.5, "#0e2c54"],
      [1, "#091d3c"],
    ],
    glow: "#89a7c6",
  },
  {
    src: "/yamal/03-crystal-lagoons.jpg",
    stops: [
      [0, "#1c4f74"],
      [0.5, "#123a5f"],
      [1, "#0b2447"],
    ],
    glow: "#89a7c6",
  },
  {
    src: "/yamal/04-apartment-park.jpg",
    stops: [
      [0, "#28345a"],
      [0.5, "#1a2c4d"],
      [1, "#0d2040"],
    ],
    glow: "#cbb6a0",
  },
  {
    src: "/yamal/05-villa-facade.jpg",
    stops: [
      [0, "#3a3355"],
      [0.5, "#242a4a"],
      [1, "#101f3d"],
    ],
    glow: "#c6a45c",
  },
];

const BASE = "#0a1e3f";

/* -------------------------------------------------------------------------- */
/*  Texture helpers — beautiful gradient fallbacks until the JPGs are dropped  */
/* -------------------------------------------------------------------------- */

function gradientTexture(station: Station): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 640;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, c.height);
  station.stops.forEach(([o, col]) => g.addColorStop(o, col));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, c.width, c.height);

  // soft radial glow rim
  const rg = ctx.createRadialGradient(
    c.width * 0.6,
    c.height * 0.28,
    0,
    c.width * 0.6,
    c.height * 0.28,
    c.width * 0.7
  );
  rg.addColorStop(0, `${station.glow}44`);
  rg.addColorStop(1, "#00000000");
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, c.width, c.height);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Radial feather mask so plane edges dissolve into the fog (no hard rectangle). */
function featherTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(256, 256, 40, 256, 256, 300);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(0.62, "#ffffff");
  g.addColorStop(1, "#000000");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  const tex = new THREE.CanvasTexture(c);
  return tex;
}

function backgroundTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 16;
  c.height = 512;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, c.height);
  g.addColorStop(0, "#173a68");
  g.addColorStop(0.55, "#0a1e3f");
  g.addColorStop(1, "#071630");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, c.width, c.height);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* -------------------------------------------------------------------------- */
/*  Scroll → station math                                                     */
/* -------------------------------------------------------------------------- */

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const N = STATIONS.length;

/** Bell-shaped visibility window per station. */
function stationOpacity(i: number, p: number) {
  const c = (i + 0.5) / N;
  return (
    smoothstep(c - 0.16, c - 0.055, p) * (1 - smoothstep(c + 0.055, c + 0.16, p))
  );
}

/** The plane sweeps from deep in the fog, grows to fill the frame, then dissolves. */
function stationZ(i: number, p: number) {
  const c = (i + 0.5) / N;
  const t = clamp((p - (c - 0.3)) / 0.44, 0, 1);
  return lerp(-24, 5, t);
}

/* -------------------------------------------------------------------------- */
/*  Scene                                                                     */
/* -------------------------------------------------------------------------- */

function StationPlanes({ progress }: { progress: MotionValue<number> }) {
  const group = useRef<THREE.Group>(null);
  const meshes = useRef<THREE.Mesh[]>([]);

  const fallbacks = useMemo(() => STATIONS.map(gradientTexture), []);
  const feather = useMemo(() => featherTexture(), []);

  const materials = useMemo(
    () =>
      STATIONS.map(
        (_, i) =>
          new THREE.MeshBasicMaterial({
            map: fallbacks[i],
            alphaMap: feather,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            fog: true,
            toneMapped: false,
          })
      ),
    [fallbacks, feather]
  );

  // Upgrade to the real photograph when present; keep the gradient otherwise.
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    STATIONS.forEach((s, i) => {
      loader.load(
        s.src,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          materials[i].map = tex;
          materials[i].needsUpdate = true;
        },
        undefined,
        () => {
          /* no file yet — gradient fallback stays */
        }
      );
    });
    return () => {
      materials.forEach((m) => {
        m.map?.dispose();
        m.dispose();
      });
    };
  }, [materials]);

  useFrame((state) => {
    const p = progress.get();
    meshes.current.forEach((mesh, i) => {
      if (!mesh) return;
      const op = stationOpacity(i, p);
      mesh.position.z = stationZ(i, p);
      const m = mesh.material as THREE.MeshBasicMaterial;
      m.opacity = op;
      mesh.visible = op > 0.001;
      // gentle pointer parallax tilt for depth
      mesh.rotation.y = state.pointer.x * 0.05;
      mesh.rotation.x = -state.pointer.y * 0.04;
    });
  });

  return (
    <group ref={group}>
      {STATIONS.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) meshes.current[i] = el;
          }}
          material={materials[i]}
          position={[0, 0, -24]}
        >
          <planeGeometry args={[19, 10.7, 1, 1]} />
        </mesh>
      ))}
    </group>
  );
}

function DustField() {
  const points = useRef<THREE.Points>(null);
  const COUNT = 340;

  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 28;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 16;
      arr[i * 3 + 2] = -24 + Math.random() * 30;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    const geo = points.current?.geometry;
    if (!geo) return;
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3 + 2] += delta * (0.6 + (i % 5) * 0.12);
      if (arr[i * 3 + 2] > 7) {
        arr[i * 3 + 2] = -24;
        arr[i * 3] = (Math.random() - 0.5) * 28;
        arr[i * 3 + 1] = (Math.random() - 0.5) * 16;
      }
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={COUNT}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color={"#d9c48a"}
        transparent
        opacity={0.5}
        depthWrite={false}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        fog={false}
      />
    </points>
  );
}

function CameraRig() {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector2());

  useFrame((state) => {
    // eased pointer parallax drift + slow idle sway
    const t = state.clock.elapsedTime;
    target.current.x = state.pointer.x * 0.6 + Math.sin(t * 0.12) * 0.12;
    target.current.y = state.pointer.y * 0.4 + Math.cos(t * 0.1) * 0.08;
    camera.position.x += (target.current.x - camera.position.x) * 0.04;
    camera.position.y += (target.current.y - camera.position.y) * 0.04;
    camera.lookAt(0, 0, -4);
  });
  return null;
}

function SceneSetup() {
  const { scene } = useThree();
  useEffect(() => {
    scene.background = backgroundTexture();
    scene.fog = new THREE.Fog(BASE, 6, 30);
    return () => {
      scene.fog = null;
    };
  }, [scene]);
  return null;
}

/* -------------------------------------------------------------------------- */
/*  Public component                                                          */
/* -------------------------------------------------------------------------- */

export default function FlyThrough({
  progress,
}: {
  progress: MotionValue<number>;
}) {
  return (
    <div className="fixed inset-0 -z-10 h-screen w-full bg-obsidian">
      <Canvas
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: false,
        }}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 6], fov: 52, near: 0.1, far: 100 }}
      >
        <SceneSetup />
        <CameraRig />
        <StationPlanes progress={progress} />
        <DustField />
      </Canvas>

      {/* DOM depth overlays — vignette, horizon rim, ground density */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(125% 85% at 50% 42%, rgba(0,0,0,0) 42%, rgba(4,12,28,0.62) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
        style={{
          background:
            "linear-gradient(0deg, rgba(7,22,48,0.85) 0%, rgba(7,22,48,0) 100%)",
        }}
      />
    </div>
  );
}
