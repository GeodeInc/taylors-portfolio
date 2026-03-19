"use client";

import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

const CANVAS_DURATION = 3500;

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

      type Star = { a: number; dist: number; spd: number; sz: number; al: number; streak: boolean };
      const stars: Star[] = [
        // 3500 dense background dots
        ...Array.from({ length: 3500 }, () => ({
          a: Math.random() * Math.PI * 2,
          dist: 12 + Math.random() * maxR0,
          spd: 0.5 + Math.random() * 1.1,
          sz: 0.3 + Math.random() * 0.65,
          al: 0.45 + Math.random() * 0.55,
          streak: false,
        })),
        // 250 larger streak stars with trails
        ...Array.from({ length: 250 }, () => ({
          a: Math.random() * Math.PI * 2,
          dist: 12 + Math.random() * maxR0,
          spd: 1.5 + Math.random() * 2.8,
          sz: 0.9 + Math.random() * 2.2,
          al: 0.6 + Math.random() * 0.4,
          streak: true,
        })),
      ];

      ctx.fillStyle = "#010103";
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

        // Slow start → fast middle → snap: power 2.8 gives aggressive late acceleration
        const eased = Math.pow(progress, 2.8);
        const circleR = maxR * eased;

        // Acceleration: starts at 1×, hits 12× near end
        const accel = 1 + Math.pow(progress, 1.6) * 11;
        // Spiral rotation speeds up with progress
        const spiral = 0.001 + progress * 0.006;

        // Motion blur: leave ghost trails via semi-transparent overlay
        ctx.fillStyle = "rgba(1,1,3,0.55)";
        ctx.fillRect(0, 0, W, H);

        // ── Stars: all move inward toward focal center ──
        for (const s of stars) {
          s.a += spiral * (s.streak ? 1.0 : 0.55);
          s.dist -= s.spd * accel;

          if (s.dist <= circleR + 3 || s.dist <= 1) {
            s.dist = maxR * (0.45 + Math.random() * 0.55);
            s.a = Math.random() * Math.PI * 2;
            continue;
          }

          // depth: 0 = near center (far/small), 1 = near edge (close/large)
          const depth = s.dist / maxR;
          const d2 = depth * depth;
          const proximity = s.dist - circleR;
          const fa = s.al * Math.min(proximity / 40, 1) * (0.25 + 0.75 * depth);
          if (fa < 0.02) continue;

          const x = cx + Math.cos(s.a) * s.dist;
          const y = cy + Math.sin(s.a) * s.dist;
          const sz = s.sz * (0.2 + 0.8 * d2);

          if (s.streak) {
            // Radial trail pointing away from center (tail behind inward movement)
            const trailLen = Math.min(s.spd * accel * depth * 32 + 3, maxR * 0.4);
            const tx = cx + Math.cos(s.a) * (s.dist + trailLen);
            const ty = cy + Math.sin(s.a) * (s.dist + trailLen);
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(tx, ty);
            ctx.strokeStyle = `rgba(210,220,255,${fa * 0.5})`;
            ctx.lineWidth = sz * 0.5;
            ctx.stroke();
          }

          ctx.beginPath();
          ctx.arc(x, y, Math.max(sz * 0.7, 0.3), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(240,244,255,${fa})`;
          ctx.fill();
        }

        // ── Tunnel rings: concentric circles that contract toward center ──
        for (let i = 0; i < 7; i++) {
          // Each ring moves inward; stagger their phases
          const phase = ((progress * 2.5 + i / 7) % 1);
          const ringR = circleR + (maxR - circleR) * (1 - phase);
          if (ringR <= circleR + 2) continue;
          const ringA = 0.12 * Math.sin(phase * Math.PI); // fade in+out
          ctx.beginPath();
          ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(160,175,255,${ringA})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        // ── Radial convergence lines from outer edge to circle rim ──
        const nLines = 32;
        for (let i = 0; i < nLines; i++) {
          const ang = (i / nLines) * Math.PI * 2 + progress * 0.5;
          const innerR = circleR + 2;
          const outerR = maxR * 0.9;
          if (outerR <= innerR) continue;
          const la = 0.045 + 0.03 * Math.sin(i * 1.3 + progress * 6);
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(ang) * innerR, cy + Math.sin(ang) * innerR);
          ctx.lineTo(cx + Math.cos(ang) * outerR, cy + Math.sin(ang) * outerR);
          ctx.strokeStyle = `rgba(140,160,255,${la})`;
          ctx.lineWidth = 0.55;
          ctx.stroke();
        }

        // ── Center focal glow (bright throughout, fades as circle opens) ──
        const glowR = Math.max(circleR + maxR * 0.18, maxR * 0.22);
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
        glow.addColorStop(0,    `rgba(210,225,255,${0.7 * (1 - eased * 0.7)})`);
        glow.addColorStop(0.15, `rgba(160,185,255,${0.45 * (1 - eased * 0.7)})`);
        glow.addColorStop(0.4,  `rgba(80,110,255,${0.18 * (1 - eased * 0.7)})`);
        glow.addColorStop(1,    "rgba(0,0,0,0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, W, H);

        // ── Outer vignette ──
        const vig = ctx.createRadialGradient(cx, cy, maxR * 0.28, cx, cy, maxR);
        vig.addColorStop(0,   "rgba(0,0,0,0)");
        vig.addColorStop(0.55,"rgba(0,0,0,0)");
        vig.addColorStop(1,   "rgba(0,0,0,0.94)");
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, W, H);

        // ── Destination-out: punch hole → page shows through ──
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
              transition={{ duration: 0.6, ease: [0.4, 0, 1, 1] }}
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
