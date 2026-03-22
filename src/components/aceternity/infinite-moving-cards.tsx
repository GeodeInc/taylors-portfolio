"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}: {
  items: {
    name: string;
    icon?: React.ReactNode;
    color?: string;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [start, setStart] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    addAnimation();
  }, []);

  // Pause animation when the row is scrolled out of view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      Array.from(scrollerRef.current.children).forEach((item) => {
        scrollerRef.current!.appendChild(item.cloneNode(true));
      });

      if (direction === "left") {
        containerRef.current.style.setProperty("--animation-direction", "forwards");
      } else {
        containerRef.current.style.setProperty("--animation-direction", "reverse");
      }

      const durations = { fast: "20s", normal: "40s", slow: "80s" };
      containerRef.current.style.setProperty("--animation-duration", durations[speed]);

      setStart(true);
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
        className,
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex w-max min-w-full shrink-0 flex-nowrap gap-4 py-4",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]",
        )}
        style={start ? { animationPlayState: visible ? "running" : "paused" } : undefined}
      >
        {items.map((item, idx) => (
          <li
            className="relative w-[180px] max-w-full flex-shrink-0 rounded-2xl border border-white/[0.1] bg-gradient-to-b from-white/[0.08] to-white/[0.02] px-6 py-4 backdrop-blur-sm"
            key={item.name + idx}
          >
            <div className="flex items-center gap-3">
              {item.icon && (
                <span className="text-2xl" style={{ color: item.color }}>
                  {item.icon}
                </span>
              )}
              <span className="text-sm font-medium text-white/80">{item.name}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
