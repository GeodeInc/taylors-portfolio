"use client";
import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

export const GeodeBrand = () => {
  const showWordmark = true;
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
      {/* Icon — drops in on load, reanimates after nav transition */}
      <motion.img
        src="/geodeinc_icon_only.svg"
        alt="GeodeInc"
        width={36}
        height={36}
        className="rounded-lg"
        initial={{ opacity: 0, scale: 0.6, rotate: -10 }}
        animate={iconControls}
      />

      {/* Wordmark — clips and slides in/out */}
      <motion.div
        className="hidden sm:block overflow-hidden"
        initial={{ maxWidth: 0, opacity: 0, marginLeft: 0 }}
      animate={{
          maxWidth: showWordmark ? 200 : 0,
          opacity: showWordmark ? 1 : 0,
          marginLeft: showWordmark ? 10 : 0,
        }}
        transition={{ duration: showWordmark ? 0.4 : 0.9, ease: [0.4, 0, 0.2, 1] }}
      >
        <motion.img
          src="/geodeinc_wordmark_only.svg"
          alt="GeodeInc"
          className="h-7 w-auto object-contain block"
          animate={{ x: showWordmark ? 0 : -8 }}
          transition={{ duration: showWordmark ? 0.4 : 0.9, ease: [0.4, 0, 0.2, 1] }}
        />
      </motion.div>
    </motion.a>
  );
};
