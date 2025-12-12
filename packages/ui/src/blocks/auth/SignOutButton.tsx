"use client";

import type { ComponentProps } from "react";
import { Button } from "../../components/ui/button";

export interface SignOutButtonProps
  extends Omit<ComponentProps<typeof Button>, "onClick"> {
  /** Handler called when sign out is clicked */
  onSignOut: () => void | Promise<void>;
  /** Button text */
  children?: React.ReactNode;
}

/**
 * Sign out button component.
 * Accepts an onSignOut handler for app-specific auth implementation.
 *
 * @example
 * ```tsx
 * <SignOutButton
 *   onSignOut={async () => {
 *     await supabase.auth.signOut();
 *     router.push("/");
 *   }}
 * />
 * ```
 */
export function SignOutButton({
  onSignOut,
  children = "Sign out",
  variant = "outline",
  ...props
}: SignOutButtonProps) {
  return (
    <Button variant={variant} onClick={onSignOut} {...props}>
      {children}
    </Button>
  );
}
