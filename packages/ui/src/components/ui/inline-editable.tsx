"use client";

import { Calendar, Loader2, X } from "lucide-react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { cn } from "../../utils/cn";
import { Button } from "./button";
import { DatePicker } from "./date-picker";

// ─────────────────────────────────────────────────────────────────────────────
// Shared Types
// ─────────────────────────────────────────────────────────────────────────────

export interface InlineEditableBaseProps {
  /** Current value */
  value: string;
  /** Save handler - receives new value */
  onSave: (value: string) => void;
  /** Whether a save operation is in progress */
  isLoading?: boolean;
  /** Placeholder when value is empty */
  placeholder?: string;
  /** Additional className */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// InlineEditableText
// ─────────────────────────────────────────────────────────────────────────────

export interface InlineEditableTextProps extends InlineEditableBaseProps {
  /** Whether to render as multiline textarea */
  multiline?: boolean;
  /** Max length for input */
  maxLength?: number;
  /** Number of rows for textarea (when multiline=true) */
  rows?: number;
}

/**
 * InlineEditableText - Click-to-edit text field with inline editing.
 *
 * @example
 * // Basic usage
 * <InlineEditableText
 *   value={title}
 *   onSave={(newValue) => updateTitle(newValue)}
 *   placeholder="Enter title..."
 * />
 *
 * @example
 * // Multiline
 * <InlineEditableText
 *   value={description}
 *   onSave={handleSave}
 *   multiline
 *   rows={3}
 * />
 */
export function InlineEditableText({
  value,
  onSave,
  isLoading,
  placeholder = "Click to edit...",
  className,
  multiline = false,
  maxLength,
  rows = 2,
}: InlineEditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing) {
      if (multiline && textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
      } else if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }
  }, [isEditing, multiline]);

  const handleSave = () => {
    const trimmedValue = editValue.trim();
    if (trimmedValue !== value) {
      onSave(trimmedValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    if (multiline) {
      return (
        <div className="flex items-start gap-1 w-full">
          <textarea
            ref={textareaRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            disabled={isLoading}
            className={cn(
              "flex-1 bg-transparent border-none outline-none resize-none",
              "text-muted-foreground focus:text-foreground min-h-[40px]",
              "border-b border-dashed border-primary/50 focus:border-primary",
              className,
            )}
            placeholder={placeholder}
            rows={rows}
          />
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mt-1" />
          )}
        </div>
      );
    }

    return (
      <span className="inline-flex items-center gap-1">
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          disabled={isLoading}
          maxLength={maxLength}
          className={cn(
            "bg-transparent border-none outline-none",
            "border-b border-dashed border-primary/50 focus:border-primary",
            className,
          )}
          placeholder={placeholder}
          style={{
            width: `${Math.max(editValue.length, placeholder.length) + 2}ch`,
          }}
        />
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className={cn(
        "text-left hover:text-primary transition-colors cursor-pointer",
        "border-b border-transparent hover:border-dashed hover:border-primary/30",
        !value && "text-muted-foreground/60 italic text-sm",
        className,
      )}
    >
      {value || placeholder}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// InlineEditableDate
// ─────────────────────────────────────────────────────────────────────────────

export interface InlineEditableDateProps extends InlineEditableBaseProps {
  /** Date format for display (default: localized date string) */
  formatDisplay?: (date: Date) => string;
}

/**
 * InlineEditableDate - Click-to-edit date field with date picker.
 *
 * @example
 * <InlineEditableDate
 *   value={startDate}
 *   onSave={(newDate) => updateStartDate(newDate)}
 *   placeholder="Select date..."
 * />
 */
export function InlineEditableDate({
  value,
  onSave,
  isLoading,
  placeholder = "Select date...",
  className,
  formatDisplay,
}: InlineEditableDateProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      const newValue = date.toISOString().split("T")[0];
      if (newValue !== value) {
        onSave(newValue);
      }
    }
    setIsEditing(false);
  };

  const displayDate = () => {
    if (!value) return placeholder;
    const date = new Date(value);
    if (formatDisplay) return formatDisplay(date);
    return date.toLocaleDateString();
  };

  if (isEditing) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <DatePicker
          value={value ? new Date(value) : undefined}
          onChange={handleDateChange}
        />
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-transparent hover:text-primary"
          onClick={() => setIsEditing(false)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className={cn(
        "flex items-center gap-1 text-sm text-muted-foreground",
        "hover:text-foreground transition-colors cursor-pointer",
        className,
      )}
    >
      <Calendar className="h-4 w-4" />
      {displayDate()}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// InlineEditableSelect
// ─────────────────────────────────────────────────────────────────────────────

export interface SelectOption<T = string> {
  value: T;
  label: string;
}

export interface InlineEditableSelectProps<T = string>
  extends Omit<InlineEditableBaseProps, "value" | "onSave"> {
  /** Options for the select */
  options: SelectOption<T>[];
  /** Save handler - receives selected value */
  onSave: (value: T) => void;
  /** Current value (must match an option value) */
  value: T;
}

/**
 * InlineEditableSelect - Click-to-edit dropdown select field.
 *
 * @example
 * <InlineEditableSelect
 *   value={status}
 *   options={[
 *     { value: 'active', label: 'Active' },
 *     { value: 'inactive', label: 'Inactive' },
 *   ]}
 *   onSave={(newStatus) => updateStatus(newStatus)}
 * />
 */
export function InlineEditableSelect<T = string>({
  value,
  options,
  onSave,
  isLoading,
  placeholder = "Select...",
  className,
}: InlineEditableSelectProps<T>) {
  const [isEditing, setIsEditing] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (isEditing && selectRef.current) {
      selectRef.current.focus();
    }
  }, [isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value as unknown as T;
    if (selectedValue !== value) {
      onSave(selectedValue);
    }
    setIsEditing(false);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLSelectElement>) => {
    if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  const currentLabel =
    options.find((opt) => opt.value === value)?.label || placeholder;

  if (isEditing) {
    return (
      <span className="inline-flex items-center gap-1">
        <select
          ref={selectRef}
          value={value as string}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          className={cn(
            "bg-transparent border-none outline-none cursor-pointer",
            "border-b border-dashed border-primary/50 focus:border-primary",
            "text-foreground",
            className,
          )}
        >
          {options.map((option) => (
            <option key={String(option.value)} value={String(option.value)}>
              {option.label}
            </option>
          ))}
        </select>
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className={cn(
        "text-left hover:text-primary transition-colors cursor-pointer",
        "border-b border-transparent hover:border-dashed hover:border-primary/30",
        !value && "text-muted-foreground/60 italic text-sm",
        className,
      )}
    >
      {currentLabel}
    </button>
  );
}
