"use client";

import { toast as sonnerToast } from "sonner";

/**
 * Toast options compatible with shadcn/ui toast pattern
 */
export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
}

/**
 * Toast function that wraps sonner's API with shadcn/ui-compatible interface
 */
function toast(options: ToastOptions) {
  const { title, description, variant, duration } = options;
  const message = title || description || "";
  const toastOptions = {
    description: title ? description : undefined,
    duration,
  };

  if (variant === "destructive") {
    return sonnerToast.error(message, toastOptions);
  }

  return sonnerToast(message, toastOptions);
}

/**
 * Hook providing shadcn/ui-compatible toast interface using sonner.
 *
 * @example
 * ```tsx
 * const { toast } = useToast();
 *
 * toast({
 *   title: "Success",
 *   description: "Your changes have been saved.",
 * });
 *
 * toast({
 *   title: "Error",
 *   description: "Something went wrong.",
 *   variant: "destructive",
 * });
 * ```
 */
export function useToast() {
  return { toast };
}
