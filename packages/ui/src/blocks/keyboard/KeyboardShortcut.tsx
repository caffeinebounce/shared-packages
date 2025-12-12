"use client";

import type { ComponentProps } from "react";
import { Kbd } from "../../components/ui/kbd";

export interface KeyboardShortcutProps extends ComponentProps<typeof Kbd> {
  /** Whether shortcuts are visible (respects user preference) */
  visible?: boolean;
  /** Force show regardless of visibility setting */
  forceShow?: boolean;
}

/**
 * Keyboard shortcut indicator that can respect user accessibility preferences.
 * Use `visible` prop to control based on user settings, or `forceShow` to always display.
 */
export function KeyboardShortcut({
  visible = true,
  forceShow = false,
  ...props
}: KeyboardShortcutProps) {
  if (!forceShow && !visible) {
    return null;
  }

  return <Kbd {...props} />;
}
