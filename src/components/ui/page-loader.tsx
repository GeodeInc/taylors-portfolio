"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, MotionConfig, motion, useAnimation } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { HomeNavIcon, SkillsNavIcon, PersonNavIcon, MailNavIcon } from "@/components/ui/nav-icons";
import { ImagesBadge } from "@/components/ui/images-badge";
import { useTheme } from "@/contexts/theme-context";
import { PreviewModeContext } from "@/contexts/preview-mode-context";
import { HeroSection } from "@/components/sections/hero-section";
import { AboutSection } from "@/components/sections/about-section";
import { SkillsSection } from "@/components/sections/skills-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { ContactSection } from "@/components/sections/contact-section";

const WormholeCanvas = dynamic(() => import("./wormhole-canvas"), { ssr: false });

// Module-level flag — resets on every hard refresh (page load), persists across client-side navigation
let spillPlayedThisLoad = false;

const SECTION_COMPONENTS: Record<string, React.ReactNode> = {
  home:     <HeroSection />,
  projects: <ProjectsSection />,
  skills:   <SkillsSection />,
  about:    <AboutSection />,
  contact:  <ContactSection />,
};

// Renders a section scaled to always fill its container, tracked via ResizeObserver
function SectionPreview({ section }: { section: string }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.333);
  // Use actual viewport as the inner canvas so content is 1:1 at full-screen
  const vpW = typeof window !== "undefined" ? window.innerWidth  : 1440;
  const vpH = typeof window !== "undefined" ? window.innerHeight : 900;

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    let rafId = 0;
    const ro = new ResizeObserver(([entry]) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const { width: w, height: h } = entry.contentRect;
        setScale(Math.min(w / vpW, h / vpH));
      });
    });
    ro.observe(el);
    return () => { ro.disconnect(); cancelAnimationFrame(rafId); };
  }, [vpW, vpH]);

  return (
    <MotionConfig reducedMotion="always">
      <PreviewModeContext.Provider value={true}>
        <div ref={outerRef} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <div
            data-preview="true"
            style={{
              position: "absolute",
              width: vpW,
              height: vpH,
              top: (300 - vpH) / 2,
              left: (480 - vpW) / 2,
              transform: `scale(${scale})`,
              transformOrigin: "center center",
              pointerEvents: "none",
            }}
          >
            <style>{`
              [data-preview="true"] *,
              [data-preview="true"] *::before,
              [data-preview="true"] *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                transition-delay: 0ms !important;
                opacity: 1 !important;
              }
              [data-preview="true"] .animate-scroll {
                animation-duration: var(--animation-duration) !important;
                animation-iteration-count: infinite !important;
              }
              [data-preview="true"] .min-h-screen,
              [data-preview="true"] section {
                min-height: ${vpH}px !important;
                height: ${vpH}px !important;
              }
            `}</style>
            {SECTION_COMPONENTS[section]}
          </div>
        </div>
      </PreviewModeContext.Provider>
    </MotionConfig>
  );
}

const PROJECT_PREVIEWS = [
  "/preview/tenzor",
  "/preview/pos",
  "/preview/color",
  "/preview/reflection",
];


const SECTION_NAMES: Record<string, string> = {
  home: "Home", projects: "Projects", skills: "Skills", about: "About", contact: "Contact",
};

const SECTION_INDEX: Record<string, number> = {
  home: 0, projects: 1, skills: 2, about: 3, contact: 4,
};

const SECTION_ORDER = ["home", "projects", "skills", "about", "contact"];


const STAGGER   = 18; // px vertical offset per card depth
const X_STAGGER = 30; // px horizontal offset per card depth (stagger right)

// ─── Overlay — completely independent, listens for custom events ──────────────
function NavTransitionOverlay() {
  const { theme } = useTheme();
  const overlayBg = theme === "light" ? "#f5f4f0" : "#000000";
  // phase: idle → shrinking → animating → expanding → idle
  const [phase, setPhase] = useState<"idle" | "shrinking" | "animating" | "expanding">("idle");
  const [finalTarget, setFinalTarget] = useState("about");
  const [animSrc, setAnimSrc] = useState("home");
  const [animTgt, setAnimTgt] = useState("about");
  const [swapped, setSwapped] = useState(false);
  const [fast, setFast] = useState(false);
  const [hasTransitioned, setHasTransitioned] = useState(false);
  const [vp, setVp] = useState({ w: 0, h: 0 });
  const containerAnim = useAnimation();
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const shrinkParamsRef = useRef<{ isFast: boolean; absSteps: number; srcIdx: number; dir: number; fullScale: number } | null>(null);

  const clearAll = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const sched = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  };

  // Kick off shrink animation AFTER React has re-rendered the overlay visible
  useEffect(() => {
    if (phase !== "shrinking" || !shrinkParamsRef.current) return;
    const { isFast, absSteps, srcIdx, dir, fullScale } = shrinkParamsRef.current;

    containerAnim.set({ scale: fullScale, rotateX: 0, rotateY: 0 });
    containerAnim.start({
      scale: 1, rotateX: 4, rotateY: -6,
      transition: { duration: 1.1, ease: [0.4, 0, 0.15, 1] },
    }).then(() => {
      setPhase("animating");

      const SWAP_TIME    = isFast ? 240 : 1010;
      const STEP_DUR     = isFast ? 650 : 0;
      const EXPAND_DELAY = isFast ? absSteps * STEP_DUR + 300 : 2300;

      sched(() => setSwapped(true), SWAP_TIME);

      for (let i = 1; i < absSteps; i++) {
        const ss = SECTION_ORDER[srcIdx + dir * i];
        const st = SECTION_ORDER[srcIdx + dir * (i + 1)];
        sched(() => {
          setAnimSrc(ss);
          setAnimTgt(st);
          setSwapped(false);
          sched(() => setSwapped(true), SWAP_TIME);
        }, i * STEP_DUR);
      }

      sched(() => setPhase("expanding"), EXPAND_DELAY);
    });
  }, [phase]); // eslint-disable-line

  useEffect(() => {
    const handler = (e: Event) => {
      // Skip 3D animation for reduced motion or touch devices
      const noAnim =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        !window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      if (noAnim) {
        window.dispatchEvent(new Event("nav-transition-done"));
        return;
      }

      const { target: t, source: s } = (e as CustomEvent<{ target: string; source: string }>).detail;
      const srcIdx   = SECTION_ORDER.indexOf(s);
      const tgtIdx   = SECTION_ORDER.indexOf(t);
      const absSteps = Math.abs(tgtIdx - srcIdx);
      const dir      = tgtIdx > srcIdx ? 1 : -1;
      const isFast   = absSteps > 1;

      clearAll();
      setFinalTarget(t);
      setFast(isFast);
      setSwapped(false);
      setHasTransitioned(true);
      setAnimSrc(s);
      setAnimTgt(SECTION_ORDER[srcIdx + dir]);

      // Store params — the shrinking useEffect will pick these up after re-render
      shrinkParamsRef.current = {
        isFast, absSteps, srcIdx, dir,
        fullScale: Math.max(window.innerWidth / 480, window.innerHeight / 300),
      };
      setPhase("shrinking");
    };

    window.addEventListener("nav-transition", handler);
    return () => window.removeEventListener("nav-transition", handler);
  }, []);

  // Drive expanding animation
  useEffect(() => {
    if (phase !== "expanding") return;
    clearAll();
    const vpW = vp.w || window.innerWidth;
    const vpH = vp.h || window.innerHeight;
    const fullScale = Math.max(vpW / 480, vpH / 300);
    // Snap rotation to exactly 0 first so the perspective-free scale-up has no tilt residue
    containerAnim.set({ rotateX: 0, rotateY: 0 });
    containerAnim.start({
      scale: fullScale,
      transition: { type: "spring", stiffness: 40, damping: 22, mass: 1.2 },
    }).then(() => {
      setPhase("idle");
      window.dispatchEvent(new Event("nav-transition-done"));
    });
  }, [phase]); // eslint-disable-line

  useEffect(() => {
    const update = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const show      = phase !== "idle";
  const expanding = phase === "expanding";
  const shrinking = phase === "shrinking";

  // Card stack orders and positions
  const srcIdx = SECTION_ORDER.indexOf(animSrc);
  const tgtIdx = SECTION_ORDER.indexOf(animTgt);
  const dir    = tgtIdx - srcIdx;

  const preOrder = [0, 1, 2, 3, 4].map(i =>
    i === 0 ? SECTION_ORDER[srcIdx] : SECTION_ORDER[((tgtIdx + (i - 1) * dir) + 5) % 5]
  );
  const postOrder = [0, 1, 2, 3].map(i =>
    SECTION_ORDER[((tgtIdx + i * dir) + 5) % 5]
  ).concat([SECTION_ORDER[srcIdx]]);

  const liftDur    = fast ? 0.55 : 2.4;
  const slideDelay = fast ? 0.25 : 0.9;
  const slideDur   = fast ? 0.28 : 0.9;
  const LIFT_PEAK  = -(4 * STAGGER + 320);

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 8000, opacity: show ? 1 : 0 }}
    >
      {/* Solid backdrop — fades out when expanding */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: overlayBg }} />

      {/* Card stack container — driven by useAnimation */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ perspective: expanding ? "none" : "1400px" }}>
        <motion.div
          animate={containerAnim}
          style={{
            width: 480,
            height: 300,
            position: "relative",
            overflow: (expanding || shrinking) ? "hidden" : "visible",
            pointerEvents: "none",
            transformOrigin: "center center",
          }}
        >
          {SECTION_ORDER.map((section) => {
            const prePos     = preOrder.indexOf(section);
            const postPos    = postOrder.indexOf(section);
            const isSource   = section === animSrc;
            const isTarget   = section === finalTarget;
            const preX       =  prePos  * X_STAGGER;
            const postX      =  postPos * X_STAGGER;
            const preY       = -prePos  * STAGGER;
            const postY      = -postPos * STAGGER;
            const preScaleX  = 1 - prePos  * 0.055;
            const postScaleX = 1 - postPos * 0.055;
            const preZ  = 5 - prePos;
            const postZ = 5 - postPos;
            return (
              <motion.div
                key={section}
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundColor: overlayBg,
                  borderRadius: expanding && isTarget ? 0 : "1rem",
                  boxShadow: shrinking ? "none" : `0 10px 32px rgba(74,96,128,${Math.max(0, 0.35 - prePos * 0.06)}), 0 50px 100px rgba(0,0,0,0.65)`,
                  zIndex: shrinking ? (isSource ? 5 : 1) : (swapped ? postZ : preZ),
                  overflow: "visible",
                }}
                initial={{ x: preX, y: preY, scaleX: preScaleX }}
                animate={
                  shrinking
                    ? { x: 0, y: 0, scaleX: 1, opacity: isSource ? 1 : 0 }
                    : expanding
                      ? isTarget
                        ? { x: 0, y: 0, scaleX: 1, opacity: 1 }
                        : { x: 0, y: 0, scaleX: 1, opacity: 0 }
                      : isSource && show
                        ? {
                            x: [preX, preX, preX, postX],
                            y: [preY, LIFT_PEAK, LIFT_PEAK, postY],
                            scaleX: [preScaleX, postScaleX, postScaleX, postScaleX],
                            opacity: 1,
                          }
                        : hasTransitioned
                          ? { x: postX, y: postY, scaleX: postScaleX, opacity: 1 }
                          : { x: preX,  y: preY,  scaleX: preScaleX,  opacity: 1 }
                }
                transition={
                  shrinking
                    ? { duration: 0 }
                    : expanding
                      ? { duration: 0.4, ease: "easeOut" }
                      : isSource && show
                        ? { duration: liftDur, times: [0, 0.38, 0.42, 1], ease: "easeInOut" }
                        : { duration: show ? slideDur : 0, delay: show ? slideDelay + (prePos - 1) * 0.05 : 0, ease: [0.22, 1, 0.36, 1] }
                }
              >
                {/* Section preview — clipped to card bounds */}
                <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: expanding && isTarget ? 0 : "1rem" }}>
                  {show && (
                    (shrinking  && prePos === 0) ||
                    (phase === "animating" && prePos <= 1) ||
                    (expanding  && isTarget)
                  ) && <SectionPreview section={section} />}
                </div>

                {/* Border overlay */}
                {(!shrinking || isSource) && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{ border: "1px solid var(--navy)", borderRadius: "1rem", zIndex: 10 }}
                    animate={expanding && isTarget ? { opacity: 0 } : { opacity: 1 }}
                    transition={{ duration: 0.25, delay: 0 }}
                  />
                )}

                {/* Label — lives inside the card so it follows card movement */}
                {!expanding && (
                  <div style={{ position: "absolute", top: -22, left: 0, zIndex: 20 }}>
                    <p className="text-xs font-medium" style={{
                      fontFamily: "var(--font-sans)",
                      color: theme === "light" ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.6)",
                    }}>
                      {SECTION_NAMES[section]}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>

    </div>
  );
}

// ─── Spill Overlay ────────────────────────────────────────────────────────────
type SpillRect = { x: number; y: number; width: number; height: number };

function SpillOverlay() {
  const [phase, setPhase] = useState<"idle" | "flying" | "landing" | "gone">("idle");
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [rects,  setRects]  = useState<SpillRect[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { origin: o, rects: r } = (e as CustomEvent<{ origin: { x: number; y: number }; rects: SpillRect[] }>).detail;
      setOrigin(o);
      setRects(r);
      setPhase("flying");
      // land → settle 1.5s → cards + iframes crossfade together → idle
      const t1 = setTimeout(() => setPhase("landing"), 800);
      const t2 = setTimeout(() => {
        window.dispatchEvent(new Event("projects-spill-done")); // cards start fading in
        setPhase("gone"); // iframes start fading out — simultaneous crossfade
      }, 800 + 1500);
      const t3 = setTimeout(() => setPhase("idle"), 800 + 1500 + 1200);
      timers.current = [t1, t2, t3];
    };
    window.addEventListener("projects-spill", handler);
    return () => {
      window.removeEventListener("projects-spill", handler);
      timers.current.forEach(clearTimeout);
    };
  }, []);

  if (phase === "idle" || rects.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 7500 }}>
      {PROJECT_PREVIEWS.map((src, i) => {
        const rect = rects[i];
        if (!rect) return null;
        const initRotate = (i - 1.5) * 14;
        const flyRotate  = (i - 1.5) * 4;
        return (
          <motion.div
            key={i}
            className="absolute overflow-hidden rounded-xl shadow-2xl"
            // Pin the div at the exact card-header position via left/top;
            // use x/y only as the offset from that anchor (starts at folder, lands at 0,0)
            style={{
              width:  rect.width,
              height: rect.height,
              left:   rect.x,
              top:    rect.y,
            }}
            initial={{
              x: origin.x - rect.x - rect.width  / 2,
              y: origin.y - rect.y - rect.height / 2,
              scale: 0,
              opacity: 0,
              rotate: initRotate,
            }}
            animate={
              phase === "flying"
                ? { x: 0, y: 0, scale: 1, opacity: 1, rotate: flyRotate }
                : phase === "landing"
                ? { x: 0, y: 0, scale: 1,    opacity: 0.85, rotate: 0 }
                : { x: 0, y: 0, scale: 1, opacity: 0, rotate: 0 }
            }
            transition={
              phase === "flying"
                ? {
                    delay: i * 0.12,
                    // Y falls fast with gravity; X spreads slowly so motion reads as "down"
                    x: { duration: 1.0, ease: [0.2, 0, 0.4, 1],  delay: i * 0.12 },
                    y: { duration: 0.65, ease: [0.6, 0, 1, 0.6], delay: i * 0.12 },
                    scale:   { type: "spring", stiffness: 200, damping: 18, delay: i * 0.12 },
                    opacity: { duration: 0.15, delay: i * 0.12 },
                    rotate:  { duration: 1.0, ease: "easeOut",    delay: i * 0.12 },
                  }
                : phase === "gone"
                  ? { opacity: { duration: 1.1, ease: "linear" }, duration: 0 }
                  : { duration: 0.35, ease: "easeOut" }
            }
          >
            <iframe
              src={src}
              style={{ width: rect.width, height: rect.height, pointerEvents: "none", border: "none", display: "block" }}
              scrolling="no"
            />
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function ScatteredNav() {
  const { theme, toggle } = useTheme();
  const isLight = theme === "light";
  const btnBorder = isLight ? "var(--sage-border)"        : "var(--navy-border)";
  const btnColor  = isLight ? "var(--sage-deep)"          : "var(--navy)";
  const muted     = isLight ? "rgba(0,0,0,0.35)"          : "rgba(255,255,255,0.35)";
  const [mounted, setMounted] = useState(false);
  const [onHero, setOnHero] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [reanimKey, setReanimKey] = useState(0);
  const [folderHovered, setFolderHovered] = useState(false);
  const [homeHovered, setHomeHovered] = useState(false);
  const [skillsHovered, setSkillsHovered] = useState(false);
  const [contactHovered, setContactHovered] = useState(false);
  const [aboutHovered, setAboutHovered] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const previewsOpen = useRef(false);
  const closePreviewsRef = useRef<(() => void) | null>(null);
  const projectsBtnRef = useRef<HTMLButtonElement>(null);
  const doSpillRef = useRef(false);
  const useOverlayForProjectsRef = useRef(false);
  const scrollingRef = useRef(false);
  const wheelAccum = useRef(0);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handler = (e: Event) => setFolderHovered((e as CustomEvent<{ open: boolean }>).detail.open);
    window.addEventListener("projects-folder-hover", handler);
    return () => window.removeEventListener("projects-folder-hover", handler);
  }, []);

  useEffect(() => {
    const handler = () => setReanimKey(k => k + 1);
    window.addEventListener("nav-transition-done", handler);
    return () => window.removeEventListener("nav-transition-done", handler);
  }, []);

  // Wheel handler — accumulates trackpad deltas, advances sections on threshold
  useEffect(() => {
    if (!mounted) return;
    const scrollEl = document.querySelector("main") as HTMLElement | null;
    if (!scrollEl) return;
    let resetTimer: ReturnType<typeof setTimeout>;

    const onWheel = (e: WheelEvent) => {
      if (window.innerWidth < 768) return; // natural scroll on mobile
      e.preventDefault();
      if (scrollingRef.current) return;
      wheelAccum.current += e.deltaY;
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => { wheelAccum.current = 0; }, 200);
      if (Math.abs(wheelAccum.current) < 60) return;
      const dir = wheelAccum.current > 0 ? 1 : -1;
      wheelAccum.current = 0;
      const currentIdx = Math.round(scrollEl.scrollTop / scrollEl.clientHeight);
      const nextIdx = Math.max(0, Math.min(4, currentIdx + dir));
      if (nextIdx === currentIdx) return;
      scrollingRef.current = true;
      scrollEl.scrollTo({ top: nextIdx * scrollEl.clientHeight, behavior: "smooth" });
      setTimeout(() => { scrollingRef.current = false; }, 700);
    };

    scrollEl.addEventListener("wheel", onWheel, { passive: false });
    return () => { scrollEl.removeEventListener("wheel", onWheel); clearTimeout(resetTimer); };
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const scrollEl = document.querySelector("main") as HTMLElement | null;
    const onScroll = () => {
      if (previewsOpen.current) return;
      const scrollTop = scrollEl ? scrollEl.scrollTop : 0;
      const height = window.innerHeight;
      const width = window.innerWidth;
      const desktop = width >= 768 && height >= 600;
      setIsDesktop(desktop);
      if (desktop) {
        // Desktop: slide nav from bottom (hero) to top as user scrolls
        // top-4 = 16px, bottom-6 = 24px, nav height ≈ 44px → offset = height - 84
        const heroOffset = height - 84;
        const ratio = Math.min(scrollTop / height, 1);
        const translateY = heroOffset * (1 - ratio);
        if (navRef.current) navRef.current.style.transform = `translateY(${translateY}px)`;
      } else {
        // Mobile/short: always at top, no translation
        if (navRef.current) navRef.current.style.transform = "translateY(0px)";
      }
      setOnHero(scrollTop < height * 0.5);
      const sectionIdx = Math.min(Math.round(scrollTop / height), 4);
      const found = Object.keys(SECTION_INDEX).find(k => SECTION_INDEX[k] === sectionIdx);
      setActiveSection(found ?? "home");
    };
    onScroll();
    const target = scrollEl ?? window;
    target.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      target.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [mounted]);

  if (!mounted) return null;

  const navigateTo = (id: string) => {
    closePreviewsRef.current?.();
    const scrollEl = document.querySelector("main") as HTMLElement | null;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = !window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (id === "projects" && activeSection !== "projects") {
      if (!spillPlayedThisLoad && !reduced && !isTouch) {
        // First time navigating to projects — do spill
        spillPlayedThisLoad = true;
        doSpillRef.current = true;
        window.dispatchEvent(new Event("projects-spill-hide"));
      } else {
        // Spill already played — use nav overlay like every other section
        useOverlayForProjectsRef.current = true;
        window.dispatchEvent(new CustomEvent("nav-transition", { detail: { target: id, source: activeSection } }));
      }
    } else if (id !== "projects") {
      window.dispatchEvent(new CustomEvent("nav-transition", { detail: { target: id, source: activeSection } }));
    }

    setTimeout(() => {
      if (!scrollEl) return;
      const targetTop = SECTION_INDEX[id] * scrollEl.clientHeight;
      if (id === "projects" && doSpillRef.current) {
        doSpillRef.current = false;
        // Slow eased scroll; dispatch spill with real positions once scroll finishes
        // (nav will have slid to its top position by then, so origin is correct)
        const start = scrollEl.scrollTop;
        const delta = targetTop - start;
        const duration = 1300;
        const startTime = performance.now();
        const ease = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        const step = (now: number) => {
          const p = Math.min((now - startTime) / duration, 1);
          scrollEl.scrollTop = start + delta * ease(p);
          if (p < 1) {
            requestAnimationFrame(step);
          } else {
            // Scroll done — nav is now at the top; read button position and card rects
            const btnRect = projectsBtnRef.current?.getBoundingClientRect();
            const origin = btnRect
              ? { x: btnRect.left + btnRect.width / 2, y: btnRect.top + btnRect.height / 2 }
              : { x: window.innerWidth / 2, y: 20 };
            const headers = Array.from(document.querySelectorAll("[data-project-header]")).slice(0, 4);
            const rects = headers.map(el => {
              const r = el.getBoundingClientRect();
              return { x: r.x, y: r.y, width: r.width, height: r.height };
            });
            window.dispatchEvent(new CustomEvent("projects-spill", { detail: { origin, rects } }));
          }
        };
        requestAnimationFrame(step);
      } else {
        // If overlay was triggered for projects, or non-projects section: instant scroll (overlay handles visual)
        // If plain projects smooth scroll (shouldn't normally reach here post-spill): smooth
        const usingOverlay = id === "projects" && useOverlayForProjectsRef.current;
        if (usingOverlay) useOverlayForProjectsRef.current = false;
        scrollEl.scrollTo({ top: targetTop, behavior: usingOverlay ? undefined : (id === "projects" ? "smooth" : undefined) });
      }
    }, 100);
  };

  const forwardScroll = (e: React.WheelEvent) => {
    const main = document.querySelector("main") as HTMLElement | null;
    if (main) main.scrollTop += e.deltaY;
  };

  const hoverTrans = { type: "spring", stiffness: 300, damping: 22 } as const;

  return (
    <>
      {/* ── Section progress dots (desktop only) ── */}
      {mounted && isDesktop && (
        <div
          className="fixed flex flex-col items-center pointer-events-auto"
          style={{ right: 16, top: "50%", transform: "translateY(-50%)", zIndex: 4999, gap: 8 }}
        >
          {(["home", "projects", "skills", "about", "contact"] as const).map((s) => (
            <motion.button
              key={s}
              title={s.charAt(0).toUpperCase() + s.slice(1)}
              aria-label={`Go to ${s.charAt(0).toUpperCase() + s.slice(1)} section`}
              aria-current={activeSection === s ? "true" : undefined}
              onClick={() => navigateTo(s)}
              animate={{
                height: activeSection === s ? 22 : 6,
                opacity: activeSection === s ? 1 : 0.30,
              }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              style={{
                width: 4,
                borderRadius: 9999,
                background: btnColor,
                border: "none",
                padding: 0,
                cursor: activeSection === s ? "default" : "pointer",
                flexShrink: 0,
              }}
            />
          ))}
        </div>
      )}

      {/* ── Desktop nav bar ── */}
      <div
        ref={navRef}
        className="fixed top-4 right-2 md:right-0 md:inset-x-0 md:justify-center hidden md:flex pointer-events-none"
        style={{ willChange: "transform", zIndex: folderHovered ? 6001 : 5000 }}
      >
      <div className="relative flex items-end pointer-events-auto">
        {/* ── Home ── */}
        <motion.button
          key={`home-${reanimKey}`}
          title="Home"
          disabled={activeSection === "home"}
          className="relative flex flex-col items-center px-2 md:px-4 py-2"
          style={{ cursor: activeSection === "home" ? "default" : "pointer" }}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "tween", ease: [0.22, 1, 0.36, 1], duration: 0.5, delay: 0 }}
          whileHover={activeSection === "home" ? {} : { y: -3, transition: hoverTrans }}
          onMouseEnter={() => setHomeHovered(true)}
          onMouseLeave={() => setHomeHovered(false)}
          onClick={() => navigateTo("home")}
          onWheel={forwardScroll}
        >
          <HomeNavIcon size={26} isOpen={activeSection === "home" || homeHovered} />
          {activeSection === "home" && (
            <motion.div
              layoutId="nav-underline"
              className="absolute -bottom-px left-0 right-0 h-[2px] rounded-full"
              style={{ backgroundColor: btnColor }}
              transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
            />
          )}
        </motion.button>

        {/* ── Projects ── */}
        <motion.button
          key={`projects-${reanimKey}`}
          ref={projectsBtnRef}
          title="Projects"
          disabled={activeSection === "projects"}
          className="relative flex flex-col items-center px-2 md:px-4 py-2"
          style={{ color: activeSection === "projects" ? btnColor : muted, zIndex: 5001, cursor: activeSection === "projects" ? "default" : "pointer" }}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "tween", ease: [0.22, 1, 0.36, 1], duration: 0.5, delay: 1 * 0.07 }}
          whileHover={activeSection === "projects" ? {} : { y: -3, transition: hoverTrans }}
          onClick={() => navigateTo("projects")}
          onWheel={forwardScroll}
        >
          <ImagesBadge
            iframes={PROJECT_PREVIEWS}
            folderSize={{ width: 28, height: 22 }}
            hoverImageSize={{ width: 150, height: 100 }}
            hoverSpread={100}
            hoverRotation={14}
            hoverOffsetY={64}
            direction={onHero && isDesktop ? "up" : "down"}
            onOpenChange={(open) => {
              previewsOpen.current = open;
              window.dispatchEvent(new CustomEvent("projects-folder-hover", { detail: { open } }));
            }}
            closeRef={closePreviewsRef}
          />
          {activeSection === "projects" && (
            <motion.div
              layoutId="nav-underline"
              className="absolute -bottom-px left-0 right-0 h-[2px] rounded-full"
              style={{ backgroundColor: btnColor }}
              transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
            />
          )}
        </motion.button>

        {/* ── Skills ── */}
        <motion.button
          key={`skills-${reanimKey}`}
          title="Skills"
          disabled={activeSection === "skills"}
          className="relative flex flex-col items-center px-2 md:px-4 py-2"
          style={{ color: activeSection === "skills" ? btnColor : muted, cursor: activeSection === "skills" ? "default" : "pointer" }}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "tween", ease: [0.22, 1, 0.36, 1], duration: 0.5, delay: 2 * 0.07 }}
          whileHover={activeSection === "skills" ? {} : { y: -3, transition: hoverTrans }}
          onMouseEnter={() => setSkillsHovered(true)}
          onMouseLeave={() => setSkillsHovered(false)}
          onClick={() => navigateTo("skills")}
          onWheel={forwardScroll}
        >
          <SkillsNavIcon size={26} isOpen={activeSection === "skills" || skillsHovered} />
          {activeSection === "skills" && (
            <motion.div
              layoutId="nav-underline"
              className="absolute -bottom-px left-0 right-0 h-[2px] rounded-full"
              style={{ backgroundColor: btnColor }}
              transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
            />
          )}
        </motion.button>

        {/* ── About ── */}
        {/* ── About ── */}
        <motion.button
          key={`about-${reanimKey}`}
          title="About"
          disabled={activeSection === "about"}
          className="relative flex flex-col items-center px-2 md:px-4 py-2"
          style={{ color: activeSection === "about" ? btnColor : muted, cursor: activeSection === "about" ? "default" : "pointer" }}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "tween", ease: [0.22, 1, 0.36, 1], duration: 0.5, delay: 3 * 0.07 }}
          whileHover={activeSection === "about" ? {} : { y: -3, transition: hoverTrans }}
          onMouseEnter={() => setAboutHovered(true)}
          onMouseLeave={() => setAboutHovered(false)}
          onClick={() => navigateTo("about")}
          onWheel={forwardScroll}
        >
          <PersonNavIcon size={26} isActive={activeSection === "about" || aboutHovered} />
          {activeSection === "about" && (
            <motion.div
              layoutId="nav-underline"
              className="absolute -bottom-px left-0 right-0 h-[2px] rounded-full"
              style={{ backgroundColor: btnColor }}
              transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
            />
          )}
        </motion.button>

        {/* ── Contact ── */}
        <motion.button
          key={`contact-${reanimKey}`}
          title="Contact"
          disabled={activeSection === "contact"}
          className="relative flex flex-col items-center px-2 md:px-4 py-2"
          style={{ color: activeSection === "contact" ? btnColor : muted, cursor: activeSection === "contact" ? "default" : "pointer" }}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "tween", ease: [0.22, 1, 0.36, 1], duration: 0.5, delay: 4 * 0.07 }}
          whileHover={activeSection === "contact" ? {} : { y: -3, transition: hoverTrans }}
          onMouseEnter={() => setContactHovered(true)}
          onMouseLeave={() => setContactHovered(false)}
          onClick={() => navigateTo("contact")}
          onWheel={forwardScroll}
        >
          <MailNavIcon size={26} isOpen={activeSection === "contact" || contactHovered} />
          {activeSection === "contact" && (
            <motion.div
              layoutId="nav-underline"
              className="absolute -bottom-px left-0 right-0 h-[2px] rounded-full"
              style={{ backgroundColor: btnColor }}
              transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
            />
          )}
        </motion.button>

        {/* ── Divider ── */}
        <div className="self-stretch mx-2 mb-2" style={{ width: 1, backgroundColor: btnBorder, opacity: 0.5 }} />

        {/* ── Theme toggle ── */}
        <motion.button
          key={`theme-${reanimKey}`}
          title={theme === "dark" ? "Light mode" : "Dark mode"}
          className="flex items-center px-3 py-2"
          style={{ color: muted }}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "tween", ease: [0.22, 1, 0.36, 1], duration: 0.5, delay: 5 * 0.07 }}
          whileHover={{ y: -3, transition: hoverTrans }}
          onClick={toggle}
          onWheel={forwardScroll}
        >
          {theme === "dark" ? <IconSun size={20} /> : <IconMoon size={20} />}
        </motion.button>

        {/* ── Bottom line ── */}
        <div
          className="absolute left-0 right-0 pointer-events-none"
          style={{ bottom: 0, height: 1.5, backgroundColor: btnBorder }}
        />

        {/* ── Triangle shadow ── */}
        <div
          className="absolute left-0 right-0 pointer-events-none"
          style={onHero && isDesktop ? {
            top: -14,
            height: 14,
            background: isLight
              ? "linear-gradient(to top, rgba(0,0,0,0.13) 0%, transparent 100%)"
              : "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)",
            clipPath: "polygon(47% 0%, 53% 0%, 85% 100%, 15% 100%)",
          } : {
            bottom: -14,
            height: 14,
            background: isLight
              ? "linear-gradient(to bottom, rgba(0,0,0,0.13) 0%, transparent 100%)"
              : "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 100%)",
            clipPath: "polygon(15% 0%, 85% 0%, 53% 100%, 47% 100%)",
          }}
        />
      </div>
    </div>
    </>
  );
}

// ─── Mobile Nav ───────────────────────────────────────────────────────────────
function MobileNav() {
  const { theme, toggle } = useTheme();
  const isLight = theme === "light";
  const [activeSection, setActiveSection] = useState("home");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const scrollEl = document.querySelector("main") as HTMLElement | null;
    const onScroll = () => {
      const idx = Math.min(Math.round((scrollEl?.scrollTop ?? 0) / window.innerHeight), 4);
      const found = Object.keys(SECTION_INDEX).find(k => SECTION_INDEX[k] === idx);
      setActiveSection(found ?? "home");
    };
    onScroll();
    scrollEl?.addEventListener("scroll", onScroll, { passive: true });
    return () => scrollEl?.removeEventListener("scroll", onScroll);
  }, [mounted]);

  const navigateTo = (id: string) => {
    const scrollEl = document.querySelector("main") as HTMLElement | null;
    if (!scrollEl) return;
    scrollEl.scrollTo({ top: SECTION_INDEX[id] * scrollEl.clientHeight, behavior: "smooth" });
  };

  if (!mounted) return null;

  const btnColor   = isLight ? "var(--sage-deep)"          : "var(--navy)";
  const muted      = isLight ? "rgba(0,0,0,0.35)"          : "rgba(255,255,255,0.35)";
  const activeBg   = isLight ? "rgba(107,122,86,0.18)"     : "rgba(30,63,122,0.18)";
  const pillBg     = isLight ? "rgba(245,244,240,0.82)"    : "rgba(8,8,18,0.75)";
  const pillBorder = isLight ? "rgba(0,0,0,0.10)"          : "rgba(255,255,255,0.09)";

  const ALL_ITEMS: { id: string; icon: React.ReactNode; label: string }[] = [
    { id: "home",     icon: <HomeNavIcon size={22} isOpen={activeSection === "home"} />, label: "Home"     },
    { id: "projects", icon: <ImagesBadge folderSize={{ width: 24, height: 19 }} />,      label: "Projects" },
    { id: "skills",   icon: <SkillsNavIcon size={22} isOpen={activeSection === "skills"} />, label: "Skills"   },
    { id: "about",    icon: <PersonNavIcon size={22} isActive={activeSection === "about"} />, label: "About"    },
    { id: "contact",  icon: <MailNavIcon   size={22} isOpen={activeSection === "contact"} />, label: "Contact"  },
  ];

  return (
    <div
      className="fixed bottom-4 left-4 right-4 md:hidden flex justify-center pointer-events-none"
      style={{ zIndex: 5000 }}
    >
      <div
        className="flex items-center rounded-full px-2 pointer-events-auto"
        style={{
          backgroundColor: pillBg,
          border: `1px solid ${pillBorder}`,
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        {ALL_ITEMS.map((item) => {
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              disabled={active}
              className="relative flex flex-col items-center justify-center px-3 py-2 rounded-full transition-colors"
              style={{
                color: active ? btnColor : muted,
                backgroundColor: active ? activeBg : "transparent",
                cursor: active ? "default" : "pointer",
                minWidth: 44,
              }}
            >
              <span className="leading-none flex items-center justify-center">{item.icon}</span>
              <span
                className="text-[9px] mt-0.5 font-medium"
                style={{ fontFamily: "var(--font-sub)", letterSpacing: "0.02em" }}
              >
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Divider */}
        <div className="self-stretch my-2 mx-1" style={{ width: 1, backgroundColor: pillBorder }} />

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="flex items-center justify-center px-3 py-2 rounded-full"
          style={{ color: muted, cursor: "pointer", minWidth: 36 }}
        >
          {theme === "dark" ? <IconSun size={16} /> : <IconMoon size={16} />}
        </button>
      </div>
    </div>
  );
}

// ─── Loader ───────────────────────────────────────────────────────────────────
export function PageLoader({ children }: { children?: ReactNode }) {
  const [show,  setShow]  = useState(true);
  const [phase, setPhase] = useState<"wormhole" | "done">("wormhole");
  const rafRef    = useRef<number>(0);
  const startRef  = useRef<number>(0);
  const darkBgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessionStorage.getItem("intro-played")) {
      setShow(false);
    } else {
      sessionStorage.setItem("intro-played", "1");
    }
  }, []);

  const handleDone = () => {
    setPhase("done");
    window.dispatchEvent(new Event("intro-done"));
  };

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
              <WormholeCanvas onDone={handleDone} startRef={startRef} rafRef={rafRef} darkBgRef={darkBgRef} />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {(!show || phase === "done") && (
        <>
          <ScatteredNav />
          <MobileNav />
          <NavTransitionOverlay />
          <SpillOverlay />
        </>
      )}
    </>
  );
}
