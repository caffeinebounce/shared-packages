"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";

import { cn } from "../../utils";

export type LampColorTheme =
  | "indigo"
  | "emerald"
  | "cyan"
  | "amber"
  | "rose"
  | "violet"
  | "sky";

interface LampColorValues {
  glow: string;
  glowSecondary: string;
  accentLine: string;
  accentLineDark: string;
  radialLight: string;
  radialDark: string;
}

const LAMP_COLORS: Record<LampColorTheme, LampColorValues> = {
  indigo: {
    glow: "rgba(129,140,248,0.55)",
    glowSecondary: "rgba(129,140,248,0.35)",
    accentLine: "via-indigo-400/90",
    accentLineDark: "dark:via-indigo-300/90",
    radialLight: "rgba(129,140,248,0.10)",
    radialDark: "rgba(129,140,248,0.22)",
  },
  emerald: {
    glow: "rgba(52,211,153,0.55)",
    glowSecondary: "rgba(52,211,153,0.35)",
    accentLine: "via-emerald-400/90",
    accentLineDark: "dark:via-emerald-300/90",
    radialLight: "rgba(52,211,153,0.10)",
    radialDark: "rgba(52,211,153,0.22)",
  },
  cyan: {
    glow: "rgba(34,211,238,0.55)",
    glowSecondary: "rgba(34,211,238,0.35)",
    accentLine: "via-cyan-400/90",
    accentLineDark: "dark:via-cyan-300/90",
    radialLight: "rgba(34,211,238,0.10)",
    radialDark: "rgba(34,211,238,0.22)",
  },
  amber: {
    glow: "rgba(251,191,36,0.55)",
    glowSecondary: "rgba(251,191,36,0.35)",
    accentLine: "via-amber-400/90",
    accentLineDark: "dark:via-amber-300/90",
    radialLight: "rgba(251,191,36,0.10)",
    radialDark: "rgba(251,191,36,0.22)",
  },
  rose: {
    glow: "rgba(251,113,133,0.55)",
    glowSecondary: "rgba(251,113,133,0.35)",
    accentLine: "via-rose-400/90",
    accentLineDark: "dark:via-rose-300/90",
    radialLight: "rgba(251,113,133,0.10)",
    radialDark: "rgba(251,113,133,0.22)",
  },
  violet: {
    glow: "rgba(167,139,250,0.55)",
    glowSecondary: "rgba(167,139,250,0.35)",
    accentLine: "via-violet-400/90",
    accentLineDark: "dark:via-violet-300/90",
    radialLight: "rgba(167,139,250,0.10)",
    radialDark: "rgba(167,139,250,0.22)",
  },
  sky: {
    glow: "rgba(56,189,248,0.55)",
    glowSecondary: "rgba(56,189,248,0.35)",
    accentLine: "via-sky-400/90",
    accentLineDark: "dark:via-sky-300/90",
    radialLight: "rgba(56,189,248,0.10)",
    radialDark: "rgba(56,189,248,0.22)",
  },
};

export interface LampContainerProps {
  children: ReactNode;
  className?: string;
  colorTheme?: LampColorTheme;
}

export function LampContainer({
  children,
  className,
  colorTheme = "indigo",
}: LampContainerProps) {
  const [mounted, setMounted] = useState(false);
  const colors = useMemo(() => LAMP_COLORS[colorTheme], [colorTheme]);

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
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at top, ${colors.radialLight}, transparent 55%)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 hidden dark:block"
        style={{
          backgroundImage: `radial-gradient(circle at top, ${colors.radialDark}, transparent 55%)`,
        }}
      />

      {/* Lamp glow — blur on a STATIC div, width animated via CSS transition (not framer-motion) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
        <div
          className="h-72 transition-all duration-[1200ms] ease-out"
          style={{
            backgroundImage: `conic-gradient(from 210deg at 50% 0%, ${colors.glow}, transparent 55%, ${colors.glowSecondary})`,
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
          className={cn(
            "h-px bg-gradient-to-r from-transparent to-transparent transition-all duration-[1400ms] ease-out",
            colors.accentLine,
            colors.accentLineDark,
          )}
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
