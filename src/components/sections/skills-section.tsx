"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useTheme } from "@/contexts/theme-context";
import { InfiniteMovingCards } from "@/components/aceternity/infinite-moving-cards";
import {
  IconBrandReact, IconBrandNextjs, IconBrandTypescript, IconBrandNodejs,
  IconBrandPython, IconBrandDocker, IconBrandGit,
  IconBrandTailwind, IconDatabase, IconBrandJavascript,
  IconBrandHtml5, IconBrandCss3, IconChartBar,
} from "@tabler/icons-react";

const row1 = [
  { name: "React",        icon: <IconBrandReact />,       color: "var(--navy)"      },
  { name: "Next.js",      icon: <IconBrandNextjs />,      color: "#ffffff"          },
  { name: "TypeScript",   icon: <IconBrandTypescript />,  color: "var(--navy-dark)" },
  { name: "JavaScript",   icon: <IconBrandJavascript />,  color: "var(--navy)"      },
  { name: "Tailwind CSS", icon: <IconBrandTailwind />,    color: "var(--navy)"      },
  { name: "Recharts",     icon: <IconChartBar />,         color: "var(--sage)"      },
  { name: "Framer",       icon: <span>✦</span>,           color: "var(--navy-dark)" },
];
const row2 = [
  { name: "HTML",       icon: <IconBrandHtml5 />,   color: "var(--navy)"      },
  { name: "CSS",        icon: <IconBrandCss3 />,    color: "var(--sage)"      },
  { name: "Node.js",    icon: <IconBrandNodejs />,  color: "var(--navy-dark)" },
  { name: "Python",     icon: <IconBrandPython />,  color: "var(--navy)"      },
  { name: "PostgreSQL", icon: <IconDatabase />,     color: "var(--sage)"      },
  { name: "Docker",     icon: <IconBrandDocker />,  color: "var(--sage)"      },
  { name: "Git",        icon: <IconBrandGit />,     color: "var(--navy)"      },
];
const row3 = [
  { name: "React",        icon: <IconBrandReact />,       color: "var(--sage)"      },
  { name: "Docker",       icon: <IconBrandDocker />,      color: "var(--navy)"      },
  { name: "TypeScript",   icon: <IconBrandTypescript />,  color: "var(--sage)"      },
  { name: "Next.js",      icon: <IconBrandNextjs />,      color: "var(--navy-dark)" },
  { name: "Python",       icon: <IconBrandPython />,      color: "var(--navy)"      },
  { name: "Git",          icon: <IconBrandGit />,         color: "var(--sage)"      },
  { name: "PostgreSQL",   icon: <IconDatabase />,         color: "var(--navy-dark)" },
];

const categories = [
  {
    label: "Frontend",
    color: "var(--navy)",
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "HTML", "CSS"],
  },
  {
    label: "Backend",
    color: "var(--sage)",
    skills: ["Node.js", "Python", "PostgreSQL", "REST APIs", "Prisma"],
  },
  {
    label: "DevOps",
    color: "var(--navy-dark)",
    skills: ["Docker", "Git", "GitHub Actions", "Vercel", "Linux"],
  },
];

export const SkillsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { theme } = useTheme();
  const isLight = theme === "light";
  const cardBorder = isLight ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.06)";
  const cardBg     = isLight ? "rgba(0,0,0,0.02)"  : "rgba(255,255,255,0.02)";
  const tagBorder  = isLight ? "rgba(0,0,0,0.07)"  : "rgba(255,255,255,0.07)";
  const tagBg      = isLight ? "rgba(0,0,0,0.04)"  : "rgba(255,255,255,0.04)";
  const tagColor   = isLight ? "var(--navy-dark)"  : undefined;
  return (
    <section id="skills" className="relative bg-black py-8 lg:py-16 overflow-x-hidden min-h-screen flex flex-col justify-center">
      <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, var(--navy-glow) 0%, transparent 70%)" }} />

      <div ref={ref} className="relative z-10 w-full mx-auto max-w-7xl px-4 md:px-6 pt-4 md:pt-8 lg:pt-20">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}
          className="mb-4 md:mb-8 text-center">
          <span className="mb-4 inline-block rounded-full border px-4 py-1.5 text-sm font-medium"
            style={{ borderColor: "var(--sage-border)", backgroundColor: "var(--sage-fill-sm)", color: "var(--sage)" }}>
            Skills & Tech
          </span>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl lg:text-5xl tracking-tight" style={{ fontFamily: "var(--font-sub)", color: isLight ? "var(--navy)" : "#ffffff" }}>
            What I Work With
          </h2>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ duration: 0.6, delay: 0.2 }} className="space-y-4">
          <InfiniteMovingCards items={row1} direction="left"  speed="slow" />
          <InfiniteMovingCards items={row2} direction="right" speed="slow" />
          <InfiniteMovingCards items={row3} direction="left"  speed="slow" />
        </motion.div>

        <div className="mt-6 md:mt-10 grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-3">
          {categories.map((cat, catIdx) => (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.35 + catIdx * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl border p-5 overflow-hidden relative"
              style={{ borderColor: cardBorder, backgroundColor: cardBg }}
            >
              {/* Accent top stripe */}
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: cat.color, opacity: 0.7 }} />
              <div className="mb-3 flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: cat.color, fontFamily: "var(--font-sub)" }}>
                  {cat.label}
                </div>
                <div className="text-xs tabular-nums" style={{ color: cat.color, opacity: 0.5, fontFamily: "var(--font-sub)" }}>
                  {cat.skills.length}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {cat.skills.map((s, skillIdx) => (
                  <motion.span
                    key={s}
                    initial={{ opacity: 0, scale: 0.75 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.25, delay: 0.45 + catIdx * 0.12 + skillIdx * 0.045, ease: "easeOut" }}
                    className="rounded-full px-2.5 py-1 text-xs"
                    style={{ backgroundColor: tagBg, border: `1px solid ${tagBorder}`, color: tagColor ?? "rgb(212 212 212)", display: "inline-block" }}
                  >
                    {s}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
