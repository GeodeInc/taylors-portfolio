"use client";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { IconCode, IconRocket, IconBulb, IconBrandGithub, IconBriefcase, IconUsers } from "@tabler/icons-react";
import { TiltCard } from "@/components/ui/tilt-card";
import { useTheme } from "@/contexts/theme-context";

const stats = [
  { label: "Years Experience",   end: 4,  suffix: "+", icon: <IconBriefcase size={20} /> },
  { label: "Projects Delivered", end: 4,  suffix: "",  icon: <IconRocket size={20} /> },
  { label: "Technologies",       end: 15, suffix: "+", icon: <IconUsers size={20} /> },
];

const cards = [
  { icon: <IconBriefcase size={22} />, title: "TenzorLLC Co-Founder",                      description: "Co-founded a software development company delivering web applications and operational tools for businesses.", accentBorder: "var(--navy-border-sm)", accentBg: "var(--navy-fill-xs)", accentText: "var(--navy)"      },
  { icon: <IconCode size={22} />,      title: "Computer Engineering Student, Rutgers",      description: "Focused on building at the intersection of hardware systems and scalable software.",                         accentBorder: "var(--navy-border-sm)", accentBg: "var(--navy-fill-xs)", accentText: "var(--navy-dark)" },
  { icon: <IconBulb size={22} />,      title: "UI/UX Lead",                                description: "Lead front-end and user experience development at Tenzor, ensuring high-quality, detail-oriented interfaces.", accentBorder: "var(--sage-border-sm)", accentBg: "var(--sage-fill-sm)", accentText: "var(--sage)"      },
  { icon: <IconBrandGithub size={22} />, title: "GeodeInc",                                 description: "Personal brand and GitHub identity, representing my independent projects and work outside of Tenzor.",        accentBorder: "var(--sage-border)",    accentBg: "var(--sage-fill-sm)", accentText: "var(--sage)"      },
];

function useCountUp(end: number, isInView: boolean, duration = 1200) {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (!isInView || started.current) return;
    started.current = true;
    const startTime = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setCount(Math.round(eased * end));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, end, duration]);
  return count;
}

function StatCard({ stat, isInView }: { stat: typeof stats[number]; isInView: boolean }) {
  const count = useCountUp(stat.end, isInView);
  const { theme } = useTheme();
  const isLight = theme === "light";
  const surfaceBorder = isLight ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.05)";
  const surfaceBg     = isLight ? "rgba(0,0,0,0.03)"  : "rgba(255,255,255,0.02)";
  return (
    <div className="flex flex-col items-center rounded-2xl border p-3 md:p-6 text-center"
      style={{ borderColor: surfaceBorder, backgroundColor: surfaceBg }}>
      <div style={{ color: "var(--navy)" }}>{stat.icon}</div>
      <div className="mt-1 text-3xl md:text-5xl font-bold tracking-tight"
        style={{ background: "linear-gradient(135deg, var(--navy), var(--navy-dark))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        {count}{stat.suffix}
      </div>
      <div className="mt-1 text-xs md:text-sm text-neutral-500 tracking-wide uppercase" style={{ fontFamily: "var(--font-sub)" }}>{stat.label}</div>
    </div>
  );
}

export const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { theme } = useTheme();
  const isLight = theme === "light";
  const tagBorder    = isLight ? "rgba(0,0,0,0.08)"  : "rgba(255,255,255,0.08)";
  const tagBg        = isLight ? "rgba(0,0,0,0.03)"  : "rgba(255,255,255,0.03)";
  const headingColor = isLight ? "var(--navy)"        : "#ffffff";
  const bodyColor    = isLight ? "var(--navy-dark)"   : "rgb(229 229 229)";
  const mutedColor   = isLight ? "rgba(0,0,0,0.45)"  : "rgb(212 212 212)";

  return (
    <section id="about" className="relative bg-black py-8 lg:py-16 overflow-hidden min-h-screen flex flex-col justify-center">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="absolute left-1/4 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, var(--navy-glow-sm) 0%, transparent 70%)" }} />

      <div ref={ref} className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 pt-4 md:pt-8 lg:pt-20">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}
          className="mb-4 md:mb-8 text-center">
          <span className="mb-4 inline-block rounded-full border px-4 py-1.5 text-sm font-medium"
            style={{ borderColor: "var(--navy-border)", backgroundColor: "var(--navy-fill-sm)", color: "var(--navy)" }}>
            About Me
          </span>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl lg:text-5xl tracking-tight" style={{ fontFamily: "var(--font-sub)", color: headingColor }}>
            Who I Am
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:gap-12 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col justify-center space-y-3 md:space-y-5">

            {/* ── HEADSHOT SWAP ───────────────────────────────────────────────
                When you have a professional photo:
                1. Drop the image in /public/headshot.jpg
                2. Uncomment the block below and delete the two <p> paragraphs
                3. Done — tags + resume button stay as-is beneath the photo

            <div className="flex flex-col space-y-4">
              <img
                src="/headshot.jpg"
                alt="Taylor Houghtaling"
                className="w-full max-h-80 object-cover object-top rounded-2xl"
                style={{ border: `1px solid ${tagBorder}` }}
              />
              <p className="text-lg leading-relaxed" style={{ color: bodyColor }}>
                I&apos;m Taylor &mdash; front-end lead and co-founder of Tenzor LLC,
                and a Computer Engineering student at Rutgers University.
              </p>
            </div>
            ─────────────────────────────────────────────────────────────────── */}

            <p className="text-lg leading-relaxed" style={{ color: bodyColor }}>
              I&apos;m Taylor — co-founder of Tenzor LLC, where we build custom web apps, POS systems, and tools for real businesses.
            </p>
            <p className="text-lg leading-relaxed" style={{ color: mutedColor }}>
              I study Computer Engineering at Rutgers and lead front-end and UI/UX at Tenzor, focusing on creating clean, high-quality user experiences.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {["React", "Next.js", "TypeScript", "Node.js", "Python", "PostgreSQL"].map((s) => (
                <span key={s} className="rounded-full border px-3 py-1 text-sm"
                  style={{ borderColor: tagBorder, backgroundColor: tagBg, color: isLight ? "var(--navy-dark)" : undefined }}>
                  {s}
                </span>
              ))}
            </div>
            <motion.a href="/resume.pdf" download="Taylor_Houghtaling_Resume.pdf"
              whileHover={{ scale: 1.05, filter: "brightness(1.1)" }} whileTap={{ scale: 0.97 }}
              className="mt-1 inline-flex w-fit items-center gap-2 rounded-full border px-6 py-2.5 text-sm font-medium transition-all"
              style={{ borderColor: "var(--navy-border)", backgroundColor: "var(--navy-fill-sm)", color: "var(--navy)" }}>
              <IconBriefcase size={16} />
              Download Resume
            </motion.a>
          </motion.div>

          <div className="grid grid-cols-2 gap-2 md:gap-4">
            {cards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.25 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <TiltCard
                  className="rounded-2xl border p-3 md:p-5 backdrop-blur-sm h-full"
                  style={{ borderColor: card.accentBorder, backgroundColor: card.accentBg }}
                >
                  <div className="mb-3" style={{ color: card.accentText }}>{card.icon}</div>
                  <h3 className="mb-1.5 font-semibold" style={{ fontFamily: "var(--font-sub)", color: headingColor }}>{card.title}</h3>
                  <p className="text-sm leading-relaxed text-neutral-400">{card.description}</p>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-6 md:mt-10 grid grid-cols-3 gap-3 md:gap-5">
          {stats.map((s) => (
            <StatCard key={s.label} stat={s} isInView={isInView} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};
