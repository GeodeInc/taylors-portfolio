"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";

type Tag = {
  id: string;
  label: string;
};

type DynamicTagCloudProps = {
  tags?: Tag[];
};

const NAV_TAGS: Tag[] = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "contact", label: "Contact" },
];

export function DynamicTagCloud({ tags = NAV_TAGS }: DynamicTagCloudProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const offsets = useMemo(
    () =>
      tags.map(() => ({
        x: (Math.random() - 0.5) * 260,
        y: (Math.random() - 0.5) * 180,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {tags.map((tag, index) => {
        const isHovered = hoveredId === tag.id;
        const offset = offsets[index];

        return (
          <motion.button
            key={tag.id}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{
              x: isHovered ? offset.x * 1.2 : offset.x,
              y: isHovered ? offset.y * 1.2 : offset.y,
              opacity: 1,
              scale: isHovered ? 1.15 : 1,
            }}
            transition={{
              type: "spring",
              stiffness: 180,
              damping: 18,
              delay: index * 0.07,
            }}
            onHoverStart={() => setHoveredId(tag.id)}
            onHoverEnd={() => setHoveredId(null)}
            className="absolute rounded-full border px-5 py-2 text-sm font-medium"
            style={{
              fontFamily: "var(--font-sub)",
              borderColor: "var(--navy-border)",
              backgroundColor: "var(--navy-fill-sm)",
              color: "var(--navy)",
            }}
          >
            {tag.label}
          </motion.button>
        );
      })}
    </div>
  );
}
