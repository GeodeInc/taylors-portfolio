"use client";
import React from "react";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { IconBrandGithub, IconBrandLinkedin, IconMail, IconArrowDown } from "@tabler/icons-react";
import { Magnetic } from "@/components/ui/magnetic";

type Point = { x: number; y: number };
interface WaveConfig { offset: number; amplitude: number; frequency: number; color: string; opacity: number }

// Portfolio-tuned wave palette — navy + sage on black
const WAVE_PALETTE: WaveConfig[] = [
  { offset: 0,               amplitude: 65,  frequency: 0.003,  color: "rgba(74,96,128,1)",    opacity: 0.55 },
  { offset: Math.PI / 2,     amplitude: 90,  frequency: 0.0026, color: "rgba(54,77,99,1)",     opacity: 0.45 },
  { offset: Math.PI,         amplitude: 55,  frequency: 0.0034, color: "rgba(168,181,140,1)",  opacity: 0.20 },
  { offset: Math.PI * 1.5,   amplitude: 80,  frequency: 0.0022, color: "rgba(74,96,128,1)",    opacity: 0.18 },
  { offset: Math.PI * 2,     amplitude: 50,  frequency: 0.004,  color: "rgba(136,150,114,1)",  opacity: 0.12 },
];

export const HeroSection = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<Point>({ x: 0, y: 0 });
  const targetMouseRef = useRef<Point>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let time = 0;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouseInfluence = prefersReduced ? 10 : 65;
    const influenceRadius = prefersReduced ? 160 : 300;
    const smoothing = prefersReduced ? 0.04 : 0.1;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const center = { x: canvas.width / 2, y: canvas.height / 2 };
      mouseRef.current = center;
      targetMouseRef.current = center;
    };

    const drawWave = (wave: WaveConfig) => {
      ctx.save();
      ctx.beginPath();
      for (let x = 0; x <= canvas.width; x += 4) {
        const dx = x - mouseRef.current.x;
        const dy = canvas.height / 2 - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const influence = Math.max(0, 1 - dist / influenceRadius);
        const mouseEffect = influence * mouseInfluence * Math.sin(time * 0.001 + x * 0.01 + wave.offset);
        const y =
          canvas.height / 2 +
          Math.sin(x * wave.frequency + time * 0.002 + wave.offset) * wave.amplitude +
          Math.sin(x * wave.frequency * 0.4 + time * 0.003) * (wave.amplitude * 0.4) +
          mouseEffect;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.lineWidth = 2;
      ctx.strokeStyle = wave.color;
      ctx.globalAlpha = wave.opacity;
      ctx.shadowBlur = 28;
      ctx.shadowColor = wave.color;
      ctx.stroke();
      ctx.restore();
    };

    const animate = () => {
      time += 1;
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * smoothing;
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * smoothing;

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      WAVE_PALETTE.forEach(drawWave);
      animId = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", (e) => { targetMouseRef.current = { x: e.clientX, y: e.clientY }; });
    window.addEventListener("mouseleave", () => {
      const center = { x: canvas.width / 2, y: canvas.height / 2 };
      mouseRef.current = center;
      targetMouseRef.current = center;
    });
    animId = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <section
      id="home"
      className="relative w-full overflow-hidden"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />

      {/* Vignette overlay */}
      <div className="pointer-events-none absolute inset-0 bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black_80%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center justify-center px-6 py-32 text-center md:py-48">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-6">
          <span className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium"
            style={{ borderColor: "var(--navy-border)", backgroundColor: "var(--navy-fill-sm)", color: "var(--navy)" }}>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ backgroundColor: "var(--navy)" }} />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: "var(--navy)" }} />
            </span>
            Available for work
          </span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="font-bold w-full break-words" style={{ fontFamily: "var(--font-name)", color: "#ffffff", fontSize: "clamp(2rem, 10vw, 3.75rem)" }}>
          Taylor<br className="sm:hidden" /> Houghtaling
        </motion.h1>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mt-4">
          <TypewriterWords words={["UI/UX Developer at TenzorLLC", "Co-Founder & Full Stack Dev", "Computer Engineering @ Rutgers"]} />
        </motion.div>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6 max-w-2xl text-lg leading-relaxed text-neutral-300">
          CE student at Rutgers, co-founder of TenzorLLC — I build full stack web apps
          with a focus on clean UI and real user experience.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Magnetic>
            <a href="#projects" className="group inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold transition-all hover:scale-[1.05] hover:brightness-110 active:scale-[0.97]"
              style={{ backgroundColor: "var(--navy-dark)", color: "#ffffff", boxShadow: "0 8px 28px var(--navy-shadow)", fontFamily: "var(--font-sub)" }}>
              <span>View My Work</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
          </Magnetic>
          <Magnetic>
            <a href="#contact"
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] px-8 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/[0.08] hover:scale-[1.05] hover:border-white/[0.2] active:scale-[0.97]"
              style={{ fontFamily: "var(--font-sub)" }}>
              Get In Touch
            </a>
          </Magnetic>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 flex items-center gap-5">
          {[
            { href: "https://github.com/GeodeInc",                                           icon: <IconBrandGithub size={18} />,   hc: "var(--navy)",      hbg: "var(--navy-fill-sm)",  hb: "var(--navy-border)"    },
            { href: "https://www.linkedin.com/in/taylor-houghtaling-19b333382/",             icon: <IconBrandLinkedin size={18} />, hc: "var(--navy-dark)", hbg: "var(--navy-fill-sm)",  hb: "var(--navy-border)"    },
            { href: "mailto:taylor@tenzorllc.com",                                           icon: <IconMail size={18} />,          hc: "var(--sage)",      hbg: "var(--sage-fill-sm)",  hb: "var(--sage-border-sm)" },
          ].map((s, i) => (
            <Magnetic key={i} strength={0.5}>
              <a href={s.href}
                target={s.href.startsWith("http") ? "_blank" : undefined}
                rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-neutral-500 transition-all hover:scale-110 active:scale-95"
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = s.hb; e.currentTarget.style.backgroundColor = s.hbg; e.currentTarget.style.color = s.hc; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.backgroundColor = ""; e.currentTarget.style.color = ""; }}>
                {s.icon}
              </a>
            </Magnetic>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 text-neutral-700">
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <IconArrowDown size={16} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const TypewriterWords = ({ words }: { words: string[] }) => {
  const [idx, setIdx] = React.useState(0);
  const [text, setText] = React.useState("");
  const [del, setDel] = React.useState(false);
  React.useEffect(() => {
    const word = words[idx];
    const t = setTimeout(() => {
      if (!del && text === word) { setTimeout(() => setDel(true), 1500); return; }
      if (del && text === "") { setDel(false); setIdx((p) => (p + 1) % words.length); return; }
      setText(del ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1));
    }, del ? 50 : 100);
    return () => clearTimeout(t);
  }, [text, del, idx, words]);
  return (
    <div className="flex items-center gap-2 font-semibold" style={{ fontSize: "clamp(0.85rem, 3.8vw, 1.875rem)", color: "var(--navy)", fontFamily: "var(--font-sub)" }}>
      <span>{text}</span>
      <span className="animate-pulse" style={{ color: "var(--navy-dark)" }}>|</span>
    </div>
  );
};
