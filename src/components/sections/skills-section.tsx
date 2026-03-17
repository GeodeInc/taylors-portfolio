"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { InfiniteMovingCards } from "@/components/aceternity/infinite-moving-cards";
import {
  IconBrandReact, IconBrandNextjs, IconBrandTypescript, IconBrandNodejs,
  IconBrandPython, IconBrandDocker, IconBrandGit, IconBrandAws,
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
  { name: "AWS",        icon: <IconBrandAws />,     color: "var(--navy-dark)" },
  { name: "Git",        icon: <IconBrandGit />,     color: "var(--navy)"      },
];

export const SkillsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <section id="skills" className="relative bg-black py-32 overflow-hidden">
      <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, var(--navy-glow) 0%, transparent 70%)" }} />

      <div ref={ref} className="relative z-10 mx-auto max-w-7xl px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}
          className="mb-16 text-center">
          <span className="mb-4 inline-block rounded-full border px-4 py-1.5 text-sm font-medium"
            style={{ borderColor: "var(--navy-border)", backgroundColor: "var(--navy-fill-sm)", color: "var(--navy)" }}>
            Skills & Tech
          </span>
          <h2 className="mt-4 text-4xl font-bold text-white md:text-5xl" style={{ fontFamily: "var(--font-sub)" }}>
            What I Work With
          </h2>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ duration: 0.6, delay: 0.2 }} className="space-y-4">
          <InfiniteMovingCards items={row1} direction="left"  speed="slow" />
          <InfiniteMovingCards items={row2} direction="right" speed="slow" />
        </motion.div>

      </div>
    </section>
  );
};
