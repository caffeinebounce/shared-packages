"use client";

import { motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";

import { cn } from "../../utils";

export interface LampContainerProps {
  children: ReactNode;
  className?: string;
}

export function LampContainer({ children, className }: LampContainerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Small delay to ensure hydration is complete before starting animation
    const timer = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  return (
    <div
      className={cn(
        "relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-white transition-colors duration-300 dark:bg-black",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(129,140,248,0.10),transparent_55%)] dark:bg-[radial-gradient(circle_at_top,rgba(129,140,248,0.22),transparent_55%)]" />

      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
        <motion.div
          initial={false}
          animate={
            mounted
              ? { opacity: 1, width: "36rem" }
              : { opacity: 0.4, width: "14rem" }
          }
          transition={{ duration: 1.2, ease: "easeOut" }}
          style={{
            backgroundImage:
              "conic-gradient(from 210deg at 50% 0%, rgba(129,140,248,0.55), transparent 55%, rgba(129,140,248,0.35))",
            filter: "blur(64px)",
            opacity: 0.4,
            width: "14rem",
          }}
          className="h-72"
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
        <motion.div
          initial={false}
          animate={
            mounted
              ? { opacity: 0.65, width: "58rem" }
              : { opacity: 0.2, width: "24rem" }
          }
          transition={{ duration: 1.4, ease: "easeOut" }}
          style={{
            opacity: 0.2,
            width: "24rem",
          }}
          className="h-px bg-gradient-to-r from-transparent via-indigo-400/90 to-transparent dark:via-indigo-300/90"
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-white via-white/85 to-transparent dark:from-black dark:via-black/85" />

      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
