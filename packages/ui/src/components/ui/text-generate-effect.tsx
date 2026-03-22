"use client";

import { motion, stagger, useAnimate } from "motion/react";
import type { ElementType } from "react";
import { useEffect } from "react";

import { cn } from "../../utils";

export interface TextGenerateEffectProps {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
  staggerDelay?: number;
  /** HTML element to render – defaults to div; use "h1" or "h2" for headings */
  as?: ElementType;
}

export function TextGenerateEffect({
  words,
  className,
  filter = true,
  duration = 0.55,
  staggerDelay = 0.14,
  as: Component = "div",
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
    <Component className={cn("font-bold tracking-tight", className)}>
      <motion.div ref={scope}>
        {wordsArray.map((word, index) => (
          <motion.span
            key={`${word}-${index}`}
            className="mr-3 inline-block text-foreground opacity-0"
            style={{
              filter: filter ? "blur(10px)" : "none",
              transform: "translateY(10px)",
            }}
          >
            {word}
          </motion.span>
        ))}
      </motion.div>
    </Component>
  );
}
