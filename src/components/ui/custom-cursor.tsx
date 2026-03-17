"use client";
import { useEffect, useRef, useState } from "react";

export const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });
  const [hovering, setHovering] = useState(false);
  const animId = useRef<number>(0);

  useEffect(() => {
    // hide on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      setHovering(!!t.closest("a, button, [role='button']"));
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);

    const animate = () => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%)`;
      }
      animId.current = requestAnimationFrame(animate);
    };

    animId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(animId.current);
    };
  }, []);

  return (
    <>
      {/* Inner dot */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-2 w-2 rounded-full transition-transform duration-75"
        style={{
          backgroundColor: "var(--navy)",
          boxShadow: "0 0 6px var(--navy)",
          willChange: "transform",
        }}
      />
      {/* Outer ring */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[9998] rounded-full border transition-all duration-200"
        style={{
          width: hovering ? "48px" : "32px",
          height: hovering ? "48px" : "32px",
          borderColor: hovering ? "var(--sage)" : "var(--navy)",
          opacity: hovering ? 0.7 : 0.4,
          boxShadow: hovering ? "0 0 12px var(--sage)" : "0 0 8px var(--navy)",
          willChange: "transform",
        }}
      />
    </>
  );
};
