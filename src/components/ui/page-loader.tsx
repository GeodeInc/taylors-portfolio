"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, MotionConfig, motion, useAnimation } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { ImagesBadge } from "@/components/ui/images-badge";
import { useTheme } from "@/contexts/theme-context";
import { PreviewModeContext } from "@/contexts/preview-mode-context";
import { HeroSection } from "@/components/sections/hero-section";
import { AboutSection } from "@/components/sections/about-section";
import { SkillsSection } from "@/components/sections/skills-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { ContactSection } from "@/components/sections/contact-section";

const WormholeCanvas = dynamic(() => import("./wormhole-canvas"), { ssr: false });

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

const NAV_ICONS = [
  { id: "home",    icon: <span className="text-base md:text-xl leading-none">🏠</span>, label: "Home"     },
  { id: "skills",  icon: <span className="text-base md:text-xl leading-none">⚡</span>, label: "Skills"   },
  { id: "about",   icon: <span className="text-base md:text-xl leading-none">🙋</span>, label: "About"    },
  { id: "contact", icon: <span className="text-base md:text-xl leading-none">✉️</span>, label: "Contact"  },
];

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
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{
                  backgroundColor: overlayBg,
                  borderRadius: expanding && isTarget ? 0 : "1rem",
                  boxShadow: shrinking ? "none" : `0 10px 32px rgba(74,96,128,${Math.max(0, 0.35 - prePos * 0.06)}), 0 50px 100px rgba(0,0,0,0.65)`,
                  zIndex: shrinking ? (isSource ? 5 : 1) : (swapped ? postZ : preZ),
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
                {(!shrinking || isSource) && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{ border: "1px solid var(--navy)", borderRadius: "1rem", zIndex: 10 }}
                    animate={expanding && isTarget ? { opacity: 0 } : { opacity: 1 }}
                    transition={{ duration: 0.25, delay: 0 }}
                  />
                )}
                {show && (
                  (shrinking  && prePos === 0) ||
                  (phase === "animating" && prePos <= 1) ||
                  (expanding  && isTarget)
                ) && <SectionPreview section={section} />}
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Labels — one per card, always visible during animating phase */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        <div className="relative" style={{ width: 480, height: 300, overflow: "visible" }}>
          {SECTION_ORDER.map((section) => {
            const pos = (swapped ? postOrder : preOrder).indexOf(section);
            const x   =  pos * X_STAGGER;
            const y   = -pos * STAGGER - 22;
            return (
              <motion.div
                key={section}
                className="absolute"
                style={{ top: 0, left: 0, zIndex: 10 - pos }}
                animate={{ x, y, opacity: 1 }}
                transition={{ duration: show ? slideDur : 0, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="text-white/60 text-xs font-medium" style={{ fontFamily: "var(--font-sans)" }}>
                  {SECTION_NAMES[section]}
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
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
  const navRef = useRef<HTMLDivElement>(null);
  const previewsOpen = useRef(false);
  const closePreviewsRef = useRef<(() => void) | null>(null);
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
    window.dispatchEvent(new CustomEvent("nav-transition", { detail: { target: id, source: activeSection } }));
    setTimeout(() => {
      const scrollEl = document.querySelector("main") as HTMLElement | null;
      if (scrollEl) scrollEl.scrollTo({ top: SECTION_INDEX[id] * scrollEl.clientHeight });
    }, 100);
  };

  const forwardScroll = (e: React.WheelEvent) => {
    const main = document.querySelector("main") as HTMLElement | null;
    if (main) main.scrollTop += e.deltaY;
  };

  const hoverTrans = { type: "spring", stiffness: 300, damping: 22 } as const;

  return (
    <div
      ref={navRef}
      className="fixed top-4 right-2 md:right-0 md:inset-x-0 md:justify-center flex pointer-events-none"
      style={{ willChange: "transform", zIndex: folderHovered ? 6001 : 5000 }}
    >
      <div className="relative flex items-end pointer-events-auto">
        {/* ── Home ── */}
        {NAV_ICONS.slice(0, 1).map((item, i) => (
          <motion.button
            key={`${item.id}-${reanimKey}`}
            title={item.label}
            disabled={activeSection === item.id}
            className="relative flex flex-col items-center px-2 md:px-4 py-2"
            style={{ color: activeSection === item.id ? btnColor : muted, cursor: activeSection === item.id ? "default" : "pointer" }}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "tween", ease: [0.22, 1, 0.36, 1], duration: 0.5, delay: i * 0.07 }}
            whileHover={activeSection === item.id ? {} : { y: -3, transition: hoverTrans }}
            onClick={() => navigateTo(item.id)}
            onWheel={forwardScroll}
          >
            {item.icon}
            {activeSection === item.id && (
              <motion.div
                layoutId="nav-underline"
                className="absolute -bottom-px left-0 right-0 h-[2px] rounded-full"
                style={{ backgroundColor: btnColor }}
                transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
              />
            )}
          </motion.button>
        ))}

        {/* ── Projects ── */}
        <motion.button
          key={`projects-${reanimKey}`}
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

        {/* ── Skills, About, Contact ── */}
        {NAV_ICONS.slice(1).map((item, i) => (
          <motion.button
            key={`${item.id}-${reanimKey}`}
            title={item.label}
            disabled={activeSection === item.id}
            className="relative flex flex-col items-center px-2 md:px-4 py-2"
            style={{ color: activeSection === item.id ? btnColor : muted, cursor: activeSection === item.id ? "default" : "pointer" }}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "tween", ease: [0.22, 1, 0.36, 1], duration: 0.5, delay: (i + 2) * 0.07 }}
            whileHover={activeSection === item.id ? {} : { y: -3, transition: hoverTrans }}
            onClick={() => navigateTo(item.id)}
            onWheel={forwardScroll}
          >
            {item.icon}
            {activeSection === item.id && (
              <motion.div
                layoutId="nav-underline"
                className="absolute -bottom-px left-0 right-0 h-[2px] rounded-full"
                style={{ backgroundColor: btnColor }}
                transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
              />
            )}
          </motion.button>
        ))}

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
          <NavTransitionOverlay />
        </>
      )}
    </>
  );
}
