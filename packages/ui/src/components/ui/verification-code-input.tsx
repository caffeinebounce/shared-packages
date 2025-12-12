"use client";

import type * as React from "react";
import { useEffect, useRef, useState } from "react";

import { cn } from "../../utils";

export interface VerificationCodeInputProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
}

function VerificationCodeInput({
  length = 6,
  value = "",
  onChange,
  onComplete,
  disabled = false,
  autoFocus = true,
  className,
}: VerificationCodeInputProps) {
  const [code, setCode] = useState<string[]>(
    value.split("").concat(Array(length - value.length).fill("")),
  );
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    // Sync external value changes
    const newCode = value
      .split("")
      .concat(Array(length - value.length).fill(""));
    setCode(newCode.slice(0, length));
  }, [value, length]);

  // Handle input from the hidden field (for password manager autofill)
  const handleHiddenInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/g, "").slice(0, length);
    const newCode = inputValue
      .split("")
      .concat(Array(length - inputValue.length).fill(""));
    setCode(newCode);
    onChange?.(inputValue);

    // Use setTimeout to ensure focus happens after React state update
    setTimeout(() => {
      if (inputValue.length === length) {
        onComplete?.(inputValue);
        inputRefs.current[length - 1]?.focus();
      } else if (inputValue.length > 0) {
        inputRefs.current[Math.min(inputValue.length, length - 1)]?.focus();
      }
    }, 0);
  };

  const handleChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const inputValue = e.target.value;

    // Handle paste of full code
    if (inputValue.length > 1) {
      const pastedCode = inputValue.replace(/\D/g, "").slice(0, length);
      const newCode = pastedCode
        .split("")
        .concat(Array(length - pastedCode.length).fill(""));
      setCode(newCode);
      onChange?.(pastedCode);

      if (pastedCode.length === length) {
        onComplete?.(pastedCode);
        inputRefs.current[length - 1]?.blur();
      } else {
        inputRefs.current[Math.min(pastedCode.length, length - 1)]?.focus();
      }
      return;
    }

    // Single character input
    const digit = inputValue.replace(/\D/g, "");
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    const codeString = newCode.join("");
    onChange?.(codeString);

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if all digits are filled (no empty strings in array)
    const isComplete = newCode.every((d) => d !== "");
    if (isComplete && codeString.length === length) {
      onComplete?.(codeString);
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      if (!code[index] && index > 0) {
        // Move to previous input on backspace if current is empty
        inputRefs.current[index - 1]?.focus();
        const newCode = [...code];
        newCode[index - 1] = "";
        setCode(newCode);
        onChange?.(newCode.join(""));
      } else {
        // Clear current input
        const newCode = [...code];
        newCode[index] = "";
        setCode(newCode);
        onChange?.(newCode.join(""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    // Remove all non-digit characters (spaces, hyphens, etc.)
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);

    if (pastedData.length === 0) return;

    const newCode = pastedData
      .split("")
      .concat(Array(length - pastedData.length).fill(""));
    setCode(newCode.slice(0, length));
    onChange?.(pastedData);

    // Use setTimeout to ensure focus happens after React state update
    setTimeout(() => {
      if (pastedData.length === length) {
        onComplete?.(pastedData);
        inputRefs.current[length - 1]?.focus();
      } else {
        inputRefs.current[Math.min(pastedData.length, length - 1)]?.focus();
      }
    }, 0);
  };

  // Focus visible inputs when hidden input is focused
  const handleHiddenFocus = () => {
    const firstEmptyIndex = code.indexOf("");
    const targetIndex = firstEmptyIndex === -1 ? 0 : firstEmptyIndex;
    inputRefs.current[targetIndex]?.focus();
  };

  return (
    <div className={cn("relative", className)} onPaste={handlePaste}>
      {/* Hidden input for password manager autofill - positioned to overlay the visible inputs */}
      <input
        ref={hiddenInputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="one-time-code"
        name="otp"
        id="otp-input"
        value={code.join("")}
        onChange={handleHiddenInput}
        onFocus={handleHiddenFocus}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10"
        style={{ caretColor: "transparent" }}
        aria-label="One-time code"
      />

      {/* Visible input boxes */}
      <div className="flex gap-2 justify-center">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
            maxLength={length}
            value={code[index] || ""}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            className={cn(
              "w-12 h-14 text-center text-xl font-semibold rounded-lg border border-input bg-background",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "transition-colors",
            )}
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export { VerificationCodeInput };
