"use client";

import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import * as THREE from "three";

const CANVAS_DURATION = 4500;
const PAUSE_START = 2000 / CANVAS_DURATION;
const PAUSE_END   = 2500 / CANVAS_DURATION;

const NAV_TAGS = [
  { id: "home",     label: "Home"     },
  { id: "about",    label: "About"    },
  { id: "skills",   label: "Skills"   },
  { id: "projects", label: "Projects" },
  { id: "contact",  label: "Contact"  },
];

function ScatteredNav() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const { scrollYProgress } = useScroll();

  useEffect(() => setMounted(true), []);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    const prev = scrollYProgress.getPrevious() ?? 0;
    if (current < 0.05) setVisible(true);
    else if (current - prev > 0) setVisible(false);
    else setVisible(true);
  });

  if (!mounted) return null;

  return (
    <motion.div
      animate={{ y: visible ? 0 : -80, opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed top-4 right-4 md:top-12 md:right-0 md:left-0 md:justify-center z-[5000] flex items-center gap-1 sm:gap-2 pointer-events-auto"
    >
      {NAV_TAGS.map((tag, i) => (
        <motion.a
          key={tag.id}
          href={`#${tag.id}`}
          className="rounded-full border px-3 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-medium whitespace-nowrap"
          style={{
            fontFamily: "var(--font-sub)",
            borderColor: "var(--navy-border)",
            backgroundColor: "var(--navy-fill-sm)",
            color: "var(--navy)",
          }}
          initial={{ x: 30, opacity: 0, scale: 0.85 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          transition={{ type: "tween", ease: [0.22, 1, 0.36, 1], duration: 0.6, delay: i * 0.08 }}
          whileHover={{ y: -3, scale: 1.07, transition: { type: "spring", stiffness: 200, damping: 18 } }}
        >
          {tag.label}
        </motion.a>
      ))}
    </motion.div>
  );
}

export function PageLoader({ children }: { children?: ReactNode }) {
  const [show,  setShow]  = useState(false);
  const [phase, setPhase] = useState<"wormhole" | "done">("wormhole");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const darkBgRef = useRef<HTMLDivElement>(null);
  const rafRef    = useRef<number>(0);
  const startRef  = useRef<number>(0);

  useEffect(() => {
    if (!sessionStorage.getItem("intro-played")) {
      setShow(true);
      sessionStorage.setItem("intro-played", "1");
    }
  }, []);

  useEffect(() => {
    if (!show || phase !== "wormhole") return;

    const canvas = canvasRef.current;
    const darkBg = darkBgRef.current;
    if (!canvas || !darkBg) return;

    let alive = true;
    let cleanup = () => {};

    (async () => {
    const W = window.innerWidth;
    const H = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 300);
    camera.position.z = 0;

    // ── G sprite texture ──────────────────────────────────────────────
    const gTex = await new Promise<THREE.Texture>((resolve) => {
      new THREE.TextureLoader().load("/G-sprite.png", resolve);
    });
    if (!alive) { gTex.dispose(); renderer.dispose(); return; }

    // ── Stars as spinning G's (InstancedMesh) ─────────────────────────
    const N       = 1800;
    const positions = new Float32Array(N * 3);
    const speeds    = new Float32Array(N);
    const rotAngles = new Float32Array(N);
    const rotSpeeds = new Float32Array(N);
    let curProg = 0;

    const tanHFov = Math.tan((75 / 2) * Math.PI / 180);
    const aspect  = W / H;

    const initStar = (i: number, randomZ = true) => {
      if (curProg >= PAUSE_START) {
        const z  = -(1 + Math.random() * 10);
        const hw = Math.abs(z) * tanHFov;
        const hh = hw / aspect;
        positions[i*3]     = (Math.random()*2-1) * hw;
        positions[i*3 + 1] = (Math.random()*2-1) * hh;
        positions[i*3 + 2] = z;
      } else {
        const angle = Math.random() * Math.PI * 2;
        const r     = Math.sqrt(Math.random()) * 110;
        positions[i*3]     = Math.cos(angle) * r;
        positions[i*3 + 1] = Math.sin(angle) * r;
        positions[i*3 + 2] = randomZ ? -Math.random() * 180 : -180;
      }
      speeds[i]    = 0.25 + Math.random() * 0.75;
      rotAngles[i] = Math.random() * Math.PI * 2;
      // Each G spins at a random rate; direction varies
      rotSpeeds[i] = (Math.random() < 0.5 ? 1 : -1) * (0.02 + Math.random() * 0.06);
    };

    for (let i = 0; i < N; i++) initStar(i, true);

    const gGeo = new THREE.PlaneGeometry(1, 1);
    const gMat = new THREE.MeshBasicMaterial({
      map: gTex,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending,
    });
    const gMesh = new THREE.InstancedMesh(gGeo, gMat, N);
    gMesh.frustumCulled = false;
    scene.add(gMesh);

    // Reusable objects for matrix composition
    const _pos   = new THREE.Vector3();
    const _quat  = new THREE.Quaternion();
    const _scale = new THREE.Vector3();
    const _mat   = new THREE.Matrix4();
    const _axis  = new THREE.Vector3(0, 0, 1);

    // ── Fog G's (InstancedMesh, size varies: big at center, small at edges) ──
    const N_FOG     = 20;
    const fogPos    = new Float32Array(N_FOG * 3);
    const fogSpeeds = new Float32Array(N_FOG);
    const fogScales = new Float32Array(N_FOG); // per-particle world-unit scale

    const initFog = (i: number) => {
      const z  = -(4 + Math.random() * 12);
      const hw = Math.abs(z) * tanHFov;
      const hh = hw / aspect;
      const x  = (Math.random()*2-1) * hw;
      const y  = (Math.random()*2-1) * hh;
      fogPos[i*3]     = x;
      fogPos[i*3 + 1] = y;
      fogPos[i*3 + 2] = z;
      fogSpeeds[i] = 0.003 + Math.random() * 0.006;
      // Normalised distance from screen centre (0=centre, 1=edge)
      const dist = Math.sqrt((x/hw)**2 + (y/hh)**2);
      // Centre: 0.06–0.10  |  Edge: 0.02–0.04
      fogScales[i] = 0.02 + (1 - dist) * 0.07 + Math.random() * 0.02;
    };
    for (let i = 0; i < N_FOG; i++) initFog(i);

    const fogMeshMat = new THREE.MeshBasicMaterial({
      map: gTex, transparent: true, depthWrite: false,
      side: THREE.DoubleSide, blending: THREE.NormalBlending, opacity: 0,
    });
    const fogMesh = new THREE.InstancedMesh(gGeo, fogMeshMat, N_FOG);
    fogMesh.frustumCulled = false;
    scene.add(fogMesh);

    // ── Resize ────────────────────────────────────────────────────────
    const onResize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    // ── Draw loop ─────────────────────────────────────────────────────
    startRef.current = performance.now();

    const draw = (now: number) => {
      if (!alive) return;

      const elapsed  = now - startRef.current;
      const progress = Math.min(elapsed / CANVAS_DURATION, 1);
      curProg = progress;

      // Speed curve
      let speedMult: number;
      if (progress < PAUSE_START) {
        speedMult = Math.pow(18, progress / PAUSE_START);
      } else if (progress < PAUSE_END) {
        const t = (progress - PAUSE_START) / (PAUSE_END - PAUSE_START);
        speedMult = Math.pow(13.5, 1 - t) * Math.pow(0.025, t);
      } else {
        speedMult = 0.025;
      }

      // Dark background fades with slowdown
      if (progress < PAUSE_START) {
        darkBg.style.opacity = "1";
      } else if (progress < PAUSE_END) {
        const t = (progress - PAUSE_START) / (PAUSE_END - PAUSE_START);
        darkBg.style.opacity = String(Math.pow(13.5, 1-t) * Math.pow(0.025, t) / 13.5);
      } else {
        darkBg.style.opacity = "0";
      }

      // Particle opacity
      const starAlpha =
        progress < PAUSE_END
          ? 1
          : Math.pow(1 - (progress - PAUSE_END) / (1 - PAUSE_END), 0.55);
      gMat.opacity = starAlpha;

      let fogAlpha: number;
      if (progress < PAUSE_START) {
        fogAlpha = 0;
      } else if (progress < PAUSE_END) {
        fogAlpha = ((progress - PAUSE_START) / (PAUSE_END - PAUSE_START)) * 0.38;
      } else {
        fogAlpha = 0.38 * Math.pow(1 - (progress - PAUSE_END) / (1 - PAUSE_END), 0.55);
      }
      fogMeshMat.opacity = fogAlpha;

      // Update G instances
      for (let i = 0; i < N; i++) {
        const dx = speeds[i] * speedMult;

        // Spin speed proportional to movement speed
        rotAngles[i] += rotSpeeds[i] * (speedMult / 4 + 0.3);

        positions[i*3 + 2] += dx;

        if (positions[i*3 + 2] > 2) {
          initStar(i, false);
        }

        _pos.set(positions[i*3], positions[i*3 + 1], positions[i*3 + 2]);
        _quat.setFromAxisAngle(_axis, rotAngles[i]);
        // Size in world units — stays constant, camera perspective handles depth scaling
        _scale.setScalar(0.08 + (Math.min(speedMult, 18) / 18) * 1.2);
        _mat.compose(_pos, _quat, _scale);
        gMesh.setMatrixAt(i, _mat);
      }
      gMesh.instanceMatrix.needsUpdate = true;

      _quat.identity();
      // Update fog G's
      for (let i = 0; i < N_FOG; i++) {
        fogPos[i*3 + 2] += fogSpeeds[i];
        if (fogPos[i*3 + 2] > 2) initFog(i);
        _pos.set(fogPos[i*3], fogPos[i*3+1], fogPos[i*3+2]);
        _scale.setScalar(fogScales[i]);
        _mat.compose(_pos, _quat, _scale); // reuse identity quat (no spin on fog)
        fogMesh.setMatrixAt(i, _mat);
      }
      fogMesh.instanceMatrix.needsUpdate = true;

      renderer.render(scene, camera);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(draw);
      } else {
        if (alive) setPhase("done");
        renderer.dispose();
      }
    };

    rafRef.current = requestAnimationFrame(draw);

    cleanup = () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    };
    })();

    return () => {
      alive = false;
      cleanup();
    };
  }, [show, phase]);

  return (
    <>
      {children}

      {show && (
        <AnimatePresence>
          {phase !== "done" && (
            <motion.div
              className="fixed inset-0 z-[9999] overflow-hidden pointer-events-none"
              exit={{ opacity: 0 }}
              transition={{ duration: 0 }}
            >
              <div ref={darkBgRef} className="absolute inset-0" style={{ backgroundColor: "#000005" }} />
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {(!show || phase === "done") && <ScatteredNav />}

      <button
        onClick={() => { sessionStorage.removeItem("intro-played"); window.location.reload(); }}
        className="fixed top-4 right-4 z-[10001] rounded-full border border-white/20 px-4 py-1.5 text-xs text-white/50 hover:text-white hover:border-white/40 transition-colors"
      >
        replay
      </button>
    </>
  );
}
