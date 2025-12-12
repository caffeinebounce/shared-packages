"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:shadow-lg group-[.toaster]:border",
          error:
            "group-[.toaster]:bg-destructive group-[.toaster]:text-destructive-foreground group-[.toaster]:border-destructive",
          success:
            "group-[.toaster]:bg-emerald-500 group-[.toaster]:text-white group-[.toaster]:border-emerald-500",
          warning:
            "group-[.toaster]:bg-amber-500 group-[.toaster]:text-white group-[.toaster]:border-amber-500",
          info: "group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border",
          description: "group-[.toast]:text-current/80",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
