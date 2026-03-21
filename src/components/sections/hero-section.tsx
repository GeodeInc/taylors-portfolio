"use client";
import React from "react";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import {
  IconBrandGithub, IconBrandLinkedin, IconMail,
  IconSun, IconMoon,
} from "@tabler/icons-react";
import { Magnetic } from "@/components/ui/magnetic";
import { ImagesBadge } from "@/components/ui/images-badge";
import { EncryptedText } from "@/components/ui/encrypted-text";
import { usePreviewMode } from "@/contexts/preview-mode-context";
import { useTheme } from "@/contexts/theme-context";
import { SvgMaskEffect } from "@/components/ui/svg-mask-effect";

type Point = { x: number; y: number };
interface WaveConfig { offset: number; amplitude: number; frequency: number; color: string; opacity: number }

const WAVE_PALETTE: WaveConfig[] = [
  { offset: 0,               amplitude: 65,  frequency: 0.003,  color: "rgba(74,96,128,1)",    opacity: 0.55 },
  { offset: Math.PI / 2,     amplitude: 90,  frequency: 0.0026, color: "rgba(54,77,99,1)",     opacity: 0.45 },
  { offset: Math.PI,         amplitude: 55,  frequency: 0.0034, color: "rgba(168,181,140,1)",  opacity: 0.20 },
  { offset: Math.PI * 1.5,   amplitude: 80,  frequency: 0.0022, color: "rgba(74,96,128,1)",    opacity: 0.18 },
  { offset: Math.PI * 2,     amplitude: 50,  frequency: 0.004,  color: "rgba(136,150,114,1)",  opacity: 0.12 },
];

// ─── Reusable wave canvas animation hook ────────────────────────────────────
function useWaveCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  enabled: boolean,
  mouseRef: React.RefObject<Point>,
  targetMouseRef: React.RefObject<Point>,
) {
  useEffect(() => {
    if (!enabled) return;
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
    animId = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
}

// ─── Theme-derived colors ────────────────────────────────────────────────────
function heroColors(isLight: boolean) {
  return {
    fg:         isLight ? "var(--navy)"          : "#ffffff",
    fgMuted:    isLight ? "var(--navy-dark)"      : "rgba(255,255,255,0.55)",
    iconBase:   isLight ? "rgba(0,0,0,0.12)"      : "rgba(255,255,255,0.04)",
    iconBorder: isLight ? "rgba(0,0,0,0.1)"       : "rgba(255,255,255,0.08)",
  };
}

// ─── HeroLayer ───────────────────────────────────────────────────────────────
interface HeroLayerProps {
  isLight: boolean;
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
  canvasOpacity?: number;
  text: string;
}

const HeroLayer = ({ isLight, canvasRef, canvasOpacity = 1, text }: HeroLayerProps) => {
  const { fg, fgMuted, iconBase, iconBorder } = heroColors(isLight);
  const mo = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

  return (
    <div
      className="relative w-full min-h-screen overflow-hidden"
      style={{ backgroundColor: isLight ? "#f5f4f0" : "#000000" }}
    >
      {/* Light: sage dot grid */}
      {isLight && (
        <div className="pointer-events-none absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle, rgba(168,181,140,0.65) 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px",
        }} />
      )}

      {/* Dark: wave canvas — only render when dark mode (no ghost element in light) */}
      {!isLight && (
        <canvas
          ref={canvasRef ?? undefined}
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
          style={{ opacity: canvasOpacity, transition: "opacity 1.4s ease-in", pointerEvents: "none" }}
        />
      )}

      {/* Vignette — dark only. Use inline style (not bg-black class) to avoid .light CSS override */}
      {!isLight && (
        <div className="pointer-events-none absolute inset-0"
          style={{
            backgroundColor: "#000000",
            maskImage: "radial-gradient(ellipse at center, transparent 30%, black 80%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, transparent 30%, black 80%)",
          }} />
      )}

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center justify-center px-4 md:px-6 py-20 md:py-32 text-center">

        {/* Available for work pill */}
        <motion.div {...mo} transition={{ ...mo.transition, delay: 0 }} className="mb-3 md:mb-6">
          <span className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium"
            style={{
              borderColor:     isLight ? "#6b7a56"               : "rgba(30,63,122,0.28)",
              backgroundColor: isLight ? "rgba(107,122,86,0.14)" : "rgba(30,63,122,0.08)",
              color:           isLight ? "#4a5a34"               : "#1e3f7a",
              boxShadow:       isLight
                ? "0 0 10px 2px rgba(107,122,86,0.35), 0 0 22px 4px rgba(107,122,86,0.12)"
                : "0 0 10px 2px rgba(30,63,122,0.25), 0 0 22px 4px rgba(30,63,122,0.10)",
            }}>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                style={{ backgroundColor: isLight ? "#6b7a56" : "#1e3f7a" }} />
              <span className="relative inline-flex h-2 w-2 rounded-full"
                style={{ backgroundColor: isLight ? "#6b7a56" : "#1e3f7a" }} />
            </span>
            Available for work
          </span>
        </motion.div>

        {/* Name */}
        <motion.h1 {...mo} transition={{ ...mo.transition, delay: 0.1 }}
          className="font-bold w-full"
          style={{ fontFamily: "var(--font-name)", color: fg, fontSize: "clamp(1.6rem, 8.5vw, 3.75rem)", wordBreak: "keep-all" }}>
          Taylor<br className="sm:hidden" /> Houghtaling
        </motion.h1>

        {/* Encrypted cycling text */}
        <motion.div {...mo} transition={{ ...mo.transition, delay: 0.2 }} className="mt-2 md:mt-4">
          <div style={{ fontSize: "clamp(0.85rem, 3.8vw, 1.875rem)", fontFamily: "var(--font-sub)", color: isLight ? "#889672" : "#2a5298" }}>
            <EncryptedText text={text} revealDelayMs={45} flipDelayMs={40} encryptedClassName="opacity-35" />
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div {...mo} transition={{ ...mo.transition, delay: 0.4 }}
          className="mt-6 md:mt-10 flex flex-wrap items-center justify-center gap-3 md:gap-4">
          <Magnetic>
            <a href="#projects" className="group inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold transition-all hover:scale-[1.05] hover:brightness-110 active:scale-[0.97]"
              style={{
                backgroundColor: isLight ? "#1e3f7a" : "#889672",
                color: "#ffffff",
                border: isLight ? "1px solid rgba(30,63,122,0.55)" : "1px solid rgba(107,122,86,0.55)",
                boxShadow: isLight
                  ? "0 4px 20px rgba(30,63,122,0.55), 0 8px 40px rgba(30,63,122,0.28)"
                  : "0 4px 20px rgba(107,122,86,0.55), 0 8px 40px rgba(107,122,86,0.28)",
                fontFamily: "var(--font-sub)",
              }}>
              <span>View My Work</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
          </Magnetic>
          <Magnetic>
            <a href="#contact"
              className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold backdrop-blur-sm transition-all hover:scale-[1.05] active:scale-[0.97]"
              style={{ border: `1px solid ${iconBorder}`, backgroundColor: iconBase, color: fg, fontFamily: "var(--font-sub)" }}>
              Get In Touch
            </a>
          </Magnetic>
        </motion.div>

        {/* Social icons */}
        <motion.div {...mo} transition={{ ...mo.transition, delay: 0.5 }}
          className="mt-5 md:mt-8 flex items-center gap-3 md:gap-5">
          {[
            { href: "https://github.com/GeodeInc",                                         icon: <IconBrandGithub size={18} />,   hc: "#1e3f7a",  hbg: "rgba(30,63,122,0.08)",   hb: "rgba(30,63,122,0.28)"  },
            { href: "https://www.linkedin.com/in/taylor-houghtaling-19b333382/",           icon: <IconBrandLinkedin size={18} />, hc: "#2a5298",  hbg: "rgba(30,63,122,0.08)",   hb: "rgba(30,63,122,0.28)"  },
            { href: "mailto:taylor@tenzorllc.com",                                         icon: <IconMail size={18} />,          hc: "#a8b58c",  hbg: "rgba(168,181,140,0.07)", hb: "rgba(168,181,140,0.22)"},
          ].map((s, i) => (
            <Magnetic key={i} strength={0.5}>
              <a href={s.href}
                target={s.href.startsWith("http") ? "_blank" : undefined}
                rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95"
                style={{ border: `1px solid ${iconBorder}`, backgroundColor: iconBase, color: fgMuted }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = s.hb; e.currentTarget.style.backgroundColor = s.hbg; e.currentTarget.style.color = s.hc; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = iconBorder; e.currentTarget.style.backgroundColor = iconBase; e.currentTarget.style.color = fgMuted; }}>
                {s.icon}
              </a>
            </Magnetic>
          ))}
        </motion.div>

      </div>
    </div>
  );
};

// ─── StaticHeroReveal — no animations, all hardcoded hex, used as the clip-path reveal layer ──
// Kept intentionally simple: no Framer Motion, no TypewriterWords, no CSS variables.
// This prevents React remounting issues and Framer Motion opacity bleedthrough.
interface StaticHeroRevealProps {
  isLight: boolean; // the theme SHOWN inside the circle (opposite of the current page theme)
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
  text: string;
}

const NAV_ITEMS = [
  { id: "home",    icon: <span className="text-xl leading-none">🏠</span> },
  { id: "about",   icon: <span className="text-xl leading-none">🙋</span> },
  { id: "skills",  icon: <span className="text-xl leading-none">⚡</span> },
  { id: "contact", icon: <span className="text-xl leading-none">✉️</span> },
];

const StaticHeroReveal = ({ isLight, canvasRef, text }: StaticHeroRevealProps) => {
  const [folderOpen, setFolderOpen] = React.useState(false);
  React.useEffect(() => {
    const handler = (e: Event) => setFolderOpen((e as CustomEvent<{ open: boolean }>).detail.open);
    window.addEventListener("projects-folder-hover", handler);
    return () => window.removeEventListener("projects-folder-hover", handler);
  }, []);

  // Mirror the real nav: bottom on desktop, top on mobile/short screens
  const [navTopPx, setNavTopPx] = React.useState(0);
  React.useEffect(() => {
    const update = () => {
      const h = window.innerHeight;
      const desktop = window.innerWidth >= 768 && h >= 600;
      // nav height ≈ 44px; bottom-6 = 24px → top edge = h - 68; top-4 = 16px
      setNavTopPx(desktop ? h - 68 : 16);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  const bg      = isLight ? "#f5f4f0" : "#000000";
  const nameCol = isLight ? "#1e3f7a" : "#ffffff";
  const btnBg   = isLight ? "#1e3f7a" : "#889672";
  const navBar    = isLight ? "#889672"           : "#1e3f7a";
  const navBorder = isLight ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.1)";

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: bg }}>
      {/* GeodeBrand replica — matches fixed left-6 top-5 z-[5000] */}
      <div className="absolute flex items-center pointer-events-none"
        style={{ left: 24, top: 20, zIndex: 20 }}>
        <img src="/geodeinc_icon_only.svg" alt="" width={36} height={36} className="rounded-lg" />
        <img
          src={isLight ? "/geodeinc_wordmark_only_light.svg" : "/geodeinc_wordmark_only.svg"}
          alt=""
          className="hidden sm:block h-7 w-auto object-contain ml-2.5"
        />
      </div>

      {/* Nav replica — matches ScatteredNav position: fixed top-14 centered.
          At scroll=0 the real nav has translateY(height*0.72-56), placing it at ~72vh.
          We replicate that position using absolute top="72vh" within fixed inset-0 portal. */}
      <div className="absolute left-0 right-0 flex justify-center pointer-events-none"
        style={{ top: navTopPx, zIndex: 20 }}>
        <div className="relative flex items-end">
          {NAV_ITEMS.map((item) => (
            <span key={item.id} className="relative flex flex-col items-center px-4 py-2">
              {item.icon}
              {/* Active underline bar */}
              {item.id === "home" && (
                <span className="absolute bottom-0 left-1 right-1 rounded-full"
                  style={{ height: "2px", backgroundColor: navBar }} />
              )}
            </span>
          ))}
          {/* Projects folder — same component, synced hover */}
          <span className="flex flex-col items-center px-4 py-2">
            <ImagesBadge folderSize={{ width: 28, height: 22 }} forceOpen={folderOpen} />
          </span>
          {/* Divider */}
          <span className="self-stretch mx-2 mb-2" style={{ width: 1, backgroundColor: navBorder }} />
          {/* Theme toggle */}
          <span className="flex items-center px-3 py-2">
            {isLight ? <IconMoon size={18} /> : <IconSun size={18} />}
          </span>
          {/* Bottom line */}
          <span className="absolute left-0 right-0 bottom-0 rounded-full"
            style={{ height: "1.5px", backgroundColor: navBorder }} />
        </div>
      </div>
      {/* Light theme: sage dot grid */}
      {isLight && (
        <div className="pointer-events-none absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle, rgba(168,181,140,0.65) 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px",
        }} />
      )}

      {/* Dark theme: wave canvas */}
      {!isLight && canvasRef && (
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" style={{ pointerEvents: "none" }} />
      )}

      {/* Dark theme: vignette */}
      {!isLight && (
        <div className="pointer-events-none absolute inset-0" style={{
          backgroundColor: "#000000",
          maskImage: "radial-gradient(ellipse at center, transparent 30%, black 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, transparent 30%, black 80%)",
        }} />
      )}

      <div className="relative z-10 mx-auto flex h-full min-h-screen w-full max-w-7xl flex-col items-center justify-center px-4 md:px-6 py-20 md:py-32 text-center">
        {/* Available pill */}
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium"
            style={{
              borderColor:     isLight ? "#6b7a56"               : "rgba(30,63,122,0.28)",
              backgroundColor: isLight ? "rgba(107,122,86,0.14)" : "rgba(30,63,122,0.08)",
              color:           isLight ? "#4a5a34"               : "#1e3f7a",
              boxShadow:       isLight
                ? "0 0 10px 2px rgba(107,122,86,0.35), 0 0 22px 4px rgba(107,122,86,0.12)"
                : "0 0 10px 2px rgba(30,63,122,0.25), 0 0 22px 4px rgba(30,63,122,0.10)",
            }}>
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex h-2 w-2 rounded-full"
                style={{ backgroundColor: isLight ? "#6b7a56" : "#1e3f7a" }} />
            </span>
            Available for work
          </span>
        </div>

        {/* Name — hardcoded colors, no motion */}
        <h1
          className="font-bold w-full"
          style={{ fontFamily: "var(--font-name)", color: nameCol, fontSize: "clamp(1.6rem, 8.5vw, 3.75rem)", wordBreak: "keep-all" }}
        >
          Taylor<br className="sm:hidden" /> Houghtaling
        </h1>

        {/* Encrypted text — synced word with base layer */}
        <div className="mt-4">
          <div style={{ fontSize: "clamp(0.85rem, 3.8vw, 1.875rem)", fontFamily: "var(--font-sub)", color: isLight ? "#889672" : "#2a5298" }}>
            <EncryptedText text={text} revealDelayMs={45} flipDelayMs={40} encryptedClassName="opacity-35" />
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <span className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold"
            style={{
              backgroundColor: btnBg,
              color: "#ffffff",
              border: isLight ? "1px solid rgba(30,63,122,0.55)" : "1px solid rgba(136,150,114,0.55)",
              boxShadow: isLight
                ? "0 4px 20px rgba(30,63,122,0.55), 0 8px 40px rgba(30,63,122,0.28)"
                : "0 4px 20px rgba(136,150,114,0.55), 0 8px 40px rgba(136,150,114,0.28)",
              fontFamily: "var(--font-sub)",
            }}>
            View My Work →
          </span>
          <span className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold"
            style={{
              border: isLight ? "1px solid rgba(0,0,0,0.1)" : "1px solid rgba(255,255,255,0.08)",
              backgroundColor: isLight ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.04)",
              color: nameCol,
              fontFamily: "var(--font-sub)",
            }}>
            Get In Touch
          </span>
        </div>

        {/* Social icons */}
        <div className="mt-8 flex items-center gap-5">
          {[
            <IconBrandGithub key="gh" size={18} />,
            <IconBrandLinkedin key="li" size={18} />,
            <IconMail key="mail" size={18} />,
          ].map((icon, i) => (
            <span key={i}
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{
                border: isLight ? "1px solid rgba(0,0,0,0.1)" : "1px solid rgba(255,255,255,0.08)",
                backgroundColor: isLight ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.04)",
                color: isLight ? "rgba(15,23,42,0.55)" : "rgba(255,255,255,0.55)",
              }}>
              {icon}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── HeroSection ─────────────────────────────────────────────────────────────
export const HeroSection = () => {
  const canvasRef       = useRef<HTMLCanvasElement | null>(null);  // base layer (dark mode)
  const revealCanvasRef = useRef<HTMLCanvasElement | null>(null);  // reveal layer (dark peek when in light mode)
  const mouseRef        = useRef<Point>({ x: 0, y: 0 });
  const targetMouseRef  = useRef<Point>({ x: 0, y: 0 });
  const isPreview       = usePreviewMode();
  const { theme }       = useTheme();
  const isLight         = theme === "light";
  const [canvasOpacity, setCanvasOpacity] = React.useState(1);
  const [onHero, setOnHero] = React.useState(true);
  const [isMobile, setIsMobile] = React.useState(false);
  const navTargetRef = useRef<string | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Disable reveal when scrolled off the hero section
  useEffect(() => {
    const scrollEl = document.querySelector("main") as HTMLElement | null;
    if (!scrollEl) return;
    const onScroll = () => setOnHero(scrollEl.scrollTop < window.innerHeight * 0.5);
    scrollEl.addEventListener("scroll", onScroll, { passive: true });
    return () => scrollEl.removeEventListener("scroll", onScroll);
  }, []);

  // Base layer canvas — runs when dark mode is active
  useWaveCanvas(canvasRef,       !isPreview && !isLight, mouseRef, targetMouseRef);
  // Reveal layer canvas — runs when light mode is active (reveal shows dark peek)
  useWaveCanvas(revealCanvasRef, !isPreview && isLight,  mouseRef, targetMouseRef);

  // Global mouse tracking shared by both canvases
  useEffect(() => {
    const onMove  = (e: MouseEvent) => { targetMouseRef.current = { x: e.clientX, y: e.clientY }; };
    const onLeave = () => {
      targetMouseRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    };
    window.addEventListener("mousemove",  onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseleave", onLeave); };
  }, []);

  useEffect(() => {
    const onTransition = (e: Event) => {
      const { target } = (e as CustomEvent<{ target: string; source: string }>).detail;
      navTargetRef.current = target;
      if (target === "home") setCanvasOpacity(0);
    };
    const onDone = () => { if (navTargetRef.current === "home") setCanvasOpacity(1); };
    window.addEventListener("nav-transition", onTransition);
    window.addEventListener("nav-transition-done", onDone);
    return () => {
      window.removeEventListener("nav-transition", onTransition);
      window.removeEventListener("nav-transition-done", onDone);
    };
  }, []);

  // Shared word — both layers receive the same string so EncryptedText decodes in sync
  const WORDS = ["UI/UX Developer at TenzorLLC", "Co-Founder & Full Stack Dev", "Computer Engineering @ Rutgers"];
  const twText = useWordCycler(WORDS);

  return (
    <section id="home" className="relative w-full overflow-hidden" style={{ backgroundColor: isLight ? "#f5f4f0" : "#000000" }}>
      <SvgMaskEffect
        revealSize={80}
        enabled={onHero && !isMobile}
        revealChildren={<StaticHeroReveal isLight={!isLight} canvasRef={revealCanvasRef} text={twText} />}
      >
        <HeroLayer isLight={isLight} canvasRef={canvasRef} canvasOpacity={canvasOpacity} text={twText} />
      </SvgMaskEffect>
    </section>
  );
};

// ─── useWordCycler ────────────────────────────────────────────────────────────
// Cycles through words on a fixed interval. EncryptedText re-decodes each time
// the word changes. Waits for the page-loader intro to finish before starting.
function useWordCycler(words: string[], intervalMs = 3500) {
  const [idx, setIdx] = React.useState(0);
  const [ready, setReady] = React.useState(
    () => typeof sessionStorage !== "undefined" && sessionStorage.getItem("intro-played") === "1"
  );
  React.useEffect(() => {
    if (ready) return;
    const handler = () => setReady(true);
    window.addEventListener("intro-done", handler);
    return () => window.removeEventListener("intro-done", handler);
  }, [ready]);
  React.useEffect(() => {
    if (!ready) return;
    const timer = setInterval(() => setIdx(i => (i + 1) % words.length), intervalMs);
    return () => clearInterval(timer);
  }, [ready, words.length, intervalMs]);
  return words[idx];
}
