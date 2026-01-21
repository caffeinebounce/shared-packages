"use client";

import { CheckIcon } from "lucide-react";
import type * as React from "react";

import { cn } from "../../utils";

interface CheckboxProps
  extends Omit<React.ComponentProps<"input">, "type" | "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

/**
 * Checkbox - Checkable input for binary choices
 *
 * @example
 * <Checkbox checked={isChecked} onCheckedChange={setIsChecked} />
 *
 * @example
 * <label>
 *   <Checkbox checked={agree} onCheckedChange={setAgree} />
 *   I agree to the terms
 * </label>
 */
function Checkbox({
  className,
  checked,
  onCheckedChange,
  disabled,
  ...props
}: CheckboxProps) {
  return (
    <label
      className={cn(
        "inline-flex items-center",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      <span className="relative">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          className="peer sr-only"
          {...props}
        />
        <span
          data-slot="checkbox"
          className={cn(
            "border-input bg-background peer-focus-visible:ring-ring/50 peer-focus-visible:ring-[3px] flex size-4 shrink-0 items-center justify-center rounded-sm border shadow-xs transition-colors",
            "peer-checked:bg-primary peer-checked:border-primary peer-checked:text-primary-foreground",
            "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            className,
          )}
        >
          {checked && <CheckIcon className="size-3.5 stroke-3" />}
        </span>
      </span>
    </label>
  );
}

export { Checkbox };
export type { CheckboxProps };
