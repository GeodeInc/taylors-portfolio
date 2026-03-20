"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ImagesBadgeProps {
  iframes?: string[];
  images?: string[];
  className?: string;
  folderSize?: { width: number; height: number };
  hoverImageSize?: { width: number; height: number };
  hoverSpread?: number;
  hoverRotation?: number;
  hoverOffsetY?: number;
  direction?: "up" | "down";
  onOpenChange?: (open: boolean) => void;
  closeRef?: React.MutableRefObject<(() => void) | null>;
}

export function ImagesBadge({
  iframes = [],
  images = [],
  className,
  folderSize = { width: 28, height: 22 },
  hoverImageSize = { width: 150, height: 100 },
  hoverSpread = 100,
  hoverRotation = 14,
  hoverOffsetY = 60,
  direction = "down",
  onOpenChange,
  closeRef,
}: ImagesBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const srcs = iframes.length > 0 ? iframes : images;
  const displaySrcs = srcs.slice(0, 4);
  const useIframes = iframes.length > 0;

  const tabWidth = folderSize.width * 0.375;
  const tabHeight = folderSize.height * 0.25;

  const close = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setIsHovered(false);
    setActiveIndex(null);
    onOpenChange?.(false);
  };

  const open = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setIsHovered(true);
    onOpenChange?.(true);
  };
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => {
      setIsHovered(false);
      setActiveIndex(null);
      onOpenChange?.(false);
    }, 400);
  };

  if (closeRef) closeRef.current = close;

  const sign = direction === "up" ? -1 : 1;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      onMouseEnter={open}
      onMouseLeave={scheduleClose}
      onWheel={close}
    >
      {/* Floating previews */}
      {displaySrcs.map((src, index) => {
        const total = displaySrcs.length;
        const center = (total - 1) / 2;
        const rotation = (index - center) * hoverRotation;
        const offsetX = (index - center) * hoverSpread;
        const isActive = activeIndex === index;
        const baseZ = 6000 + index;
        const z = isActive ? 6010 : baseZ;

        return (
          <motion.div
            key={index}
            className="absolute left-1/2 overflow-hidden rounded-[6px] shadow-2xl ring-1 ring-white/10"
            style={{
              zIndex: z,
              top: direction === "down" ? 0 : "auto",
              bottom: direction === "up" ? 0 : "auto",
              originX: "50%",
              originY: direction === "up" ? "bottom" : "top",
              cursor: "pointer",
            }}
            animate={{
              x: `calc(-50% + ${isHovered ? offsetX : 0}px)`,
              y: isHovered ? sign * hoverOffsetY : 0,
              rotate: isHovered ? rotation : 0,
              width: isHovered ? hoverImageSize.width : 0,
              height: isHovered ? hoverImageSize.height : 0,
              opacity: isHovered ? 1 : 0,
              scale: isActive ? 1.06 : 1,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 28, delay: index * 0.04 }}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            {useIframes ? (
              <iframe
                src={src}
                className="border-0 block"
                style={{ width: hoverImageSize.width, height: hoverImageSize.height, pointerEvents: "none" }}
                scrolling="no"
              />
            ) : (
              <img src={src} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />
            )}
          </motion.div>
        );
      })}

      {/* Folder icon */}
      <motion.div className="relative" style={{ width: folderSize.width, height: folderSize.height }}>
        <div className="absolute inset-0 rounded-[4px] bg-gradient-to-b from-amber-400 to-amber-500 shadow-sm">
          <div
            className="absolute left-0.5 rounded-t-[2px] bg-gradient-to-b from-amber-300 to-amber-400"
            style={{ top: -tabHeight * 0.65, width: tabWidth, height: tabHeight }}
          />
        </div>
        <motion.div
          className="absolute inset-x-0 bottom-0 h-[85%] origin-bottom rounded-[4px] bg-gradient-to-b from-amber-300 to-amber-400 shadow-sm"
          animate={{ rotateX: isHovered ? -45 : -25, scaleY: isHovered ? 0.8 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          style={{ transformStyle: "preserve-3d", zIndex: 20 }}
        >
          <div className="absolute top-1 right-1 left-1 h-px bg-amber-200/50" />
        </motion.div>
      </motion.div>
    </div>
  );
}
