"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface SvgMaskEffectProps {
  children: React.ReactNode;
  revealChildren: React.ReactNode;
  revealSize?: number;
  className?: string;
  /** ms to wait before showing circle — lets Framer Motion entry animations settle. */
  delay?: number;
  /** When false the circle is hidden regardless of cursor position. */
  enabled?: boolean;
  /** If provided, the circle only appears when the cursor is over this element instead of the whole container. */
  triggerRef?: React.RefObject<HTMLElement | null>;
}

export const SvgMaskEffect = ({
  children,
  revealChildren,
  revealSize = 120,
  className = "",
  delay = 900,
  enabled = true,
  triggerRef,
}: SvgMaskEffectProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const revealRef    = useRef<HTMLDivElement>(null);
  const smooth       = useRef({ x: -9999, y: -9999 });
  const target       = useRef({ x: -9999, y: -9999 });
  const smoothSize   = useRef(0);
  const rafRef       = useRef<number>(0);
  const inside       = useRef(false);
  const ready        = useRef(false);
  const enabledRef   = useRef(enabled);

  // Keep enabledRef in sync so the rAF loop always reads the current value
  useEffect(() => { enabledRef.current = enabled; }, [enabled]);

  // Portal needs document — mount client-side only
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const reveal = revealRef.current;
    if (!reveal) return;

    smooth.current = { x: -9999, y: -9999 };
    target.current = { x: -9999, y: -9999 };
    smoothSize.current = 0;

    const timer = setTimeout(() => { ready.current = true; }, delay);

    const onMove = (e: MouseEvent) => {
      const el = triggerRef ? triggerRef.current : containerRef.current;
      const rect = el?.getBoundingClientRect();
      if (!rect) return;
      inside.current =
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top  && e.clientY <= rect.bottom;
      target.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove);

    const loop = () => {
      smooth.current.x += (target.current.x - smooth.current.x) * 0.12;
      smooth.current.y += (target.current.y - smooth.current.y) * 0.12;
      const targetSize = (inside.current && ready.current && enabledRef.current) ? revealSize : 0;
      // Ease in fast (0.18), ease out slower (0.08) for a lingering shrink effect
      const lerpFactor = smoothSize.current < targetSize ? 0.18 : 0.08;
      smoothSize.current += (targetSize - smoothSize.current) * lerpFactor;
      const sz = Math.round(smoothSize.current * 10) / 10;
      reveal.style.clipPath = `circle(${sz}px at ${smooth.current.x}px ${smooth.current.y}px)`;
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [revealSize, delay, mounted]);

  const revealLayer = (
    // svg-mask-reveal CSS class sets initial clip-path (hidden) so React's style prop never
    // owns clipPath — JS writes from the rAF loop are never reset by React re-renders.
    // z-5001 is global (portal escapes hero's z-1 stacking context) → above nav/GeodeBrand.
    <div
      ref={revealRef}
      className="svg-mask-reveal pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 5001 }}
    >
      {revealChildren}
    </div>
  );

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {children}
      {/* Portal into document.body — escapes sticky z-[1] stacking context so
          z-5001 competes globally with nav (z-5000) and shows above it */}
      {mounted && createPortal(revealLayer, document.body)}
    </div>
  );
};
