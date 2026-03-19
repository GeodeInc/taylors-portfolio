"use client";

import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import * as THREE from "three";

// Phase 1: 0–2s  burst (exponential accel)
// Phase 2: 2–3s  slowdown + page fades in
// Phase 3: 3–6s  particles fade out over page
const CANVAS_DURATION = 4500;
const PAUSE_START = 2000 / CANVAS_DURATION; // 0.333
const PAUSE_END   = 3000 / CANVAS_DURATION; // 0.500

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
  const [show,  setShow]  = useState(false);
  const [phase, setPhase] = useState<"wormhole" | "done">("wormhole");
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const darkBgRef  = useRef<HTMLDivElement>(null);
  const rafRef     = useRef<number>(0);
  const startRef   = useRef<number>(0);

  useEffect(() => {
    if (!sessionStorage.getItem("intro-played")) {
      setShow(true);
      sessionStorage.setItem("intro-played", "1");
    }
  }, []);

  useEffect(() => {
    if (!show || phase !== "wormhole") return;

    const canvas = canvasRef.current;
    const darkBg = darkBgRef.current;
    if (!canvas || !darkBg) return;

    let alive = true;
    const W = window.innerWidth;
    const H = window.innerHeight;

    // ── Renderer (alpha:true → transparent canvas bg) ─────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0); // transparent — darkBg div handles background

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 300);
    camera.position.z = 0;

    // ── CSS colors ────────────────────────────────────────────────────
    const navyHex     = getComputedStyle(document.documentElement).getPropertyValue("--navy").trim();
    const navyDarkHex = getComputedStyle(document.documentElement).getPropertyValue("--navy-dark").trim();
    const navyColor     = new THREE.Color(navyHex);
    const navyDarkColor = new THREE.Color(navyDarkHex);

    // Soft circular sprite
    const sp = document.createElement("canvas");
    sp.width = sp.height = 64;
    const spCtx = sp.getContext("2d")!;
    const grd = spCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    const nr = Math.round(navyColor.r * 255);
    const ng = Math.round(navyColor.g * 255);
    const nb = Math.round(navyColor.b * 255);
    grd.addColorStop(0,   `rgba(${nr},${ng},${nb},1)`);
    grd.addColorStop(0.5, `rgba(${nr},${ng},${nb},0.7)`);
    grd.addColorStop(1,   `rgba(${nr},${ng},${nb},0)`);
    spCtx.fillStyle = grd;
    spCtx.fillRect(0, 0, 64, 64);
    const spriteTex = new THREE.CanvasTexture(sp);

    // ── Main stars ────────────────────────────────────────────────────
    const N = 3000;
    const positions = new Float32Array(N * 3);
    const speeds    = new Float32Array(N);
    let   curProg   = 0;
    const tanHFov   = Math.tan((75 / 2) * Math.PI / 180);
    const aspect    = W / H;

    const initStar = (i: number, randomZ = true) => {
      if (curProg >= PAUSE_START) {
        // During pause: spawn close, within frustum
        const z  = -(1 + Math.random() * 10);
        const hw = Math.abs(z) * tanHFov;
        const hh = hw / aspect;
        positions[i*3]     = (Math.random()*2-1) * hw;
        positions[i*3 + 1] = (Math.random()*2-1) * hh;
        positions[i*3 + 2] = z;
      } else {
        const angle = Math.random() * Math.PI * 2;
        const r     = Math.sqrt(Math.random()) * 110;
        positions[i*3]     = Math.cos(angle) * r;
        positions[i*3 + 1] = Math.sin(angle) * r;
        positions[i*3 + 2] = randomZ ? -Math.random() * 180 : -180;
      }
      speeds[i] = 0.25 + Math.random() * 0.75;
    };

    for (let i = 0; i < N; i++) initStar(i, true);

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const starMat = new THREE.PointsMaterial({
      color: navyColor, map: spriteTex, size: 0.22,
      sizeAttenuation: true, transparent: true, opacity: 1,
      depthWrite: false, alphaTest: 0.01, blending: THREE.AdditiveBlending,
    });
    scene.add(new THREE.Points(starGeo, starMat));

    // Trail lines
    const trailPos = new Float32Array(N * 6);
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute("position", new THREE.BufferAttribute(trailPos, 3));
    const trailMat = new THREE.LineBasicMaterial({
      color: navyDarkColor, transparent: true, opacity: 0.5,
      depthWrite: false, blending: THREE.AdditiveBlending,
    });
    scene.add(new THREE.LineSegments(trailGeo, trailMat));

    // ── Fog particles ─────────────────────────────────────────────────
    const N_FOG  = 500;
    const fogPos    = new Float32Array(N_FOG * 3);
    const fogSpeeds = new Float32Array(N_FOG);

    const initFog = (i: number) => {
      const z  = -(3 + Math.random() * 5);
      const hw = Math.abs(z) * tanHFov;
      const hh = hw / aspect;
      fogPos[i*3]     = (Math.random()*2-1) * hw;
      fogPos[i*3 + 1] = (Math.random()*2-1) * hh;
      fogPos[i*3 + 2] = z;
      fogSpeeds[i] = 0.003 + Math.random() * 0.006;
    };
    for (let i = 0; i < N_FOG; i++) initFog(i);

    const fogGeo = new THREE.BufferGeometry();
    fogGeo.setAttribute("position", new THREE.BufferAttribute(fogPos, 3));
    const fogMat = new THREE.PointsMaterial({
      color: navyColor, map: spriteTex, size: 0.22,
      sizeAttenuation: true, transparent: true, opacity: 0,
      depthWrite: false, alphaTest: 0.01, blending: THREE.NormalBlending,
    });
    scene.add(new THREE.Points(fogGeo, fogMat));

    // ── Resize ────────────────────────────────────────────────────────
    const onResize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    // ── Draw loop ─────────────────────────────────────────────────────
    startRef.current = performance.now();

    const draw = (now: number) => {
      if (!alive) return;

      const elapsed  = now - startRef.current;
      const progress = Math.min(elapsed / CANVAS_DURATION, 1);
      curProg = progress;

      // ── Speed ──────────────────────────────────────────────────────
      let speedMult: number;
      if (progress < PAUSE_START) {
        speedMult = Math.pow(18, progress / PAUSE_START);           // 1× → 18×
      } else if (progress < PAUSE_END) {
        const t = (progress - PAUSE_START) / (PAUSE_END - PAUSE_START);
        speedMult = Math.pow(13.5, 1 - t) * Math.pow(0.025, t);     // 13.5× → 0.025×
      } else {
        speedMult = 0.025;
      }

      // ── Dark background opacity (div) ──────────────────────────────
      // Phase 1: fully dark | Phase 2: fades with slowdown | Phase 3: gone
      if (progress < PAUSE_START) {
        darkBg.style.opacity = "1";
      } else if (progress < PAUSE_END) {
        const t = (progress - PAUSE_START) / (PAUSE_END - PAUSE_START);
        darkBg.style.opacity = String(Math.pow(9, 1-t) * Math.pow(0.025, t) / 9);
      } else {
        darkBg.style.opacity = "0";
      }

      // ── Particle opacities (independent of background) ────────────
      // Stars: full through phase 2, then smooth long fade in phase 3
      const starAlpha =
        progress < PAUSE_END
          ? 1
          : Math.pow(1 - (progress - PAUSE_END) / (1 - PAUSE_END), 0.55);
      starMat.opacity  = starAlpha;
      trailMat.opacity = starAlpha * 0.45;

      // Fog: fades in during slowdown, then fades out slowly with stars
      let fogAlpha: number;
      if (progress < PAUSE_START) {
        fogAlpha = 0;
      } else if (progress < PAUSE_END) {
        fogAlpha = ((progress - PAUSE_START) / (PAUSE_END - PAUSE_START)) * 0.38;
      } else {
        const t = (progress - PAUSE_END) / (1 - PAUSE_END);
        fogAlpha = 0.38 * Math.pow(1 - t, 0.55);
      }
      fogMat.opacity = fogAlpha;

      // ── Update stars ───────────────────────────────────────────────
      for (let i = 0; i < N; i++) {
        const idx  = i * 3;
        const tidx = i * 6;
        const dx   = speeds[i] * speedMult;
        const tailZ = positions[idx+2] - dx * 12;

        trailPos[tidx]     = positions[idx];
        trailPos[tidx + 1] = positions[idx+1];
        trailPos[tidx + 2] = tailZ;
        trailPos[tidx + 3] = positions[idx];
        trailPos[tidx + 4] = positions[idx+1];
        trailPos[tidx + 5] = positions[idx+2];

        positions[idx+2] += dx;

        if (positions[idx+2] > 2) {
          initStar(i, false);
          trailPos[tidx+2] = positions[idx+2];
          trailPos[tidx+5] = positions[idx+2];
        }
      }

      // ── Update fog ─────────────────────────────────────────────────
      for (let i = 0; i < N_FOG; i++) {
        fogPos[i*3+2] += fogSpeeds[i];
        if (fogPos[i*3+2] > 2) initFog(i);
      }

      starGeo.attributes.position.needsUpdate  = true;
      trailGeo.attributes.position.needsUpdate = true;
      fogGeo.attributes.position.needsUpdate   = true;

      renderer.render(scene, camera);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(draw);
      } else {
        if (alive) setPhase("done");
        renderer.dispose();
      }
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      alive = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    };
  }, [show, phase]);

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
              {/* Dark background: fades out as page reveals */}
              <div
                ref={darkBgRef}
                className="absolute inset-0"
                style={{ backgroundColor: "#000005" }}
              />
              {/* Transparent canvas: only particles, no dark bg fighting fades */}
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {(!show || phase === "done") && <ScatteredNav />}

      <button
        onClick={() => { sessionStorage.removeItem("intro-played"); window.location.reload(); }}
        className="fixed top-4 right-4 z-[10001] rounded-full border border-white/20 px-4 py-1.5 text-xs text-white/50 hover:text-white hover:border-white/40 transition-colors"
      >
        replay
      </button>
    </>
  );
}
