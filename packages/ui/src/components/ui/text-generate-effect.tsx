"use client";

import { motion, stagger, useAnimate } from "motion/react";
import { useEffect } from "react";

import { cn } from "../../utils";

export interface TextGenerateEffectProps {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
  staggerDelay?: number;
}

export function TextGenerateEffect({
  words,
  className,
  filter = true,
  duration = 0.55,
  staggerDelay = 0.14,
}: TextGenerateEffectProps) {
  const [scope, animate] = useAnimate();
  const wordsArray = words.split(" ");

  useEffect(() => {
    animate(
      "span",
      { opacity: 1, filter: filter ? "blur(0px)" : "none", y: 0 },
      { duration, delay: stagger(staggerDelay), ease: "easeOut" },
    );
  }, [animate, duration, filter, staggerDelay]);

  return (
    <div className={cn("font-bold tracking-tight", className)}>
      <motion.div ref={scope}>
        {wordsArray.map((word, index) => (
          <motion.span
            key={`${word}-${index}`}
            className="mr-3 inline-block text-zinc-900 opacity-0 dark:text-white"
            style={{
              filter: filter ? "blur(10px)" : "none",
              transform: "translateY(10px)",
            }}
          >
            {word}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}
