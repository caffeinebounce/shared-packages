"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

import { cn } from "../../utils";

export interface LampContainerProps {
  children: ReactNode;
  className?: string;
}

export function LampContainer({ children, className }: LampContainerProps) {
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
          initial={{ opacity: 0.4, width: "14rem" }}
          whileInView={{ opacity: 1, width: "36rem" }}
          transition={{ duration: 0.85, ease: "easeInOut" }}
          style={{
            backgroundImage:
              "conic-gradient(from 210deg at 50% 0%, rgba(129,140,248,0.55), transparent 55%, rgba(129,140,248,0.35))",
          }}
          className="h-72 blur-3xl"
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
        <motion.div
          initial={{ opacity: 0.2, width: "24rem" }}
          whileInView={{ opacity: 0.65, width: "58rem" }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="h-px bg-gradient-to-r from-transparent via-indigo-400/90 to-transparent dark:via-indigo-300/90"
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-white via-white/85 to-transparent dark:from-black dark:via-black/85" />

      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
