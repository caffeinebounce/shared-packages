"use client";

import { Minus, Plus } from "lucide-react";
import * as React from "react";
import { cn } from "../../utils/cn";

export interface NumberStepperProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "type" | "size"
  > {
  /** Current value */
  value: number;
  /** Callback when value changes */
  onChange: (value: number) => void;
  /** Minimum allowed value */
  min?: number;
  /** Maximum allowed value */
  max?: number;
  /** Step increment/decrement amount */
  step?: number;
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: {
    wrapper: "h-7",
    button: "h-7 w-7",
    input: "h-7 w-12 text-xs",
    icon: "h-3 w-3",
  },
  md: {
    wrapper: "h-8",
    button: "h-8 w-8",
    input: "h-8 w-14 text-sm",
    icon: "h-3.5 w-3.5",
  },
  lg: {
    wrapper: "h-10",
    button: "h-10 w-10",
    input: "h-10 w-16 text-base",
    icon: "h-4 w-4",
  },
};

/**
 * A number input with increment/decrement buttons.
 * Provides a cleaner alternative to browser default number inputs.
 *
 * @default min - 0 (allows zero, override for positive-only)
 */
export function NumberStepper({
  value,
  onChange,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  size = "md",
  disabled,
  className,
  ...props
}: NumberStepperProps) {
  const sizes = sizeClasses[size];
  
  // Track internal string state to allow intermediate values while typing
  const [inputValue, setInputValue] = React.useState(value.toString());
  const [isFocused, setIsFocused] = React.useState(false);
  
  // Sync internal state when external value changes (but not while focused/editing)
  React.useEffect(() => {
    if (!isFocused) {
      setInputValue(value.toString());
    }
  }, [value, isFocused]);

  const handleDecrement = () => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
    setInputValue(newValue.toString());
  };

  const handleIncrement = () => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
    setInputValue(newValue.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    
    // Allow empty string and partial numbers while typing
    if (inputVal === "" || /^[0-9]*$/.test(inputVal)) {
      setInputValue(inputVal);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    
    // On blur, validate and clamp the value
    if (inputValue === "") {
      onChange(min);
      setInputValue(min.toString());
      return;
    }
    
    const numValue = Number.parseInt(inputValue, 10);
    if (Number.isNaN(numValue)) {
      onChange(min);
      setInputValue(min.toString());
    } else {
      const clampedValue = Math.min(max, Math.max(min, numValue));
      onChange(clampedValue);
      setInputValue(clampedValue.toString());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      handleDecrement();
    }
  };

  const canDecrement = !disabled && value > min;
  const canIncrement = !disabled && value < max;

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border border-input bg-transparent dark:bg-input/30",
        disabled && "opacity-50",
        sizes.wrapper,
        className,
      )}
    >
      {/* Decrement Button */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={!canDecrement}
        className={cn(
          "inline-flex items-center justify-center border-r border-input",
          "text-muted-foreground hover:text-foreground hover:bg-muted/50",
          "transition-colors disabled:opacity-50 disabled:pointer-events-none",
          "rounded-l-md",
          sizes.button,
        )}
        tabIndex={-1}
        aria-label="Decrease value"
      >
        <Minus className={sizes.icon} />
      </button>

      {/* Input */}
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        className={cn(
          "border-0 bg-transparent text-center focus:outline-none focus:ring-0",
          "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          sizes.input,
        )}
        {...props}
      />

      {/* Increment Button */}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={!canIncrement}
        className={cn(
          "inline-flex items-center justify-center border-l border-input",
          "text-muted-foreground hover:text-foreground hover:bg-muted/50",
          "transition-colors disabled:opacity-50 disabled:pointer-events-none",
          "rounded-r-md",
          sizes.button,
        )}
        tabIndex={-1}
        aria-label="Increase value"
      >
        <Plus className={sizes.icon} />
      </button>
    </div>
  );
}
