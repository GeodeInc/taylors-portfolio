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
      type Particle = { angle: number; dist: number; baseSpeed: number; size: number; alpha: number; gx: number; gy: number };
      type Edge = [Particle, Particle];

      // Triangular (geodesic) grid — offset every other row by SPACING/2
      const SPACING = 22;
      const ROW_H = SPACING * Math.sqrt(3) / 2;
      const particles: Particle[] = [];
      const particleMap = new Map<string, Particle>();
      const halfW = Math.ceil(W0 / 2 / SPACING) + 2;
      const halfH = Math.ceil(H0 / 2 / ROW_H) + 2;

      for (let gy = -halfH; gy <= halfH; gy++) {
        for (let gx = -halfW; gx <= halfW; gx++) {
          const rowOffset = ((gy % 2) + 2) % 2 === 1 ? SPACING / 2 : 0;
          const dx = gx * SPACING + rowOffset;
          const dy = gy * ROW_H;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 2) continue;
          const p: Particle = {
            angle: Math.atan2(dy, dx),
            dist,
            baseSpeed: 0.25 + Math.random() * 0.45,
            size: 0.4 + Math.random() * 1.0,
            alpha: 0.5 + Math.random() * 0.5,
            gx,
            gy,
          };
          particles.push(p);
          particleMap.set(`${gx},${gy}`, p);
        }
      }

      // Precompute mesh edges (3 directed per node covers all triangles without duplicates)
      const edges: Edge[] = [];
      for (const p of particles) {
        const { gx, gy } = p;
        const isOdd = ((gy % 2) + 2) % 2 === 1;
        const neighborKeys = [
          `${gx + 1},${gy}`,
          isOdd ? `${gx + 1},${gy + 1}` : `${gx},${gy + 1}`,
          isOdd ? `${gx},${gy + 1}` : `${gx - 1},${gy + 1}`,
        ];
        for (const key of neighborKeys) {
          const neighbor = particleMap.get(key);
          if (neighbor) edges.push([p, neighbor]);
        }
      }

      // Drift stars — slow, fade before circle
      const maxR0 = Math.sqrt((W0 / 2) ** 2 + (H0 / 2) ** 2) * 1.1;
      type DriftStar = { angle: number; dist: number; speed: number; size: number; alpha: number; trail: { x: number; y: number }[] };
      const driftStars: DriftStar[] = Array.from({ length: 45 }, () => ({
        angle: Math.random() * Math.PI * 2,
        dist: 20 + Math.random() * maxR0 * 0.9,
        speed: 0.3 + Math.random() * 0.35,
        size: 1.2 + Math.random() * 1.8,
        alpha: 0.5 + Math.random() * 0.45,
        trail: [],
      }));

      // Shooting stars — fast inward with trail
      type ShootingStar = { angle: number; dist: number; speed: number; trail: { x: number; y: number }[] };
      const shootingStars: ShootingStar[] = Array.from({ length: 8 }, () => ({
        angle: Math.random() * Math.PI * 2,
        dist: maxR0 * (0.4 + Math.random() * 0.6),
        speed: 2.5 + Math.random() * 2.5,
        trail: [],
      }));

      // Warm dark background fill before first frame
      ctx.fillStyle = "#090704";
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
        const circleR = maxR * progress * progress;

        // Warm dark background
        ctx.fillStyle = "#090704";
        ctx.fillRect(0, 0, W, H);

        // Draw particles — all moving inward with radial streak tails
        for (const p of particles) {
          const normalizedDist = p.dist / maxR;
          // Gravitational pull: increases with progress and proximity to center
          const grav = 1 + (1 - normalizedDist) * 18 * progress * progress;
          p.dist -= p.baseSpeed * grav;
          // Spiral: faster near center
          p.angle += 0.003 + (1 - normalizedDist) * 0.012;

          // Absorb into circle or spiraled to center → respawn at outer edge
          if (p.dist <= circleR + 6 || p.dist <= 1) {
            p.dist = maxR * (0.55 + Math.random() * 0.45);
            p.angle = Math.random() * Math.PI * 2;
            continue;
          }

          const x = cx + Math.cos(p.angle) * p.dist;
          const y = cy + Math.sin(p.angle) * p.dist;

          // Fade as particle approaches circle edge
          const proximity = p.dist - circleR;
          const fadeA = p.alpha * Math.min(proximity / 55, 1) * Math.min(p.dist / 20, 1);
          if (fadeA <= 0) continue;

          // Bright head
          ctx.beginPath();
          ctx.arc(x, y, p.size * 0.65, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(245,243,232,${fadeA})`;
          ctx.fill();
        }

        // Drift stars — slow inward, trail, fade before circle
        const FADE_MARGIN = 70;
        const DRIFT_TRAIL = 12;
        for (const ds of driftStars) {
          ds.dist -= ds.speed;
          ds.angle += 0.003 + progress * progress * 0.04;
          if (ds.dist <= circleR + 8 || ds.dist <= 1) {
            ds.dist = maxR * (0.5 + Math.random() * 0.5);
            ds.angle = Math.random() * Math.PI * 2;
            ds.trail = [];
            continue;
          }
          const proximity = ds.dist - circleR;
          const fadeA = ds.alpha * Math.min(proximity / FADE_MARGIN, 1);
          if (fadeA <= 0) { ds.trail = []; continue; }
          const dx = cx + Math.cos(ds.angle) * ds.dist;
          const dy = cy + Math.sin(ds.angle) * ds.dist;
          ds.trail.push({ x: dx, y: dy });
          if (ds.trail.length > DRIFT_TRAIL) ds.trail.shift();
          for (let t = 1; t < ds.trail.length; t++) {
            const ta = fadeA * (t / ds.trail.length) * 0.6;
            ctx.beginPath();
            ctx.moveTo(ds.trail[t - 1].x, ds.trail[t - 1].y);
            ctx.lineTo(ds.trail[t].x, ds.trail[t].y);
            ctx.strokeStyle = `rgba(245,243,232,${ta})`;
            ctx.lineWidth = ds.size * 0.7;
            ctx.stroke();
          }
          ctx.beginPath();
          ctx.arc(dx, dy, ds.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(245,243,232,${fadeA})`;
          ctx.fill();
        }

        // Shooting stars — fast inward, trail, fade before circle
        const SHOOT_FADE = 80;
        const TRAIL_LEN = 22;
        for (const star of shootingStars) {
          star.dist -= star.speed * (1 + progress * 0.5);
          star.angle += 0.003 + progress * progress * 0.04;
          if (star.dist <= circleR + 8 || star.dist <= 1) {
            star.dist = maxR * (0.4 + Math.random() * 0.6);
            star.angle = Math.random() * Math.PI * 2;
            star.trail = [];
            continue;
          }
          const proximity = star.dist - circleR;
          const fadeA = Math.min(proximity / SHOOT_FADE, 1);
          const sx = cx + Math.cos(star.angle) * star.dist;
          const sy = cy + Math.sin(star.angle) * star.dist;
          star.trail.push({ x: sx, y: sy });
          if (star.trail.length > TRAIL_LEN) star.trail.shift();
          for (let t = 1; t < star.trail.length; t++) {
            const a = fadeA * (t / star.trail.length) * 0.85;
            ctx.beginPath();
            ctx.moveTo(star.trail[t - 1].x, star.trail[t - 1].y);
            ctx.lineTo(star.trail[t].x, star.trail[t].y);
            ctx.strokeStyle = `rgba(245,243,232,${a})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
          ctx.beginPath();
          ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(245,243,232,${fadeA * 0.95})`;
          ctx.fill();
        }

        // Vignette: darken outer edges to create tunnel depth
        const vignette = ctx.createRadialGradient(cx, cy, maxR * 0.12, cx, cy, maxR * 0.92);
        vignette.addColorStop(0, "rgba(0,0,0,0)");
        vignette.addColorStop(0.5, "rgba(0,0,0,0)");
        vignette.addColorStop(1, "rgba(0,0,0,0.88)");
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, W, H);

        // Destination-out: punch hole to reveal page content
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
              transition={{ duration: 0.2, ease: "easeInOut" }}
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
