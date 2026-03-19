"use client";

import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

const CANVAS_DURATION = 3000;

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


  // Wormhole canvas animation
  useEffect(() => {
    if (!show || phase !== "wormhole") return;

    const initTimer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      resize();
      window.addEventListener("resize", resize);

      const W0 = canvas.width;
      const H0 = canvas.height;

      // 3D wormhole: particles in a cylindrical tunnel, projected to 2D via Z-depth
      const BASE_FOCAL = Math.min(W0, H0) * 0.78;
      const MAX_Z = BASE_FOCAL * 5.5;
      const MIN_Z = BASE_FOCAL * 0.06;
      const TUBE_R = Math.min(W0, H0) * 0.20;

      type P3 = { a: number; r: number; z: number; spd: number; sz: number; al: number; fast: boolean };
      const pts: P3[] = [];

      // Regular tunnel particles
      for (let i = 0; i < 750; i++) {
        pts.push({
          a: Math.random() * Math.PI * 2,
          r: TUBE_R * (0.25 + Math.random() * 1.1),
          z: MIN_Z + Math.random() * (MAX_Z - MIN_Z),
          spd: 5 + Math.random() * 9,
          sz: 1.0 + Math.random() * 1.8,
          al: 0.45 + Math.random() * 0.55,
          fast: false,
        });
      }
      // Shooting stars — fast, long trail
      for (let i = 0; i < 14; i++) {
        pts.push({
          a: Math.random() * Math.PI * 2,
          r: TUBE_R * (0.1 + Math.random() * 0.85),
          z: MIN_Z + Math.random() * (MAX_Z - MIN_Z),
          spd: 35 + Math.random() * 30,
          sz: 2.5 + Math.random() * 2,
          al: 0.85 + Math.random() * 0.15,
          fast: true,
        });
      }

      // Opaque first frame
      ctx.fillStyle = "#050403";
      ctx.fillRect(0, 0, W0, H0);

      startTimeRef.current = performance.now();

      const draw = (now: number) => {
        const elapsed = now - startTimeRef.current;
        const progress = Math.min(elapsed / CANVAS_DURATION, 1);

        const W = canvas.width;
        const H = canvas.height;
        const cx = W / 2;
        const cy = H / 2;
        const maxR = Math.sqrt(cx * cx + cy * cy) * 1.1;

        // ease-in → fast middle → snap: cubic ease-in
        const eased = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        const circleR = maxR * eased;

        // FOV narrows over time (zoom-forward effect): smaller focal = wider view = things rush out faster
        const focal = BASE_FOCAL * (1.0 - progress * 0.18);

        // Acceleration multiplier: slow start → fast middle → snap
        const accel = 1 + Math.pow(progress, 1.8) * 7;
        const spiralRate = 0.0015 + progress * 0.005;

        // Motion blur: semi-transparent fill instead of clear — trails persist across frames
        ctx.fillStyle = "rgba(5,4,3,0.78)";
        ctx.fillRect(0, 0, W, H);

        // --- Perspective tunnel rings (depth reference lines) ---
        for (let i = 1; i <= 12; i++) {
          const zRing = MAX_Z * (i / 13);
          const ringScale = focal / zRing;
          const ringR = TUBE_R * ringScale;
          if (ringR < 4 || ringR > maxR * 1.4) continue;
          const depthFade = Math.pow(1 - zRing / MAX_Z, 2) * 0.1;
          if (depthFade < 0.003) continue;
          ctx.beginPath();
          ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(240,238,225,${depthFade})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }

        // --- 3D particles ---
        for (const p of pts) {
          p.a += spiralRate;
          p.z -= p.spd * accel;

          if (p.z <= MIN_Z) {
            p.z = MAX_Z * (0.35 + Math.random() * 0.65);
            p.a = Math.random() * Math.PI * 2;
            continue;
          }

          const scale = focal / p.z;
          const wx = Math.cos(p.a) * p.r;
          const wy = Math.sin(p.a) * p.r;
          const sx = cx + wx * scale;
          const sy = cy + wy * scale;

          if (sx < -80 || sx > W + 80 || sy < -80 || sy > H + 80) continue;

          // Skip pixels that will be erased by destination-out (perf optimization)
          if ((sx - cx) * (sx - cx) + (sy - cy) * (sy - cy) < circleR * circleR) continue;

          // Depth-based brightness: dim when far (large z), bright when close (small z)
          const closeness = Math.min(focal * 0.5 / p.z, 1.0);
          const farDim = Math.min(p.z / (MAX_Z * 0.3), 1.0);
          const fa = p.al * (0.08 + 0.92 * closeness) * farDim;
          if (fa < 0.015) continue;

          const dotR = Math.min(scale * p.sz * 0.11, p.fast ? 3.0 : 2.2);

          // Trail: project from slightly further Z (behind direction of travel = toward center)
          const trailMult = p.fast ? 5.5 : 2.2;
          const trailZ = Math.min(p.z + p.spd * accel * trailMult, MAX_Z);
          const trailScale = focal / trailZ;
          const trailSx = cx + wx * trailScale;
          const trailSy = cy + wy * trailScale;

          ctx.beginPath();
          ctx.moveTo(trailSx, trailSy);
          ctx.lineTo(sx, sy);
          ctx.strokeStyle = `rgba(245,243,232,${fa * (p.fast ? 0.8 : 0.38)})`;
          ctx.lineWidth = p.fast ? Math.min(dotR * 0.55, 1.3) : dotR * 0.32;
          ctx.stroke();

          if (dotR > 0.3) {
            ctx.beginPath();
            ctx.arc(sx, sy, dotR, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(245,243,232,${fa})`;
            ctx.fill();
          }
        }

        // --- Vanishing point: dark center (tunnel depth) ---
        const vpR = Math.max(circleR * 1.2, maxR * 0.08);
        const vanish = ctx.createRadialGradient(cx, cy, 0, cx, cy, vpR);
        vanish.addColorStop(0, "rgba(0,0,0,0.72)");
        vanish.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = vanish;
        ctx.fillRect(0, 0, W, H);

        // --- Outer vignette ---
        const vig = ctx.createRadialGradient(cx, cy, maxR * 0.35, cx, cy, maxR);
        vig.addColorStop(0, "rgba(0,0,0,0)");
        vig.addColorStop(0.65, "rgba(0,0,0,0)");
        vig.addColorStop(1, "rgba(0,0,0,0.92)");
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, W, H);

        // --- Destination-out: reveal page through expanding circle ---
        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(cx, cy, circleR, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,1)";
        ctx.fill();
        ctx.restore();

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(draw);
        } else {
          setPhase("done");
        }
      };

      rafRef.current = requestAnimationFrame(draw);
    }, 0);

    return () => {
      clearTimeout(initTimer);
      cancelAnimationFrame(rafRef.current);
    };
  }, [show, phase]);


  return (
    <>
      {children}

      {/* Canvas overlay */}
      {show && (
        <AnimatePresence>
          {phase !== "done" && (
            <motion.div
              className="fixed inset-0 z-[9999] overflow-hidden"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeIn" }}
            >
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Scattered nav — always visible, appears after animation on first load */}
      {(!show || phase === "done") && <ScatteredNav />}

      {/* Temporary replay button */}
      <button
        onClick={() => { sessionStorage.removeItem("intro-played"); window.location.reload(); }}
        className="fixed top-4 right-4 z-[10001] rounded-full border border-white/20 px-4 py-1.5 text-xs text-white/50 hover:text-white hover:border-white/40 transition-colors"
      >
        replay
      </button>
    </>
  );
}
