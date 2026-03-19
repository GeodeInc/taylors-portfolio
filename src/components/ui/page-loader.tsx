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
      const maxR0 = Math.sqrt((W0 / 2) ** 2 + (H0 / 2) ** 2) * 1.1;

      // Dense background stars — tiny, fast dots, no trail
      type BGStar = { a: number; dist: number; spd: number; sz: number; al: number };
      const bgStars: BGStar[] = Array.from({ length: 2200 }, () => ({
        a: Math.random() * Math.PI * 2,
        dist: 8 + Math.random() * maxR0,
        spd: 0.5 + Math.random() * 1.0,
        sz: 0.35 + Math.random() * 0.65,
        al: 0.4 + Math.random() * 0.6,
      }));

      // Streak stars — fewer but larger, with long radial trails
      type StreakStar = { a: number; dist: number; spd: number; sz: number; al: number };
      const streakStars: StreakStar[] = Array.from({ length: 180 }, () => ({
        a: Math.random() * Math.PI * 2,
        dist: 10 + Math.random() * maxR0,
        spd: 1.2 + Math.random() * 2.2,
        sz: 0.8 + Math.random() * 2.0,
        al: 0.55 + Math.random() * 0.45,
      }));

      // Opaque first frame
      ctx.fillStyle = "#020204";
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

        // Ease: slow start → violent middle → snap end
        const eased = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        const circleR = maxR * eased;

        // Acceleration multiplier
        const accel = 1 + Math.pow(progress, 2) * 9;
        const spiral = 0.0012 + progress * 0.004;

        // Motion blur persistence — semi-transparent fill leaves ghost trails
        ctx.fillStyle = "rgba(2,2,4,0.75)";
        ctx.fillRect(0, 0, W, H);

        // --- Dense background stars (dots only, no trail) ---
        for (const s of bgStars) {
          s.a += spiral * 0.6;
          s.dist -= s.spd * accel;
          if (s.dist <= circleR + 2 || s.dist <= 1) {
            s.dist = maxR * (0.5 + Math.random() * 0.5);
            s.a = Math.random() * Math.PI * 2;
            continue;
          }
          const depth = s.dist / maxR; // 0=center(far), 1=edge(close)
          const proximity = s.dist - circleR;
          const fa = s.al * Math.min(proximity / 35, 1) * (0.15 + 0.85 * depth);
          if (fa < 0.03) continue;
          const x = cx + Math.cos(s.a) * s.dist;
          const y = cy + Math.sin(s.a) * s.dist;
          ctx.beginPath();
          ctx.arc(x, y, s.sz * (0.08 + 0.92 * depth * depth), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(235,238,255,${fa})`;
          ctx.fill();
        }

        // --- Streak stars (radial trails toward center = behind direction of travel) ---
        for (const s of streakStars) {
          s.a += spiral;
          s.dist -= s.spd * accel;
          if (s.dist <= circleR + 4 || s.dist <= 1) {
            s.dist = maxR * (0.3 + Math.random() * 0.7);
            s.a = Math.random() * Math.PI * 2;
            continue;
          }
          const depth = s.dist / maxR;
          const depth2 = depth * depth; // quadratic — more dramatic perspective
          const proximity = s.dist - circleR;
          const fa = s.al * Math.min(proximity / 55, 1) * (0.05 + 0.95 * depth2);
          if (fa < 0.04) continue;

          const x = cx + Math.cos(s.a) * s.dist;
          const y = cy + Math.sin(s.a) * s.dist;
          const sz = s.sz * (0.1 + 0.9 * depth2);

          // Trail points toward center (outward = behind particle moving inward)
          const trailLen = Math.min(s.spd * accel * depth * 28 + 4, maxR * 0.35);
          const tx = cx + Math.cos(s.a) * (s.dist + trailLen);
          const ty = cy + Math.sin(s.a) * (s.dist + trailLen);

          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(tx, ty);
          ctx.strokeStyle = `rgba(220,228,255,${fa * 0.55})`;
          ctx.lineWidth = sz * 0.55;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(x, y, sz * 0.7, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(245,248,255,${fa})`;
          ctx.fill();
        }

        // --- Perspective tunnel lines: converging radial lines from center ---
        const NUM_LINES = 28;
        for (let i = 0; i < NUM_LINES; i++) {
          const lineAngle = (i / NUM_LINES) * Math.PI * 2 + progress * 0.3;
          const innerR = circleR + maxR * 0.02;
          const outerR = maxR * (0.85 + 0.15 * Math.sin(i * 1.7));
          const lineA = 0.06 + 0.04 * Math.abs(Math.sin(i * 2.1 + progress * 4));
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(lineAngle) * innerR, cy + Math.sin(lineAngle) * innerR);
          ctx.lineTo(cx + Math.cos(lineAngle) * outerR, cy + Math.sin(lineAngle) * outerR);
          ctx.strokeStyle = `rgba(180,190,255,${lineA})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }

        // --- Center glow: bright light at end of tunnel ---
        const glowR = Math.max(circleR * 0.9, maxR * 0.06);
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
        glow.addColorStop(0, `rgba(160,180,255,${0.35 * (1 - progress)})`);
        glow.addColorStop(0.4, `rgba(100,130,255,${0.15 * (1 - progress)})`);
        glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, W, H);

        // --- Outer vignette ---
        const vig = ctx.createRadialGradient(cx, cy, maxR * 0.3, cx, cy, maxR);
        vig.addColorStop(0, "rgba(0,0,0,0)");
        vig.addColorStop(0.6, "rgba(0,0,0,0)");
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
