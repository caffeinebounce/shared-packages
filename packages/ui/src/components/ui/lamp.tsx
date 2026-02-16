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
      {/* Subtle radial ambient glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(129,140,248,0.10),transparent_55%)] dark:bg-[radial-gradient(circle_at_top,rgba(129,140,248,0.22),transparent_55%)]" />

      {/* Lamp glow — blur on a STATIC div, width animated via CSS transition (not framer-motion) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
        <div
          className="h-72 transition-all duration-[1200ms] ease-out"
          style={{
            backgroundImage:
              "conic-gradient(from 210deg at 50% 0%, rgba(129,140,248,0.55), transparent 55%, rgba(129,140,248,0.35))",
            filter: "blur(64px)",
            WebkitFilter: "blur(64px)",
            transform: "translateZ(0)",
            willChange: "opacity, width",
            opacity: mounted ? 1 : 0,
            width: mounted ? "36rem" : "14rem",
          }}
        />
      </div>

      {/* Accent line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
        <div
          className="h-px bg-gradient-to-r from-transparent via-indigo-400/90 to-transparent transition-all duration-[1400ms] ease-out dark:via-indigo-300/90"
          style={{
            opacity: mounted ? 0.65 : 0,
            width: mounted ? "58rem" : "24rem",
          }}
        />
      </div>

      {/* Top fade overlay */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-white via-white/85 to-transparent dark:from-black dark:via-black/85" />

      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
