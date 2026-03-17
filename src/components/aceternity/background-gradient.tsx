"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
  animate = true,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  animate?: boolean;
}) => {
  const variants = {
    initial: {
      backgroundPosition: "0 50%",
    },
    animate: {
      backgroundPosition: ["0, 50%", "100% 50%", "0 50%"],
    },
  };

  return (
    <div className={cn("group relative p-[1px] rounded-2xl", containerClassName)}>
      <motion.div
        variants={animate ? variants : undefined}
        initial={animate ? "initial" : undefined}
        animate={animate ? "animate" : undefined}
        transition={
          animate
            ? {
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
              }
            : undefined
        }
        style={{
          backgroundSize: animate ? "400% 400%" : undefined,
        }}
        className={cn(
          "absolute inset-0 rounded-2xl opacity-60 blur-xl transition duration-500 will-change-transform group-hover:opacity-100",
          "bg-[radial-gradient(circle_farthest-side_at_0_100%,#8b5cf6,transparent),radial-gradient(circle_farthest-side_at_100%_0,#06b6d4,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#a78bfa,transparent),radial-gradient(circle_farthest-side_at_0_0,#6d28d9,#141316)]"
        )}
      />
      <motion.div
        variants={animate ? variants : undefined}
        initial={animate ? "initial" : undefined}
        animate={animate ? "animate" : undefined}
        transition={
          animate
            ? {
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
              }
            : undefined
        }
        style={{
          backgroundSize: animate ? "400% 400%" : undefined,
        }}
        className={cn(
          "absolute inset-0 rounded-2xl will-change-transform",
          "bg-[radial-gradient(circle_farthest-side_at_0_100%,#8b5cf6,transparent),radial-gradient(circle_farthest-side_at_100%_0,#06b6d4,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#a78bfa,transparent),radial-gradient(circle_farthest-side_at_0_0,#6d28d9,#141316)]"
        )}
      />
      <div className={cn("relative rounded-2xl", className)}>{children}</div>
    </div>
  );
};
