export type MarketingSectionTone = "default" | "muted" | "accent";
export type MarketingSectionPadding = "sm" | "md" | "lg";

export const sectionPaddingClasses: Record<MarketingSectionPadding, string> = {
  sm: "py-12 md:py-16",
  md: "py-16 md:py-24",
  lg: "py-20 md:py-28",
};

export const sectionToneClasses: Record<MarketingSectionTone, string> = {
  default: "bg-background",
  muted: "bg-muted/30",
  accent: "bg-accent/10",
};

export function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function hasWindow() {
  return typeof window !== "undefined";
}
