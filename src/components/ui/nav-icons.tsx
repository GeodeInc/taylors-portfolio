"use client";

import { useId } from "react";
import { motion } from "framer-motion";

const SHADOW = "0 1px 3px rgba(0,0,0,0.24), 0 1px 2px rgba(0,0,0,0.14)";

// ─── Home — Red Roof + Brick Walls ───────────────────────────────────────────
interface HomeNavIconProps {
  size?: number;
  /** Door swings open when true (hover or on home section) */
  isOpen?: boolean;
}
export function HomeNavIcon({ size = 24, isOpen = false }: HomeNavIconProps) {
  const uid = useId().replace(/:/g, "");
  // All coordinates in a 100×105 viewBox so shapes are precise at any size
  // Wall: y=42 → y=105, Roof chevron peak: y=4, eave: y=50
  // Door: centered arch, teal, with animated panel overlay

  const w = size;
  const h = Math.round(size * 1.05);

  // Door position in px (for the motion.div overlay)
  // In viewBox 100×105: door left=36, top=68, width=28, height=37, archR=14
  const doorX  = Math.round(w * 0.36);
  const doorY  = Math.round(h * (68 / 105));
  const doorW  = Math.round(w * 0.28);
  const doorH  = Math.round(h * (37 / 105));
  const archR  = Math.round(doorW / 2);

  return (
    <div style={{ width: w, height: h, position: "relative", flexShrink: 0 }}>

      {/* SVG: static walls + roof + door arch (no animation) */}
      <svg viewBox="0 0 100 105" width={w} height={h}
        style={{ position: "absolute", inset: 0, display: "block" }}>
        <defs>
          <linearGradient id={`${uid}-roof`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <linearGradient id={`${uid}-wall`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#cc5040" />
            <stop offset="100%" stopColor="#a83028" />
          </linearGradient>
          <linearGradient id={`${uid}-door`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7aaccc" />
            <stop offset="100%" stopColor="#4a7a9a" />
          </linearGradient>
        </defs>

        {/* ── Brick walls ── */}
        <rect x="4" y="42" width="92" height="61" rx="3" fill={`url(#${uid}-wall)`} />
        {/* Horizontal mortar lines */}
        {[52, 62, 72, 82, 92].map(y => (
          <line key={y} x1="4" y1={y} x2="96" y2={y} stroke="#8a2018" strokeWidth="1.2" />
        ))}
        {/* Vertical brick lines — row 1 */}
        {[18, 34, 50, 66, 82].map(x => (
          <line key={`a${x}`} x1={x} y1="42" x2={x} y2="52" stroke="#8a2018" strokeWidth="1.2" />
        ))}
        {/* Vertical brick lines — row 2 (offset) */}
        {[11, 27, 43, 59, 75, 91].map(x => (
          <line key={`b${x}`} x1={x} y1="52" x2={x} y2="62" stroke="#8a2018" strokeWidth="1.2" />
        ))}
        {/* Vertical brick lines — row 3 */}
        {[18, 34, 50, 66, 82].map(x => (
          <line key={`c${x}`} x1={x} y1="62" x2={x} y2="72" stroke="#8a2018" strokeWidth="1.2" />
        ))}
        {/* Vertical brick lines — row 4 (offset) */}
        {[11, 27, 43, 59, 75, 91].map(x => (
          <line key={`d${x}`} x1={x} y1="72" x2={x} y2="82" stroke="#8a2018" strokeWidth="1.2" />
        ))}
        {/* Vertical brick lines — row 5 */}
        {[18, 34, 50, 66, 82].map(x => (
          <line key={`e${x}`} x1={x} y1="82" x2={x} y2="92" stroke="#8a2018" strokeWidth="1.2" />
        ))}
        {/* Vertical brick lines — row 6 (offset) */}
        {[11, 27, 43, 59, 75, 91].map(x => (
          <line key={`f${x}`} x1={x} y1="92" x2={x} y2="103" stroke="#8a2018" strokeWidth="1.2" />
        ))}

        {/* ── Door arch background (dark cutout) ── */}
        <path d="M36,105 L36,75 Q36,61 50,61 Q64,61 64,75 L64,105 Z"
          fill="rgba(0,0,0,0.32)" />

        {/* ── Roof triangle ── */}
        <path d="M50,4 L108,50 L-8,50 Z"
          fill={`url(#${uid}-roof)`}
          filter="drop-shadow(0 2px 3px rgba(0,0,0,0.3))" />
        {/* Ridge highlight */}
        <line x1="42" y1="14" x2="50" y2="6"
          stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
      </svg>

      {/* Animated door panel (div overlay so rotateY works) */}
      <motion.div
        style={{
          position: "absolute",
          left: doorX, top: doorY,
          width: doorW, height: doorH,
          background: "linear-gradient(to bottom, #7aaccc, #4a7a9a)",
          borderRadius: `${archR}px ${archR}px 0 0`,
          transformOrigin: "left center",
          transformStyle: "preserve-3d",
          zIndex: 10,
        }}
        animate={{ rotateY: isOpen ? -68 : 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
      >
        {/* Handle */}
        <div style={{
          position: "absolute",
          left: "50%", transform: "translateX(-50%)",
          top: Math.round(doorH * 0.46),
          width: Math.max(1, Math.round(doorW * 0.12)),
          height: Math.round(doorH * 0.24),
          background: "rgba(255,255,255,0.88)",
          borderRadius: 2,
        }} />
      </motion.div>
    </div>
  );
}

// ─── Skills — Stacked Layers (Navy) ──────────────────────────────────────────
// Three flat diamonds stacked like the Figma/Layers icon, with visible 3D edge.
// Layers spread apart on hover / when active section.
export function SkillsNavIcon({ size = 24, isOpen = false }: { size?: number; isOpen?: boolean }) {
  const w      = size;
  const h      = size;
  const faceH  = Math.max(5, Math.round(w * 0.30));
  const edgeH  = Math.max(2, Math.round(faceH * 0.30));
  const step   = Math.round(faceH * 0.75);
  const totalH = faceH + step * 2;
  const startY = Math.round((h - totalH) / 2);
  const spread = Math.round(faceH * 0.55); // extra offset when open

  const DIAMOND = "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)";
  const spring  = { type: "spring", stiffness: 340, damping: 26 } as const;

  const layers = [
    { face: "linear-gradient(160deg, #4a72c4, #2a5298)", edge: "#1a3a6a", hl: "rgba(160,190,240,0.65)" },
    { face: "linear-gradient(160deg, #3a62b4, #1e4288)", edge: "#142e58", hl: "rgba(140,175,230,0.5)"  },
    { face: "linear-gradient(160deg, #2a5298, #1e3f7a)", edge: "#0e2248", hl: "rgba(120,160,220,0.4)"  },
  ];

  // y offsets: top layer moves up, bottom moves down, middle stays
  const spreadY = [-spread, 0, spread];

  return (
    <div style={{ width: w, height: h, position: "relative", flexShrink: 0 }}>
      {[...layers].reverse().map((layer, ri) => {
        const i    = layers.length - 1 - ri;
        const baseY = startY + i * step;
        return (
          <motion.div
            key={i}
            style={{ position: "absolute", left: 0, width: w, height: faceH + edgeH, zIndex: layers.length - i }}
            animate={{ y: baseY + (isOpen ? spreadY[i] : 0) }}
            transition={spring}
          >
            {/* 3D edge */}
            <div style={{
              position: "absolute", left: 0, top: edgeH,
              width: w, height: faceH,
              background: layer.edge,
              clipPath: DIAMOND,
            }} />
            {/* Face */}
            <div style={{
              position: "absolute", left: 0, top: 0,
              width: w, height: faceH,
              background: layer.face,
              clipPath: DIAMOND,
              boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
            }}>
              <div style={{
                position: "absolute",
                top: Math.round(faceH * 0.22),
                left: Math.round(w * 0.28),
                width: Math.round(w * 0.22),
                height: 1,
                background: layer.hl,
                borderRadius: 1,
                transform: "rotate(-20deg)",
              }} />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── About — Person (Navy) ───────────────────────────────────────────────────
export function PersonNavIcon({ size = 24, isActive = false }: { size?: number; isActive?: boolean }) {
  const w = size;
  const h = size;
  const headR   = Math.round(w * 0.23);
  const headCX  = Math.round(w * 0.50);
  const headCY  = Math.round(h * 0.30);
  const bodyW   = Math.round(w * 0.68);
  const bodyX   = Math.round((w - bodyW) / 2);
  const bodyTop = Math.round(h * 0.52);
  const bodyH   = h - bodyTop;
  const headLift = Math.round(h * 0.18);

  return (
    <div style={{ width: w, height: h, position: "relative", flexShrink: 0 }}>
      {/* Body */}
      <div style={{
        position: "absolute",
        left: bodyX, top: bodyTop,
        width: bodyW, height: bodyH,
        background: "linear-gradient(to bottom, #374151, #1f2937)",
        borderRadius: `${Math.round(bodyW * 0.48)}px ${Math.round(bodyW * 0.48)}px 4px 4px`,
        boxShadow: SHADOW,
      }} />
      {/* Head — lifts up on hover / active section */}
      <motion.div
        style={{
          position: "absolute",
          left: headCX - headR, top: headCY - headR,
          width: headR * 2, height: headR * 2,
          background: "linear-gradient(to bottom, #4b5563, #374151)",
          borderRadius: "50%",
          boxShadow: SHADOW,
        }}
        animate={{ y: isActive ? -headLift : 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 26 }}
      >
        <div style={{
          position: "absolute",
          top: Math.round(headR * 0.22), left: Math.round(headR * 0.22),
          width: Math.round(headR * 0.55), height: Math.round(headR * 0.55),
          background: "rgba(156,163,175,0.4)", borderRadius: "50%",
        }} />
      </motion.div>
    </div>
  );
}

// ─── Contact — Inbox Tray front view (Sage) ──────────────────────────────────
interface MailNavIconProps {
  size?: number;
  /** Letter slides out when true (hover or on contact section) */
  isOpen?: boolean;
}
export function MailNavIcon({ size = 24, isOpen = false }: MailNavIconProps) {
  const w      = size;
  const h      = Math.round(size * 0.80);
  // Top 42% = open slot (dark inner back wall visible)
  // Bottom 58% = solid front face of the tray
  const slotH  = Math.round(h * 0.42);
  const faceH  = h - slotH;

  // Letter sits in the slot; taller than the slot so front face masks the bottom
  const letterW = Math.round(w * 0.58);
  const letterH = Math.round(slotH * 1.65);
  const letterX = Math.round((w - letterW) / 2);
  const letterClosedY = Math.round(slotH * 0.06);
  const letterOpenDY  = -Math.round(slotH * 1.45);

  const sageFace = "linear-gradient(160deg, #8fb894 0%, #5c8862 100%)";
  const sageSlot = "#3d6045";
  const spring   = { type: "spring", stiffness: 340, damping: 26 } as const;

  return (
    <div style={{
      width: w, height: h,
      position: "relative", flexShrink: 0, overflow: "visible",
      borderRadius: 4,
      boxShadow: `${SHADOW}, inset 0 0 0 1px rgba(61,96,69,0.30)`,
    }}>

      {/* Slot interior — dark back wall visible through the opening */}
      <div style={{
        position: "absolute", left: 0, top: 0,
        width: w, height: slotH,
        background: sageSlot,
        borderRadius: "4px 4px 0 0",
        zIndex: 1,
      }} />

      {/* Letter — springs up out of the slot */}
      <motion.div
        style={{
          position: "absolute",
          left: letterX, top: letterClosedY,
          width: letterW, height: letterH,
          background: "linear-gradient(to bottom, #f5f9f5, #ddeedd)",
          borderRadius: 2,
          boxShadow: "0 1px 4px rgba(0,0,0,0.22)",
          zIndex: 2,
        }}
        animate={{ y: isOpen ? letterOpenDY : 0 }}
        transition={spring}
      >
        {[0.24, 0.46, 0.67].map(frac => (
          <div key={frac} style={{
            position: "absolute",
            left: Math.round(letterW * 0.15),
            right: Math.round(letterW * 0.15),
            top: Math.round(letterH * frac),
            height: 1,
            background: "rgba(61,96,69,0.28)",
            borderRadius: 1,
          }} />
        ))}
      </motion.div>

      {/* Front face — solid tray body, masks the letter bottom when inside */}
      <div style={{
        position: "absolute", left: 0, top: slotH,
        width: w, height: faceH,
        background: sageFace,
        borderRadius: "0 0 4px 4px",
        zIndex: 3,
      }}>
        {/* Rim highlight line where slot meets front face */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: 1, background: "rgba(200,230,200,0.60)",
        }} />
      </div>
    </div>
  );
}
