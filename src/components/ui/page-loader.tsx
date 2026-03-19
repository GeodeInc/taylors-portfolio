"use client";

import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import * as THREE from "three";

const CANVAS_DURATION = 3400;
const FADE_START = 0.0;    // canvas overlay begins revealing page immediately
const SLOW_START = 0.70;   // stars abruptly decelerate + fade

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
    // Stars: random angle + radius for XY, random Z spread for depth
    const positions = new Float32Array(N * 3);
    const speeds    = new Float32Array(N);

    const initStar = (i: number, randomZ = true) => {
      const angle = Math.random() * Math.PI * 2;
      // Radial distance: use sqrt for uniform area distribution
      const r = Math.sqrt(Math.random()) * 18;
      positions[i * 3]     = Math.cos(angle) * r;
      positions[i * 3 + 1] = Math.sin(angle) * r;
      positions[i * 3 + 2] = randomZ ? -Math.random() * 180 : -180;
      speeds[i] = 0.25 + Math.random() * 0.75;
    };

    for (let i = 0; i < N; i++) initStar(i, true);

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

      // Speed curve: ramp up → abrupt snap to slow
      let speedMult: number;
      if (progress < SLOW_START) {
        speedMult = 1 + Math.pow(progress / SLOW_START, 2) * 5;   // 1× → 6×
      } else {
        const t = (progress - SLOW_START) / (1 - SLOW_START);
        speedMult = 6 * Math.pow(1 - t, 3);                        // sharp drop to 0
      }

      // Star + trail opacity: fade in final stretch
      const starAlpha =
        progress < SLOW_START ? 1 : Math.pow(1 - (progress - SLOW_START) / (1 - SLOW_START), 1.5);
      starMat.opacity  = starAlpha;
      trailMat.opacity = starAlpha * 0.5;

      // Canvas element opacity: reveals page underneath
      if (progress >= FADE_START) {
        const t = (progress - FADE_START) / (1 - FADE_START);
        canvas.style.opacity = String(Math.max(1 - Math.pow(t, 2), 0));
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

      starGeo.attributes.position.needsUpdate  = true;
      trailGeo.attributes.position.needsUpdate = true;

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
