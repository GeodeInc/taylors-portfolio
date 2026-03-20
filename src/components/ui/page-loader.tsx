"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { IconHome2, IconUser, IconCode, IconMail } from "@tabler/icons-react";
import { ImagesBadge } from "@/components/ui/images-badge";

const WormholeCanvas = dynamic(() => import("./wormhole-canvas"), { ssr: false });

const NAV_ICONS = [
  { id: "home",    icon: <IconHome2 size={24} />, label: "Home"    },
  { id: "about",   icon: <IconUser size={24} />,  label: "About"   },
  { id: "skills",  icon: <IconCode size={24} />,  label: "Skills"  },
  { id: "contact", icon: <IconMail size={24} />,  label: "Contact" },
];

const PROJECT_PREVIEWS = [
  "/preview/tenzor",
  "/preview/pos",
  "/preview/color",
  "/preview/reflection",
];


const SECTION_NAMES: Record<string, string> = {
  home: "Home", about: "About", skills: "Skills", projects: "Projects", contact: "Contact",
};

const SECTION_INDEX: Record<string, number> = {
  home: 0, about: 1, skills: 2, projects: 3, contact: 4,
};

const SECTION_ORDER = ["home", "about", "skills", "projects", "contact"];

const SECTION_URLS: Record<string, string> = {
  home:     "/preview/home",
  about:    "/preview/about",
  skills:   "/preview/skills",
  projects: "/preview/projects",
  contact:  "/preview/contact",
};

// Static screenshots used only for the expand-to-fullscreen phase
const SECTION_PREVIEWS: Record<string, string> = {
  home:     "/preview_home.png",
  about:    "/preview_about.png",
  skills:   "/preview_skills.png",
  projects: "/preview_projects.png",
  contact:  "/preview_contact.png",
};

const STAGGER   = 18; // px vertical offset per card depth
const X_STAGGER = 30; // px horizontal offset per card depth (stagger right)

// ─── Overlay — completely independent, listens for custom events ──────────────
function NavTransitionOverlay() {
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

  const clearAll = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  const sched = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  };

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

      // Phase 1: source iframe fills full screen, then shrinks to card size
      containerAnim.set({ width: window.innerWidth, height: window.innerHeight });
      setPhase("shrinking");
      containerAnim.start({
        width: 480, height: 300,
        transition: { duration: 1.1, ease: [0.4, 0, 0.15, 1] },
      }).then(() => {
        // Phase 2: card lift/swap animation
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

        // Phase 3: expand to full screen
        sched(() => setPhase("expanding"), EXPAND_DELAY);
      });
    };

    window.addEventListener("nav-transition", handler);
    return () => window.removeEventListener("nav-transition", handler);
  }, [containerAnim]);

  // Drive expanding animation
  useEffect(() => {
    if (phase !== "expanding") return;
    clearAll();
    const expandW = vp.w || window.innerWidth;
    const expandH = vp.h || window.innerHeight;
    containerAnim.start({
      width: expandW, height: expandH,
      transition: { duration: 2.5, ease: [0.4, 0, 0.15, 1] },
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
      {/* Solid black backdrop — fades out when expanding */}
      <motion.div
        className="absolute inset-0 bg-black pointer-events-none"
        animate={{ opacity: expanding ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* Card stack container — driven by useAnimation */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ perspective: "1400px" }}>
        <motion.div
          animate={containerAnim}
          style={{
            position: "relative",
            overflow: (expanding || shrinking) ? "hidden" : "visible",
            pointerEvents: "none",
            rotateX: shrinking ? 0 : expanding ? 0 : "4deg",
            rotateY: shrinking ? 0 : expanding ? 0 : "-6deg",
            filter: "none",
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
                className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
                style={{
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
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{ border: "1px solid var(--navy)", zIndex: 10 }}
                    animate={expanding && isTarget ? { opacity: 0 } : { opacity: 1 }}
                    transition={{ duration: 0.8, delay: expanding && isTarget ? 1.7 : 0 }}
                  />
                )}
                <iframe
                  src={SECTION_URLS[section]}
                  title={section}
                  className="w-full h-full border-0"
                  style={{ pointerEvents: "none" }}
                  scrolling="no"
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Labels — one per card, always visible during animating phase */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{ opacity: (expanding || shrinking) ? 0 : 1 }}
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
  const [mounted, setMounted] = useState(false);
  const [onHero, setOnHero] = useState(true);
  const [activeSection, setActiveSection] = useState("home");
  const [reanimKey, setReanimKey] = useState(0);
  const navRef = useRef<HTMLDivElement>(null);
  const previewsOpen = useRef(false);
  const closePreviewsRef = useRef<(() => void) | null>(null);
  const scrollingRef = useRef(false);
  const wheelAccum = useRef(0);

  useEffect(() => { setMounted(true); }, []);

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
      const heroOffset = height * 0.72 - 56;
      const ratio = Math.min(scrollTop / height, 1);
      const translateY = heroOffset * (1 - ratio);
      if (navRef.current) navRef.current.style.transform = `translateY(${translateY}px)`;
      setOnHero(scrollTop < height * 0.5);
      const sectionIdx = Math.min(Math.round(scrollTop / height), 4);
      const found = Object.keys(SECTION_INDEX).find(k => SECTION_INDEX[k] === sectionIdx);
      setActiveSection(found ?? "home");
    };
    onScroll();
    const target = scrollEl ?? window;
    target.addEventListener("scroll", onScroll, { passive: true });
    return () => target.removeEventListener("scroll", onScroll);
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

  return (
    <div
      ref={navRef}
      className="fixed top-14 right-4 md:right-0 md:left-0 md:justify-center z-[5000] flex items-center gap-2 pointer-events-none"
      style={{ willChange: "transform" }}
    >
      {NAV_ICONS.map((item, i) => (
        <motion.button
          key={`${item.id}-${reanimKey}`}
          title={item.label}
          disabled={activeSection === item.id}
          className="relative flex items-center justify-center rounded-full border w-14 h-14 pointer-events-auto overflow-hidden"
          style={{ borderColor: "var(--navy-border)", backgroundColor: "#000000", color: "var(--navy)", cursor: activeSection === item.id ? "default" : "pointer" }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "tween", ease: [0.22, 1, 0.36, 1], duration: 0.6, delay: i * 0.08 }}
          whileHover={activeSection === item.id ? {} : { y: -3, scale: 1.07, transition: { type: "spring", stiffness: 200, damping: 18 } }}
          onClick={() => navigateTo(item.id)}
          onWheel={forwardScroll}
        >
          {activeSection === item.id && (
            <motion.div
              layoutId="nav-active-pill"
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: "var(--navy-fill-md)" }}
              transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
            />
          )}
          <span className="relative z-10">{item.icon}</span>
        </motion.button>
      ))}

      <motion.button
        key={`projects-${reanimKey}`}
        title="Projects"
        disabled={activeSection === "projects"}
        className="relative flex items-center justify-center rounded-full border w-14 h-14 pointer-events-auto"
        style={{ borderColor: "var(--navy-border)", backgroundColor: "#000000", color: "var(--navy)", zIndex: 5001, cursor: activeSection === "projects" ? "default" : "pointer" }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "tween", ease: [0.22, 1, 0.36, 1], duration: 0.6, delay: 4 * 0.08 }}
        whileHover={activeSection === "projects" ? {} : { y: -3, scale: 1.07, transition: { type: "spring", stiffness: 200, damping: 18 } }}
        onClick={() => navigateTo("projects")}
        onWheel={forwardScroll}
      >
        {activeSection === "projects" && (
          <motion.div
            layoutId="nav-active-pill"
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: "var(--navy-fill-md)" }}
            transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
          />
        )}
        <span className="relative z-10">
          <ImagesBadge
            iframes={PROJECT_PREVIEWS}
            folderSize={{ width: 28, height: 22 }}
            hoverImageSize={{ width: 150, height: 100 }}
            hoverSpread={100}
            hoverRotation={14}
            hoverOffsetY={64}
            direction={onHero ? "up" : "down"}
            onOpenChange={(open) => { previewsOpen.current = open; }}
            closeRef={closePreviewsRef}
          />
        </span>
      </motion.button>
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
