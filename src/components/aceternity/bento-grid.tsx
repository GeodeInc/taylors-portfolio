"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { TiltCard } from "@/components/ui/tilt-card";

export const BentoGrid = ({ className, children }: { className?: string; children?: React.ReactNode }) => (
  <div className={cn("mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-3", className)}>
    {children}
  </div>
);

export const BentoGridItem = ({
  className, title, description, header, icon, tags, link,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  tags?: string[];
  link?: string;
}) => (
  <TiltCard
    className={cn(
      "group/bento relative row-span-1 flex flex-col gap-4 overflow-hidden rounded-2xl border border-white/[0.06] bg-black/40 p-6 shadow-xl backdrop-blur-sm transition-all duration-200 hover:border-[var(--navy-border-sm)]",
      className
    )}>
    {header}
    <div className="transition duration-200 group-hover/bento:translate-x-2">
      {icon && (
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: "linear-gradient(135deg, var(--navy-fill-lg), var(--navy-fill-sm))", color: "var(--navy)" }}>
          {icon}
        </div>
      )}
      <div className="mb-2 font-bold text-white" style={{ fontFamily: "var(--font-sub)" }}>{title}</div>
      <div className="text-sm font-normal text-neutral-300">{description}</div>
      {tags && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-neutral-400">{tag}</span>
          ))}
        </div>
      )}
    </div>
    {link && (
      <a href={link} target="_blank" rel="noopener noreferrer"
        className="mt-2 inline-flex items-center gap-1 text-xs font-medium opacity-0 transition-opacity group-hover/bento:opacity-100"
        style={{ color: "var(--navy)" }}>
        View Project →
      </a>
    )}
  </TiltCard>
);
