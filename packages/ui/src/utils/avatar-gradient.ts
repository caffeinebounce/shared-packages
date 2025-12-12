/**
 * Avatar gradient utilities
 * Generates consistent gradient colors for user avatars based on user ID
 */

import type { CSSProperties } from "react";

// Bold two-color gradient pairs for eye-catching avatars
const GRADIENT_PAIRS = [
  // Vibrant contrasts
  { from: "#f97316", to: "#ec4899" }, // Orange → Pink
  { from: "#ef4444", to: "#a855f7" }, // Red → Purple
  { from: "#f59e0b", to: "#ef4444" }, // Amber → Red
  { from: "#ec4899", to: "#8b5cf6" }, // Pink → Violet
  { from: "#f43f5e", to: "#fb923c" }, // Rose → Orange

  // Cool gradients
  { from: "#3b82f6", to: "#a855f7" }, // Blue → Purple
  { from: "#6366f1", to: "#ec4899" }, // Indigo → Pink
  { from: "#8b5cf6", to: "#06b6d4" }, // Violet → Cyan
  { from: "#a855f7", to: "#3b82f6" }, // Purple → Blue
  { from: "#06b6d4", to: "#10b981" }, // Cyan → Emerald

  // Bold combos
  { from: "#10b981", to: "#3b82f6" }, // Emerald → Blue
  { from: "#14b8a6", to: "#8b5cf6" }, // Teal → Violet
  { from: "#22c55e", to: "#06b6d4" }, // Green → Cyan
  { from: "#0ea5e9", to: "#f43f5e" }, // Sky → Rose
  { from: "#eab308", to: "#22c55e" }, // Yellow → Green
] as const;

/**
 * Simple hash function to convert a string to a number
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export interface AvatarGradient {
  from: string;
  to: string;
  style: CSSProperties;
  className: string;
}

/**
 * Get a consistent gradient for a user based on their ID.
 * The same ID will always produce the same gradient.
 *
 * @param userId - A unique identifier (user ID, email, etc.)
 * @returns An object with gradient colors, inline style, and className
 *
 * @example
 * ```tsx
 * const gradient = getAvatarGradient(user.id);
 *
 * <div style={gradient.style} className={gradient.className}>
 *   {initials}
 * </div>
 * ```
 */
export function getAvatarGradient(userId: string): AvatarGradient {
  const index = hashString(userId) % GRADIENT_PAIRS.length;
  const gradient = GRADIENT_PAIRS[index];

  return {
    from: gradient.from,
    to: gradient.to,
    style: {
      background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
    },
    className: "text-white",
  };
}

/**
 * Get the gradient index for a user (useful for storing/debugging)
 */
export function getGradientIndex(userId: string): number {
  return hashString(userId) % GRADIENT_PAIRS.length;
}

/**
 * Get all available gradient pairs
 */
export function getGradientPairs() {
  return GRADIENT_PAIRS;
}
