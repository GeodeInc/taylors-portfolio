"use client";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { BackgroundBeams } from "@/components/aceternity/background-beams";
import { IconBrandGithub, IconBrandLinkedin, IconMail, IconPhone, IconSend, IconCheck } from "@tabler/icons-react";
import { Magnetic } from "@/components/ui/magnetic";

const socials = [
  { label: "GitHub",      icon: <IconBrandGithub size={20} />,   href: "https://github.com/GeodeInc" },
  { label: "LinkedIn",    icon: <IconBrandLinkedin size={20} />, href: "https://www.linkedin.com/in/taylor-houghtaling-19b333382/" },
  { label: "Email",       icon: <IconMail size={20} />,          href: "mailto:taylor@tenzorllc.com" },
  { label: "Phone",       icon: <IconPhone size={20} />,         href: "tel:+16092252579" },
];

export const ContactSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      await res.json();
      setSent(true);
      setForm({ name: "", email: "", message: "" });
      setTimeout(() => setSent(false), 4000);
    } catch {
      setError("Something went wrong. Try emailing directly.");
    } finally {
      setLoading(false);
    }
  };

  const inputBase: React.CSSProperties = { borderColor: "rgba(255,255,255,0.07)", backgroundColor: "rgba(255,255,255,0.03)" };

  return (
    <section id="contact" className="relative bg-black py-32 overflow-hidden">
      <BackgroundBeams />

      <div ref={ref} className="relative z-10 mx-auto max-w-4xl px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="mb-16 text-center">
          <span className="mb-4 inline-block rounded-full border px-4 py-1.5 text-sm font-medium"
            style={{ borderColor: "var(--navy-border)", backgroundColor: "var(--navy-fill-sm)", color: "var(--navy)" }}>
            Contact
          </span>
          <h2 className="mt-4 text-4xl font-bold text-white md:text-5xl" style={{ fontFamily: "var(--font-sub)" }}>
            Let&apos;s Work Together
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: 0.2 }}>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: "Name",  type: "text",  key: "name",  ph: "Taylor Houghtaling" },
                { label: "Email", type: "email", key: "email", ph: "taylor@tenzorllc.com" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="mb-2 block text-sm font-medium text-neutral-500">{f.label}</label>
                  <input type={f.type} required value={form[f.key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full rounded-xl border px-4 py-3 text-white placeholder-neutral-700 outline-none transition-all"
                    style={inputBase}
                    onFocus={(e) => (e.target.style.borderColor = "var(--navy-border-lg)")}
                    onBlur={(e)  => (e.target.style.borderColor = "rgba(255,255,255,0.07)")}
                    placeholder={f.ph} />
                </div>
              ))}
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-500">Message</label>
                <textarea required rows={5} value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full rounded-xl border px-4 py-3 text-white placeholder-neutral-700 outline-none transition-all resize-none"
                  style={inputBase}
                  onFocus={(e) => (e.target.style.borderColor = "var(--navy-border-lg)")}
                  onBlur={(e)  => (e.target.style.borderColor = "rgba(255,255,255,0.07)")}
                  placeholder="Hey Taylor, I'd love to collaborate on..." />
              </div>
              <Magnetic>
                <motion.button type="submit" disabled={loading} whileHover={{ scale: loading ? 1 : 1.03, filter: loading ? "none" : "brightness(1.1)" }} whileTap={{ scale: loading ? 1 : 0.97 }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: sent ? "#2a7a4a" : "var(--navy-dark)",
                    color: "#ffffff",
                    boxShadow: sent ? "0 8px 28px rgba(42,122,74,0.25)" : "0 8px 28px var(--navy-shadow)",
                  }}>
                  {sent ? <><IconCheck size={16} /> Message Sent!</> : loading ? <>Sending…</> : <><IconSend size={16} /> Send Message</>}
                </motion.button>
              </Magnetic>
              {error && <p className="mt-2 text-center text-xs text-red-400">{error}</p>}
            </form>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col justify-between space-y-8">
            <div>
              <h3 className="mb-2 text-lg font-semibold text-white" style={{ fontFamily: "var(--font-sub)" }}>Get in touch</h3>
              <p className="text-neutral-400">
                I&apos;m currently open to new opportunities. Whether you have a question or
                just want to say hi — I&apos;ll get back to you!
              </p>
              <a href="mailto:taylor@tenzorllc.com" className="mt-4 inline-block transition-colors hover:opacity-80"
                style={{ color: "var(--navy)" }}>
                taylor@tenzorllc.com →
              </a>
            </div>

            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-700" style={{ fontFamily: "var(--font-sub)" }}>Find me on</h3>
              <div className="grid grid-cols-2 gap-3">
                {socials.map((s) => (
                  <Magnetic key={s.label} strength={0.3}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl border px-4 py-3 text-sm text-neutral-500 transition-all hover:scale-[1.04] active:scale-[0.97]"
                      style={{ borderColor: "rgba(255,255,255,0.05)", backgroundColor: "rgba(255,255,255,0.02)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--navy-border)"; e.currentTarget.style.color = "var(--navy)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = ""; }}>
                      {s.icon}
                      {s.label}
                    </a>
                  </Magnetic>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border p-6"
              style={{ borderColor: "var(--navy-border-sm)", backgroundColor: "var(--navy-fill-xs)" }}>
              <div className="mb-2 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 bg-emerald-400" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-sm font-medium text-white">Available for work</span>
              </div>
              <p className="text-sm text-neutral-500">
                Currently open to new opportunities. Response time is typically within 24 hours.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 mt-24 border-t pt-8 text-center" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
        <p className="text-sm text-neutral-700">
          © 2025 Taylor Houghtaling. Built with Next.js, Framer Motion & Tailwind CSS.
        </p>
      </div>
    </section>
  );
};
