"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * Toast notification component using sonner.
 *
 * Uses sonner's built-in richColors for consistent styling that works
 * without requiring Tailwind compilation of dynamic class variants.
 *
 * The richColors prop (passed from RootLayout) handles all the colored
 * backgrounds for success/error/warning/info toasts automatically.
 */
function Toaster({ ...props }: ToasterProps) {
  return <Sonner {...props} />;
}

export { Toaster };
