"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { cn } from "../../utils/cn";
import { Button } from "./button";

type ViewMode = "days" | "months" | "years";

export interface ModernCalendarProps {
  /** Currently selected date */
  selected?: Date;
  /** Callback when date is selected */
  onSelect?: (date: Date | undefined) => void;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Additional class name */
  className?: string;
  /** Disable the calendar */
  disabled?: boolean;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/**
 * A modern calendar component with click-through navigation.
 * - Click month/year header → shows month grid
 * - Click year in month grid → shows year grid
 * - Selecting navigates back to day view
 */
function ModernCalendar({
  selected,
  onSelect,
  minDate,
  maxDate,
  className,
  disabled = false,
}: ModernCalendarProps) {
  const today = new Date();
  const [viewDate, setViewDate] = React.useState(selected || today);
  const [viewMode, setViewMode] = React.useState<ViewMode>("days");
  const [yearRangeStart, setYearRangeStart] = React.useState(
    Math.floor((selected?.getFullYear() || today.getFullYear()) / 12) * 12,
  );

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Check if date is today
  const isToday = (date: Date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Check if date is selected
  const isSelected = (date: Date) => {
    if (!selected) return false;
    return (
      date.getDate() === selected.getDate() &&
      date.getMonth() === selected.getMonth() &&
      date.getFullYear() === selected.getFullYear()
    );
  };

  // Check if date is disabled
  const isDateDisabled = (date: Date) => {
    if (disabled) return true;
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  // Navigate months
  const goToPreviousMonth = () => {
    setViewDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setViewDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  // Navigate years in year view
  const goToPreviousYearRange = () => {
    setYearRangeStart((prev) => prev - 12);
  };

  const goToNextYearRange = () => {
    setYearRangeStart((prev) => prev + 12);
  };

  // Handle month selection
  const handleMonthSelect = (month: number) => {
    setViewDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(month);
      return newDate;
    });
    setViewMode("days");
  };

  // Handle year selection
  const handleYearSelect = (year: number) => {
    setViewDate((prev) => {
      const newDate = new Date(prev);
      newDate.setFullYear(year);
      return newDate;
    });
    setViewMode("months");
  };

  // Handle day selection
  const handleDaySelect = (day: number, monthOffset: number = 0) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(viewDate.getMonth() + monthOffset);
    newDate.setDate(day);

    if (!isDateDisabled(newDate)) {
      onSelect?.(newDate);
      if (monthOffset !== 0) {
        setViewDate(newDate);
      }
    }
  };

  // Handle header click
  const handleHeaderClick = () => {
    if (viewMode === "days") {
      setViewMode("months");
    } else if (viewMode === "months") {
      setYearRangeStart(Math.floor(viewDate.getFullYear() / 12) * 12);
      setViewMode("years");
    }
  };

  // Render day grid
  const renderDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const daysInPrevMonth = getDaysInMonth(year, month - 1);

    const days: React.ReactNode[] = [];

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const date = new Date(year, month - 1, day);
      days.push(
        <button
          key={`prev-${day}`}
          type="button"
          onClick={() => handleDaySelect(day, -1)}
          disabled={isDateDisabled(date)}
          className={cn(
            "h-9 w-9 rounded-md text-sm text-muted-foreground/50 hover:bg-accent hover:text-accent-foreground transition-colors",
            "disabled:pointer-events-none disabled:opacity-30",
          )}
        >
          {day}
        </button>,
      );
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isCurrentDay = isToday(date);
      const isSelectedDay = isSelected(date);
      const isDisabled = isDateDisabled(date);

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDaySelect(day)}
          disabled={isDisabled}
          className={cn(
            "h-9 w-9 rounded-md text-sm transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:pointer-events-none disabled:opacity-30",
            isCurrentDay &&
              !isSelectedDay &&
              "bg-accent text-accent-foreground",
            isSelectedDay &&
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
          )}
        >
          {day}
        </button>,
      );
    }

    // Next month days
    const remainingSlots = 42 - days.length;
    for (let day = 1; day <= remainingSlots; day++) {
      const date = new Date(year, month + 1, day);
      days.push(
        <button
          key={`next-${day}`}
          type="button"
          onClick={() => handleDaySelect(day, 1)}
          disabled={isDateDisabled(date)}
          className={cn(
            "h-9 w-9 rounded-md text-sm text-muted-foreground/50 hover:bg-accent hover:text-accent-foreground transition-colors",
            "disabled:pointer-events-none disabled:opacity-30",
          )}
        >
          {day}
        </button>,
      );
    }

    return days;
  };

  // Render month grid
  const renderMonths = () => {
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const selectedMonth = selected?.getMonth();
    const selectedYear = selected?.getFullYear();
    const viewYear = viewDate.getFullYear();

    return MONTHS.map((month, index) => {
      const isCurrentMonth = index === currentMonth && viewYear === currentYear;
      const isSelectedMonth =
        index === selectedMonth && viewYear === selectedYear;

      return (
        <button
          key={month}
          type="button"
          onClick={() => handleMonthSelect(index)}
          className={cn(
            "h-10 rounded-md text-sm font-medium transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isCurrentMonth &&
              !isSelectedMonth &&
              "bg-accent text-accent-foreground",
            isSelectedMonth &&
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
          )}
        >
          {month}
        </button>
      );
    });
  };

  // Render year grid
  const renderYears = () => {
    const years: React.ReactNode[] = [];
    const currentYear = today.getFullYear();
    const selectedYear = selected?.getFullYear();

    for (let i = 0; i < 12; i++) {
      const year = yearRangeStart + i;
      const isCurrentYear = year === currentYear;
      const isSelectedYear = year === selectedYear;

      years.push(
        <button
          key={year}
          type="button"
          onClick={() => handleYearSelect(year)}
          className={cn(
            "h-10 rounded-md text-sm font-medium transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isCurrentYear &&
              !isSelectedYear &&
              "bg-accent text-accent-foreground",
            isSelectedYear &&
              "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
          )}
        >
          {year}
        </button>,
      );
    }

    return years;
  };

  return (
    <div className={cn("p-3 w-[280px]", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={
            viewMode === "days"
              ? goToPreviousMonth
              : viewMode === "years"
                ? goToPreviousYearRange
                : undefined
          }
          disabled={viewMode === "months"}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <button
          type="button"
          onClick={handleHeaderClick}
          disabled={viewMode === "years"}
          className={cn(
            "text-sm font-medium px-2 py-1 rounded-md transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            viewMode === "years" && "cursor-default hover:bg-transparent",
          )}
        >
          {viewMode === "days" && (
            <>
              {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
            </>
          )}
          {viewMode === "months" && viewDate.getFullYear()}
          {viewMode === "years" && (
            <>
              {yearRangeStart} – {yearRangeStart + 11}
            </>
          )}
        </button>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={
            viewMode === "days"
              ? goToNextMonth
              : viewMode === "years"
                ? goToNextYearRange
                : undefined
          }
          disabled={viewMode === "months"}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day View */}
      {viewMode === "days" && (
        <>
          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="h-9 flex items-center justify-center text-xs font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7">{renderDays()}</div>
        </>
      )}

      {/* Month View */}
      {viewMode === "months" && (
        <div className="grid grid-cols-3 gap-2">{renderMonths()}</div>
      )}

      {/* Year View */}
      {viewMode === "years" && (
        <div className="grid grid-cols-3 gap-2">{renderYears()}</div>
      )}
    </div>
  );
}

ModernCalendar.displayName = "ModernCalendar";

export { ModernCalendar };
