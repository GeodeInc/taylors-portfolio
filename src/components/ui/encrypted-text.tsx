"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { cn } from "@/lib/utils";

type EncryptedTextProps = {
  text: string;
  className?: string;
  revealDelayMs?: number;
  charset?: string;
  flipDelayMs?: number;
  encryptedClassName?: string;
  revealedClassName?: string;
  /** When true, run the animation in reverse (encrypt out). */
  encryptOut?: boolean;
  /** Called when encrypt-out finishes (all chars are gibberish). */
  onEncryptComplete?: () => void;
};

const DEFAULT_CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-={}[];:,.<>/?";

function generateRandomCharacter(charset: string): string {
  return charset.charAt(Math.floor(Math.random() * charset.length));
}

function generateGibberishPreservingSpaces(original: string, charset: string): string {
  if (!original) return "";
  let result = "";
  for (let i = 0; i < original.length; i++) {
    result += original[i] === " " ? " " : generateRandomCharacter(charset);
  }
  return result;
}

export const EncryptedText: React.FC<EncryptedTextProps> = ({
  text,
  className,
  revealDelayMs = 50,
  charset = DEFAULT_CHARSET,
  flipDelayMs = 50,
  encryptedClassName,
  revealedClassName,
  encryptOut = false,
  onEncryptComplete,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  const [revealCount, setRevealCount] = useState<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastFlipTimeRef = useRef<number>(0);
  const scrambleCharsRef = useRef<string[]>(text ? text.split("") : []);
  const onEncryptCompleteRef = useRef(onEncryptComplete);
  onEncryptCompleteRef.current = onEncryptComplete;

  useEffect(() => {
    if (!isInView) return;

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const now = performance.now();
    startTimeRef.current = now;
    lastFlipTimeRef.current = now;
    let isCancelled = false;

    if (encryptOut) {
      // Start fully revealed, count down to 0
      scrambleCharsRef.current = text.split("");
      setRevealCount(text.length);

      const update = (ts: number) => {
        if (isCancelled) return;
        const elapsed = ts - startTimeRef.current;
        const encrypted = Math.min(text.length, Math.floor(elapsed / Math.max(1, revealDelayMs)));
        const current = Math.max(0, text.length - encrypted);
        setRevealCount(current);

        const timeSinceFlip = ts - lastFlipTimeRef.current;
        if (timeSinceFlip >= Math.max(0, flipDelayMs)) {
          for (let i = current; i < text.length; i++) {
            scrambleCharsRef.current[i] = text[i] === " " ? " " : generateRandomCharacter(charset);
          }
          lastFlipTimeRef.current = ts;
        }

        if (current <= 0) {
          onEncryptCompleteRef.current?.();
          return;
        }
        animationFrameRef.current = requestAnimationFrame(update);
      };
      animationFrameRef.current = requestAnimationFrame(update);
    } else {
      // Normal reveal: start from gibberish, reveal left-to-right
      scrambleCharsRef.current = generateGibberishPreservingSpaces(text, charset).split("");
      setRevealCount(0);

      const update = (ts: number) => {
        if (isCancelled) return;
        const elapsed = ts - startTimeRef.current;
        const current = Math.min(text.length, Math.floor(elapsed / Math.max(1, revealDelayMs)));
        setRevealCount(current);

        if (current >= text.length) return;

        const timeSinceFlip = ts - lastFlipTimeRef.current;
        if (timeSinceFlip >= Math.max(0, flipDelayMs)) {
          for (let i = current; i < text.length; i++) {
            scrambleCharsRef.current[i] = text[i] === " " ? " " : generateRandomCharacter(charset);
          }
          lastFlipTimeRef.current = ts;
        }
        animationFrameRef.current = requestAnimationFrame(update);
      };
      animationFrameRef.current = requestAnimationFrame(update);
    }

    return () => {
      isCancelled = true;
      if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView, text, encryptOut, revealDelayMs, charset, flipDelayMs]);

  if (!text) return null;

  return (
    <motion.span ref={ref} className={cn(className)} aria-label={text} role="text">
      {text.split("").map((char, index) => {
        const isRevealed = index < revealCount;
        const displayChar = isRevealed
          ? char
          : char === " "
            ? " "
            : (scrambleCharsRef.current[index] ?? generateRandomCharacter(charset));
        return (
          <span key={index} className={cn(isRevealed ? revealedClassName : encryptedClassName)}>
            {displayChar}
          </span>
        );
      })}
    </motion.span>
  );
};
