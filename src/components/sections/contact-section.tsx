"use client";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { useTheme } from "@/contexts/theme-context";
import { BackgroundBeams } from "@/components/aceternity/background-beams";
import { IconBrandGithub, IconBrandLinkedin, IconMail, IconPhone, IconSend, IconCheck } from "@tabler/icons-react";
import { Magnetic } from "@/components/ui/magnetic";

const socials = [
  { label: "GitHub",   icon: <IconBrandGithub size={20} />,   href: "https://github.com/GeodeInc" },
  { label: "LinkedIn", icon: <IconBrandLinkedin size={20} />, href: "https://www.linkedin.com/in/taylor-houghtaling-19b333382/" },
  { label: "Email",    icon: <IconMail size={20} />,          href: "mailto:taylor@tenzorllc.com" },
  { label: "Phone",    icon: <IconPhone size={20} />,         href: "tel:+16092252579" },
];

function validate(form: { name: string; email: string; message: string }) {
  return {
    name:    form.name.trim().length === 0    ? "Name is required" : "",
    email:   !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? "Valid email required" : "",
    message: form.message.trim().length < 10 ? "Message must be at least 10 characters" : "",
  };
}

export const ContactSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rateLimited, setRateLimited] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [touched, setTouched] = useState({ name: false, email: false, message: false });

  const errors = validate(form);
  const isValid = !errors.name && !errors.email && !errors.message;

  const touch = (field: keyof typeof touched) =>
    setTouched((t) => ({ ...t, [field]: true }));

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched({ name: true, email: true, message: true });
    if (!isValid) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "");
      setSent(true);
      setForm({ name: "", email: "", message: "" });
      setTouched({ name: false, email: false, message: false });
      setTimeout(() => setSent(false), 4000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.toLowerCase().includes("too many")) setRateLimited(true);
      setError(msg || "Something went wrong. Try emailing taylor@tenzorllc.com directly.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = `w-full rounded-xl border px-4 py-3 outline-none transition-colors placeholder-neutral-700 ${
    isLight
      ? "bg-black/[0.03] text-[var(--navy)] border-black/10 focus:border-black/25"
      : "bg-white/[0.03] text-white border-white/[0.07] focus:border-[var(--navy-border-lg)]"
  }`;

  const socialBorder = isLight ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.05)";
  const socialBg     = isLight ? "rgba(0,0,0,0.02)" : "rgba(255,255,255,0.02)";
  const footerBorder = isLight ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.04)";

  return (
    <section id="contact" className="relative bg-black py-8 lg:py-16 overflow-hidden min-h-screen flex flex-col justify-center">
      <BackgroundBeams />

      <div ref={ref} className="relative z-10 mx-auto max-w-4xl px-4 md:px-6 pt-4 md:pt-8 lg:pt-20">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="mb-4 md:mb-8 text-center">
          <span className="mb-4 inline-block rounded-full border px-4 py-1.5 text-sm font-medium"
            style={{ borderColor: "var(--sage-border)", backgroundColor: "var(--sage-fill-sm)", color: "var(--sage)" }}>
            Contact
          </span>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl lg:text-5xl tracking-tight" style={{ fontFamily: "var(--font-sub)", color: isLight ? "var(--navy)" : "#ffffff" }}>
            Let&apos;s Work Together
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:gap-12 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: 0.2 }}>
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {(["name", "email"] as const).map((key) => (
                <div key={key}>
                  <label className="mb-2 block text-sm font-medium text-neutral-500 capitalize">{key}</label>
                  <input
                    type={key === "email" ? "email" : "text"}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    onBlur={() => touch(key)}
                    className={inputCls}
                    placeholder={key === "email" ? "taylor@tenzorllc.com" : "Taylor Houghtaling"}
                  />
                  {touched[key] && errors[key] && (
                    <p className="mt-1 text-xs text-red-400">{errors[key]}</p>
                  )}
                </div>
              ))}
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-500">Message</label>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  onBlur={() => touch("message")}
                  className={`${inputCls} resize-none`}
                  placeholder="Hey Taylor, I'd love to collaborate on..."
                />
                {touched.message && errors.message && (
                  <p className="mt-1 text-xs text-red-400">{errors.message}</p>
                )}
              </div>
              <Magnetic>
                <motion.button
                  type="submit"
                  disabled={loading || rateLimited}
                  whileHover={{ scale: (loading || rateLimited) ? 1 : 1.03, filter: (loading || rateLimited) ? "none" : "brightness(1.1)" }}
                  whileTap={{ scale: (loading || rateLimited) ? 1 : 0.97 }}
                  className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold cursor-pointer disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: rateLimited ? "rgba(120,120,120,0.25)" : sent ? "#2a7a4a" : "var(--navy-dark)",
                    color: rateLimited ? "rgba(255,255,255,0.35)" : "#ffffff",
                    boxShadow: rateLimited ? "none" : sent ? "0 8px 28px rgba(42,122,74,0.25)" : "0 8px 28px var(--navy-shadow)",
                  }}
                >
                  {sent ? <><IconCheck size={16} /> Message Sent!</> : loading ? "Sending…" : rateLimited ? "Rate limited — try again later" : <><IconSend size={16} /> Send Message</>}
                </motion.button>
              </Magnetic>
              {error && <p className="mt-2 text-center text-xs text-red-400">{error}</p>}
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col justify-between space-y-4 md:space-y-8"
          >
            <div>
              <h3 className="mb-2 text-lg font-semibold" style={{ fontFamily: "var(--font-sub)", color: isLight ? "var(--navy)" : "#ffffff" }}>Get in touch</h3>
              <p className="text-neutral-400">
                I&apos;m currently open to new opportunities. Whether you have a question or just want to say hi — I&apos;ll get back to you!
              </p>
              <a href="mailto:taylor@tenzorllc.com" className="mt-4 inline-block transition-opacity hover:opacity-70"
                style={{ color: "var(--navy)" }}>
                taylor@tenzorllc.com →
              </a>
            </div>

            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-700" style={{ fontFamily: "var(--font-sub)" }}>Find me on</h3>
              <div className="grid grid-cols-2 gap-3">
                {socials.map((s) => (
                  <Magnetic key={s.label} strength={0.3}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-all hover:scale-[1.04] active:scale-[0.97]"
                      style={{ borderColor: socialBorder, backgroundColor: socialBg, color: isLight ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)" }}
                    >
                      <span className="transition-colors group-hover:text-[var(--navy)]">{s.icon}</span>
                      <span className="transition-colors group-hover:text-[var(--navy)]">{s.label}</span>
                    </a>
                  </Magnetic>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border p-4 md:p-6"
              style={{ borderColor: "var(--navy-border-sm)", backgroundColor: "var(--navy-fill-xs)" }}>
              <div className="mb-2 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 bg-emerald-400" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-sm font-medium" style={{ color: isLight ? "var(--navy)" : "#ffffff" }}>Available for work</span>
              </div>
              <p className="text-sm text-neutral-500">
                Currently open to new opportunities. Response time is typically within 24 hours.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 mt-8 md:mt-24 border-t pt-6 md:pt-8 text-center" style={{ borderColor: footerBorder }}>
        <p className="text-sm text-neutral-700">
          © 2025 Taylor Houghtaling. Built with Next.js, Framer Motion & Tailwind CSS.
        </p>
      </div>
    </section>
  );
};
