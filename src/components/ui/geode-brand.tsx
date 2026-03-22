"use client";
import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import { useTheme } from "@/contexts/theme-context";

export const GeodeBrand = () => {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const iconControls = useAnimation();

  useEffect(() => {
    iconControls.start({ opacity: 1, scale: 1, rotate: 0, transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay: 0.2 } });
  }, [iconControls]);

  useEffect(() => {
    const handler = () => {
      iconControls.set({ opacity: 0, scale: 0.6, rotate: -10 });
      iconControls.start({ opacity: 1, scale: 1, rotate: 0, transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] } });
    };
    window.addEventListener("nav-transition-done", handler);
    return () => window.removeEventListener("nav-transition-done", handler);
  }, [iconControls]);

  return (
    <motion.a
      href="https://github.com/GeodeInc"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed left-6 top-5 z-[5000] flex items-center"
    >
      <motion.img
        src="/geodeinc_icon_only.svg"
        alt="GeodeInc"
        width={36}
        height={36}
        className="rounded-lg"
        initial={{ opacity: 0, scale: 0.6, rotate: -10 }}
        animate={iconControls}
      />
      <motion.div
        className="hidden sm:block overflow-hidden"
        initial={{ maxWidth: 0, opacity: 0, marginLeft: 0 }}
        animate={{ maxWidth: 200, opacity: 1, marginLeft: 10 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <img
          src={isLight ? "/geodeinc_wordmark_only_light.svg" : "/geodeinc_wordmark_only.svg"}
          alt="GeodeInc"
          className="h-7 w-auto object-contain block"
        />
      </motion.div>
    </motion.a>
  );
};
