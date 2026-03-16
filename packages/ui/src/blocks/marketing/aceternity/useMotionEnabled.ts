import { useReducedMotion } from "motion/react";

export function useMotionEnabled() {
  const prefersReducedMotion = useReducedMotion();
  return !prefersReducedMotion;
}
