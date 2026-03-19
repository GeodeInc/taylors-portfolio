"use client";

import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import * as THREE from "three";

const CANVAS_DURATION = 4000;
const PAUSE_START = 0.50;  // 2s — stars abruptly decelerate to near-stop
const PAUSE_END   = 0.75;  // 3s — drift window ends, stars + page fade together
// page canvas opacity fades throughout (power 4 curve)

const NAV_TAGS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
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
  const [show, setShow] = useState(false);
  const [phase, setPhase] = useState<"wormhole" | "done">("wormhole");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!sessionStorage.getItem("intro-played")) {
      setShow(true);
      sessionStorage.setItem("intro-played", "1");
    }
  }, []);

  useEffect(() => {
    if (!show || phase !== "wormhole") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    let alive = true;

    const W = window.innerWidth;
    const H = window.innerHeight;

    // ── Renderer ──────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: false });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000005, 1);

    const scene = new THREE.Scene();

    // Camera at origin looking down -Z; stars fly toward camera (+Z)
    const camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 300);
    camera.position.z = 0;

    // ── Stars ─────────────────────────────────────────────────────────
    const N = 3000;
    const positions = new Float32Array(N * 3);
    const speeds    = new Float32Array(N);

    let currentProgress = 0; // updated each frame so initStar can read it
    const starTanHalfFov = Math.tan((75 / 2) * Math.PI / 180);
    const starAspect = W / H;

    const initStar = (i: number, randomZ = true) => {
      const paused = currentProgress >= PAUSE_START;
      if (paused) {
        // Respawn within frustum at near depth — stays visible and drifts slowly
        const z = -(1 + Math.random() * 10);
        const hw = Math.abs(z) * starTanHalfFov;
        const hh = hw / starAspect;
        positions[i * 3]     = (Math.random() * 2 - 1) * hw;
        positions[i * 3 + 1] = (Math.random() * 2 - 1) * hh;
        positions[i * 3 + 2] = z;
      } else {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * 110;
        positions[i * 3]     = Math.cos(angle) * r;
        positions[i * 3 + 1] = Math.sin(angle) * r;
        positions[i * 3 + 2] = randomZ ? -Math.random() * 180 : -180;
      }
      speeds[i] = 0.25 + Math.random() * 0.75;
    };

    for (let i = 0; i < N; i++) initStar(i, true);

    // ── Fog particles — uniform screen-space scatter ──────────────────
    const N_FOG = 500;
    const fogPos    = new Float32Array(N_FOG * 3);
    const fogSpeeds = new Float32Array(N_FOG);

    const fogTan = Math.tan((75 / 2) * Math.PI / 180);
    const fogAspect = W / H;

    const initFog = (i: number) => {
      const z = -(3 + Math.random() * 5);
      const halfW = Math.abs(z) * fogTan;
      const halfH = halfW / fogAspect;
      fogPos[i * 3]     = (Math.random() * 2 - 1) * halfW;
      fogPos[i * 3 + 1] = (Math.random() * 2 - 1) * halfH;
      fogPos[i * 3 + 2] = z;
      fogSpeeds[i] = 0.003 + Math.random() * 0.006;
    };

    for (let i = 0; i < N_FOG; i++) initFog(i);

    // Store previous positions for trail lines
    const prevPos = new Float32Array(positions);

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    // Read global CSS sage variable
    const sageHex = getComputedStyle(document.documentElement)
      .getPropertyValue("--navy").trim();
    const sageColor  = new THREE.Color(sageHex);
    const sageDeepHex = getComputedStyle(document.documentElement)
      .getPropertyValue("--navy-dark").trim();
    const sageDeepColor = new THREE.Color(sageDeepHex);

    // Circular sprite texture
    const spriteCanvas = document.createElement("canvas");
    spriteCanvas.width = 64;
    spriteCanvas.height = 64;
    const sc = spriteCanvas.getContext("2d")!;
    const grad = sc.createRadialGradient(32, 32, 0, 32, 32, 32);
    const r = Math.round(sageColor.r * 255);
    const g = Math.round(sageColor.g * 255);
    const b = Math.round(sageColor.b * 255);
    grad.addColorStop(0,   `rgba(${r},${g},${b},1)`);
    grad.addColorStop(0.4, `rgba(${r},${g},${b},0.9)`);
    grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);
    sc.fillStyle = grad;
    sc.fillRect(0, 0, 64, 64);
    const spriteTex = new THREE.CanvasTexture(spriteCanvas);

    const starMat = new THREE.PointsMaterial({
      color: sageColor,
      map: spriteTex,
      size: 0.22,
      sizeAttenuation: true,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      alphaTest: 0.01,
      blending: THREE.AdditiveBlending,
    });
    scene.add(new THREE.Points(starGeo, starMat));

    // ── Trail lines (LineSegments: pairs of [tail, head] per star) ────
    // Each trail extends backward along Z by a velocity-scaled amount
    const trailPos = new Float32Array(N * 6);
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute("position", new THREE.BufferAttribute(trailPos, 3));

    const trailMat = new THREE.LineBasicMaterial({
      color: sageDeepColor,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    scene.add(new THREE.LineSegments(trailGeo, trailMat));

    // ── Fog geometry ──────────────────────────────────────────────────
    const fogGeo = new THREE.BufferGeometry();
    fogGeo.setAttribute("position", new THREE.BufferAttribute(fogPos, 3));
    const fogMat = new THREE.PointsMaterial({
      color: sageColor,
      map: spriteTex,
      size: 0.22,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      alphaTest: 0.01,
      blending: THREE.NormalBlending,
    });
    const fogPoints = new THREE.Points(fogGeo, fogMat);
    scene.add(fogPoints);

    // ── Resize ────────────────────────────────────────────────────────
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    // ── Animation loop ────────────────────────────────────────────────
    startTimeRef.current = performance.now();

    const draw = (now: number) => {
      if (!alive) return;

      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / CANVAS_DURATION, 1);
      currentProgress = progress;

      // Phase 1: exponential acceleration 1× → 18×
      // Phase 2: abrupt snap to 50% (9×), then exponential decay → 0.025×
      // Phase 3: gentle drift at 0.025×
      let speedMult: number;
      if (progress < PAUSE_START) {
        speedMult = Math.pow(18, progress / PAUSE_START);           // 1× → 18×
      } else if (progress < PAUSE_END) {
        const t = (progress - PAUSE_START) / (PAUSE_END - PAUSE_START);
        // Snap to 50% then exponential decay into pause
        speedMult = Math.pow(9, 1 - t) * Math.pow(0.025, t);       // 9× → 0.025× exponentially
      } else {
        speedMult = 0.025;                                          // gentle drift
      }

      // Star + fog opacity: full until PAUSE_END, then fade out
      const starAlpha =
        progress < PAUSE_END
          ? 1
          : Math.pow(1 - (progress - PAUSE_END) / (1 - PAUSE_END), 0.4);
      starMat.opacity  = starAlpha;
      trailMat.opacity = starAlpha * 0.5;
      // Fog appears when stars pause, lingers longer than stars
      let fogAlpha: number;
      if (progress < PAUSE_START) {
        fogAlpha = 0;                                                         // hidden during burst
      } else if (progress < PAUSE_END) {
        fogAlpha = ((progress - PAUSE_START) / (PAUSE_END - PAUSE_START)) * 0.38; // fade in
      } else {
        const t = (progress - PAUSE_END) / (1 - PAUSE_END);
        fogAlpha = 0.38 * Math.pow(1 - t, 0.6);                              // slow fade out
      }
      fogMat.opacity = fogAlpha;

      // Canvas opacity: opaque during burst+deceleration, fades with particles in phase 3
      if (progress < PAUSE_END) {
        canvas.style.opacity = "1";
      } else {
        const t = (progress - PAUSE_END) / (1 - PAUSE_END);
        canvas.style.opacity = String(Math.max(1 - Math.pow(t, 0.4), 0));
      }

      // Update star positions + build trail geometry
      for (let i = 0; i < N; i++) {
        const idx  = i * 3;
        const tidx = i * 6;

        const dx = speeds[i] * speedMult;

        // Tail of trail sits behind current pos (further in -Z)
        const tailZ = positions[idx + 2] - dx * 12;  // extend trail 12× the step

        // Trail: tail → head
        trailPos[tidx]     = positions[idx];
        trailPos[tidx + 1] = positions[idx + 1];
        trailPos[tidx + 2] = tailZ;
        trailPos[tidx + 3] = positions[idx];
        trailPos[tidx + 4] = positions[idx + 1];
        trailPos[tidx + 5] = positions[idx + 2];

        // Move star toward camera
        positions[idx + 2] += dx;

        // Respawn beyond camera
        if (positions[idx + 2] > 2) {
          initStar(i, false);
          // Reset trail to prevent frame-spanning artifact
          trailPos[tidx + 2] = positions[idx + 2];
          trailPos[tidx + 5] = positions[idx + 2];
        }
      }

      // Update fog particles — always slow drift, wrap at camera
      for (let i = 0; i < N_FOG; i++) {
        fogPos[i * 3 + 2] += fogSpeeds[i];
        if (fogPos[i * 3 + 2] > 2) initFog(i);
      }

      starGeo.attributes.position.needsUpdate  = true;
      trailGeo.attributes.position.needsUpdate = true;
      fogGeo.attributes.position.needsUpdate   = true;

      renderer.render(scene, camera);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(draw);
      } else {
        if (alive) setPhase("done");
        renderer.dispose();
      }
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      alive = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
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
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
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
