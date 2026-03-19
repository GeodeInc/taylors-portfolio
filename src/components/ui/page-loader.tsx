"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

const WormholeCanvas = dynamic(() => import("./wormhole-canvas"), { ssr: false });

const NAV_TAGS = [
  { id: "home",     label: "Home"     },
  { id: "about",    label: "About"    },
  { id: "skills",   label: "Skills"   },
  { id: "projects", label: "Projects" },
  { id: "contact",  label: "Contact"  },
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
      className="fixed top-7 right-4 md:top-5 md:right-0 md:left-0 md:justify-center z-[5000] flex items-center gap-1 sm:gap-2 pointer-events-auto"
    >
      {NAV_TAGS.map((tag, i) => (
        <motion.a
          key={tag.id}
          href={`#${tag.id}`}
          className="rounded-full border px-3 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-medium whitespace-nowrap"
          style={{
            fontFamily: "var(--font-sub)",
            borderColor: "var(--navy-border)",
            backgroundColor: "#000000",
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
  const [show,  setShow]  = useState(true);
  const [phase, setPhase] = useState<"wormhole" | "done">("wormhole");
  const rafRef   = useRef<number>(0);
  const startRef = useRef<number>(0);
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

      {(!show || phase === "done") && <ScatteredNav />}

    </>
  );
}
