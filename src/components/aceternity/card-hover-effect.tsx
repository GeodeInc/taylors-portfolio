"use client";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const SAGE      = "#889672";
const SAGE_DARK = "#8a9170";

export const HoverEffect = ({
  items,
  className,
}: {
  items: {
    title: string;
    description: string;
    link?: string;
    icon?: React.ReactNode;
    tags?: string[];
  }[];
  className?: string;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className={cn("grid grid-cols-1 py-10 md:grid-cols-2 lg:grid-cols-3", className)}>
      {items.map((item, idx) => (
        <div
          key={item.title + idx}
          className="group relative block h-full w-full p-2"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 block h-full w-full rounded-3xl"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.15 } }}
                exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.2 } }}
                style={{ backgroundColor: "rgba(136,150,114,0.07)" }}
              />
            )}
          </AnimatePresence>
          <div className="relative z-20 h-full w-full overflow-hidden rounded-2xl p-6 backdrop-blur-sm transition-all duration-300"
            style={{ border: "1px solid rgba(255,255,255,0.05)", backgroundColor: "rgba(255,255,255,0.02)" }}>
            <div className="relative z-50">
              <div className="mb-4 flex items-center gap-3">
                {item.icon && (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: "rgba(136,150,114,0.12)", color: SAGE }}>
                    {item.icon}
                  </div>
                )}
                <h4 className="font-bold tracking-wide text-zinc-100">{item.title}</h4>
              </div>
              <p className="mt-2 text-sm leading-relaxed tracking-wide text-zinc-500">{item.description}</p>
              {item.tags && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span key={tag} className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{ border: "1px solid rgba(136,150,114,0.22)", backgroundColor: "rgba(136,150,114,0.07)", color: SAGE }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
