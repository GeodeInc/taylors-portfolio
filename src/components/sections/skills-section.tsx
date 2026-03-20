"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
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
  return (
    <section id="skills" className="relative bg-black py-16 overflow-x-hidden min-h-screen flex flex-col justify-center">
      <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, var(--navy-glow) 0%, transparent 70%)" }} />

      <div ref={ref} className="relative z-10 w-full mx-auto max-w-7xl px-6 pt-20">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}
          className="mb-8 text-center">
          <span className="mb-4 inline-block rounded-full border px-4 py-1.5 text-sm font-medium"
            style={{ borderColor: "var(--navy-border)", backgroundColor: "var(--navy-fill-sm)", color: "var(--navy)" }}>
            Skills & Tech
          </span>
          <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl" style={{ fontFamily: "var(--font-sub)" }}>
            What I Work With
          </h2>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ duration: 0.6, delay: 0.2 }} className="space-y-4">
          <InfiniteMovingCards items={row1} direction="left"  speed="slow" />
          <InfiniteMovingCards items={row2} direction="right" speed="slow" />
          <InfiniteMovingCards items={row3} direction="left"  speed="slow" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {categories.map((cat) => (
            <div key={cat.label} className="rounded-2xl border p-5"
              style={{ borderColor: "rgba(255,255,255,0.06)", backgroundColor: "rgba(255,255,255,0.02)" }}>
              <div className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: cat.color, fontFamily: "var(--font-sub)" }}>
                {cat.label}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {cat.skills.map((s) => (
                  <span key={s} className="rounded-full px-2.5 py-1 text-xs text-neutral-300"
                    style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};
