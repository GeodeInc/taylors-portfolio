"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { IconCode, IconRocket, IconBulb, IconBrandGithub, IconBriefcase, IconUsers } from "@tabler/icons-react";
import { TiltCard } from "@/components/ui/tilt-card";

const stats = [
  { label: "Years Experience",  value: "4+",  icon: <IconBriefcase size={20} /> },
  { label: "Projects Delivered", value: "4",  icon: <IconRocket size={20} /> },
  { label: "Technologies",      value: "15+", icon: <IconUsers size={20} /> },
];

const cards = [
  { icon: <IconBriefcase size={22} />, title: "TenzorLLC Co-Founder", description: "Co-founded a software development company delivering web applications and operational tools for businesses.", accentBorder: "var(--navy-border-sm)", accentBg: "var(--navy-fill-xs)", accentText: "var(--navy)"      },
  { icon: <IconCode size={22} />,      title: "Computer Engineering Student, Rutgers University",     description: "Focused on building at the intersection of hardware systems and scalable software.", accentBorder: "var(--navy-border-sm)", accentBg: "var(--navy-fill-xs)", accentText: "var(--navy-dark)" },
  { icon: <IconBulb size={22} />,      title: "UI/UX Lead",           description: "Lead front-end and user experience development at Tenzor, ensuring high-quality, detail-oriented interfaces.", accentBorder: "var(--sage-border-sm)", accentBg: "var(--sage-fill-sm)", accentText: "var(--sage)"      },
  { icon: <IconBrandGithub size={22} />, title: "GeodeInc",             description: "Personal brand and GitHub identity, representing my independent projects and work outside of Tenzor.", accentBorder: "var(--sage-border)",    accentBg: "var(--sage-fill-sm)", accentText: "var(--sage)"      },
];

export const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <section id="about" className="relative bg-black py-32 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="absolute left-1/4 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, var(--navy-glow-sm) 0%, transparent 70%)" }} />

      <div ref={ref} className="relative z-10 mx-auto max-w-7xl px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}
          className="mb-16 text-center">
          <span className="mb-4 inline-block rounded-full border px-4 py-1.5 text-sm font-medium"
            style={{ borderColor: "var(--navy-border)", backgroundColor: "var(--navy-fill-sm)", color: "var(--navy)" }}>
            About Me
          </span>
          <h2 className="mt-4 text-4xl font-bold text-white md:text-5xl" style={{ fontFamily: "var(--font-sub)" }}>
            Who I Am
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col justify-center space-y-5">
            <p className="text-lg leading-relaxed text-neutral-200">
              I’m Taylor — co-founder of Tenzor LLC, where we build custom web apps, POS systems, and tools for real businesses.            </p>
            <p className="text-lg leading-relaxed text-neutral-300">
              I study Computer Engineering at Rutgers and lead front-end and UI/UX at Tenzor, focusing on creating clean, high-quality user experiences.            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {["React", "Next.js", "TypeScript", "Node.js", "Python", "PostgreSQL"].map((s) => (
                <span key={s} className="rounded-full border px-3 py-1 text-sm text-neutral-400"
                  style={{ borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.03)" }}>
                  {s}
                </span>
              ))}
            </div>
            <motion.a href="/resume.pdf" download="Taylor_Houghtaling_Resume.pdf" whileHover={{ scale: 1.05, filter: "brightness(1.1)" }} whileTap={{ scale: 0.97 }}
              className="mt-1 inline-flex w-fit items-center gap-2 rounded-full border px-6 py-2.5 text-sm font-medium transition-all"
              style={{ borderColor: "var(--navy-border)", backgroundColor: "var(--navy-fill-sm)", color: "var(--navy)" }}>
              <IconBriefcase size={16} />
              Download Resume
            </motion.a>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 gap-4">
            {cards.map((card) => (
              <TiltCard key={card.title}
                className="rounded-2xl border p-5 backdrop-blur-sm"
                style={{ borderColor: card.accentBorder, backgroundColor: card.accentBg }}>
                <div className="mb-3" style={{ color: card.accentText }}>{card.icon}</div>
                <h3 className="mb-1.5 font-semibold text-white" style={{ fontFamily: "var(--font-sub)" }}>{card.title}</h3>
                <p className="text-sm leading-relaxed text-neutral-400">{card.description}</p>
              </TiltCard>
            ))}
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-20 grid grid-cols-3 gap-5 md:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center rounded-2xl border p-6 text-center"
              style={{ borderColor: "rgba(255,255,255,0.05)", backgroundColor: "rgba(255,255,255,0.02)" }}>
              <div style={{ color: "var(--navy)" }}>{s.icon}</div>
              <div className="mt-2 text-3xl font-bold"
                style={{ background: "linear-gradient(135deg, var(--navy), var(--navy-dark))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {s.value}
              </div>
              <div className="mt-1 text-sm text-neutral-600">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
