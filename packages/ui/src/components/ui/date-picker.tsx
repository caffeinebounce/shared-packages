"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";
import type { DateRange, Matcher } from "react-day-picker";
import { cn } from "../../utils/cn";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { ModernCalendar } from "./modern-calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export interface DatePickerProps {
  /** The selected date value */
  value?: Date;
  /** Callback when the date changes */
  onChange?: (date: Date | undefined) => void;
  /** Placeholder text when no date is selected */
  placeholder?: string;
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** Optional className for the trigger button */
  className?: string;
  /** Format string for displaying the date (date-fns format) */
  dateFormat?: string;
  /** Minimum selectable date */
  fromDate?: Date;
  /** Maximum selectable date */
  toDate?: Date;
  /** Dates that should be disabled */
  disabledDates?: Date[];
  /** Size variant */
  size?: "sm" | "default" | "lg";
  /** Alignment of the popover */
  align?: "start" | "center" | "end";
  /** Whether the picker has a validation error */
  error?: boolean;
}

const sizeClasses = {
  sm: "h-8 text-xs",
  default: "h-9 text-sm",
  lg: "h-10 text-base",
};

/**
 * A date picker component that combines a button trigger with a calendar popover.
 * Built on react-day-picker and Radix UI Popover.
 */
export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
  className,
  dateFormat = "PPP",
  fromDate,
  toDate,
  disabledDates: _disabledDates,
  size = "default",
  align = "start",
  error = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (date: Date | undefined) => {
    onChange?.(date);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-auto justify-start text-left font-normal",
            !value && "text-muted-foreground",
            error && "border-destructive focus:ring-destructive",
            sizeClasses[size],
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, dateFormat) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <ModernCalendar
          selected={value}
          onSelect={handleSelect}
          minDate={fromDate}
          maxDate={toDate}
        />
      </PopoverContent>
    </Popover>
  );
}

export interface DateRangePickerProps {
  /** The selected date range */
  value?: DateRange;
  /** Callback when the date range changes */
  onChange?: (range: DateRange | undefined) => void;
  /** Placeholder text when no date is selected */
  placeholder?: string;
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** Optional className for the trigger button */
  className?: string;
  /** Format string for displaying dates (date-fns format) */
  dateFormat?: string;
  /** Minimum selectable date */
  fromDate?: Date;
  /** Maximum selectable date */
  toDate?: Date;
  /** Size variant */
  size?: "sm" | "default" | "lg";
  /** Number of months to display */
  numberOfMonths?: number;
  /** Alignment of the popover */
  align?: "start" | "center" | "end";
}

/**
 * A date range picker component for selecting a start and end date.
 */
export function DateRangePicker({
  value,
  onChange,
  placeholder = "Pick a date range",
  disabled = false,
  className,
  dateFormat = "LLL dd, y",
  fromDate,
  toDate,
  size = "default",
  numberOfMonths = 2,
  align = "start",
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Build disabled matcher for calendar
  const disabledMatcher = React.useMemo((): Matcher[] | undefined => {
    const matchers: Matcher[] = [];

    if (fromDate) {
      matchers.push({ before: fromDate });
    }
    if (toDate) {
      matchers.push({ after: toDate });
    }

    return matchers.length > 0 ? matchers : undefined;
  }, [fromDate, toDate]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value?.from && "text-muted-foreground",
            sizeClasses[size],
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value?.from ? (
            value.to ? (
              <>
                {format(value.from, dateFormat)} -{" "}
                {format(value.to, dateFormat)}
              </>
            ) : (
              format(value.from, dateFormat)
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <Calendar
          mode="range"
          selected={value}
          onSelect={onChange}
          disabled={disabledMatcher}
          defaultMonth={value?.from}
          numberOfMonths={numberOfMonths}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
