"use client";

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "../../utils";

/**
 * Props for the BackgroundRippleEffect component
 */
export interface BackgroundRippleEffectProps {
  /** Number of rows in the grid */
  rows?: number;
  /** Number of columns in the grid. If omitted, auto-calculates to fill viewport width. */
  cols?: number;
  /** Size of each cell in pixels */
  cellSize?: number;
  /** Additional className for the container */
  className?: string;
  /** Whether to apply the radial mask (fades out edges). Default: true */
  mask?: boolean;
}

/**
 * An interactive grid background with ripple animation on click.
 * Creates a visual effect where cells animate outward from the click point.
 *
 * @example
 * ```tsx
 * <div className="relative h-96">
 *   <BackgroundRippleEffect rows={8} cols={20} />
 *   <div className="relative z-10">Content on top</div>
 * </div>
 * ```
 */
export function BackgroundRippleEffect({
  rows = 8,
  cols, // No default - undefined means "auto-calculate"
  cellSize = 56,
  className,
  mask = true,
}: BackgroundRippleEffectProps) {
  const [clickedCell, setClickedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [rippleKey, setRippleKey] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  // Track viewport width for dynamic column calculation
  const [viewportWidth, setViewportWidth] = useState<number>(0);

  // Measure viewport width on mount and resize (debounced for performance)
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const updateWidth = () => {
      setViewportWidth(window.innerWidth);
    };

    const debouncedUpdateWidth = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateWidth, 100);
    };

    // Initial measurement without debounce
    updateWidth();

    window.addEventListener("resize", debouncedUpdateWidth);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", debouncedUpdateWidth);
    };
  }, []);

  const resolvedCellSize = cellSize;
  const resolvedRows = rows;

  // Dynamic column calculation: if cols is undefined, calculate based on viewport width
  const resolvedCols = useMemo(() => {
    // If cols is explicitly provided, use it
    if (cols !== undefined) {
      return cols;
    }

    // Use measured viewport width, or a generous default for SSR
    const width = viewportWidth > 0 ? viewportWidth : 3840; // Default to 4K for SSR

    // Add extra columns to ensure we always overflow slightly (better than gap)
    const neededCols = Math.ceil(width / resolvedCellSize) + 5;

    return Math.max(10, neededCols);
  }, [cols, resolvedCellSize, viewportWidth]);

  return (
    <div
      ref={ref}
      className={cn(
        "absolute inset-0 h-full z-0 w-screen left-0",
        "[--cell-border-color:var(--color-neutral-300)] [--cell-fill-color:var(--color-neutral-100)] [--cell-shadow-color:var(--color-neutral-500)]",
        "dark:[--cell-border-color:rgba(255,255,255,0.2)] dark:[--cell-fill-color:rgba(255,255,255,0.08)] dark:[--cell-shadow-color:rgba(255,255,255,0.1)]",
        className,
      )}
    >
      <div className="relative h-full overflow-hidden w-screen">
        <div className="pointer-events-none absolute inset-0 z-2 h-full w-full overflow-hidden" />
        <DivGrid
          key={`base-${rippleKey}`}
          className={cn(
            "opacity-80",
            mask && "mask-radial-from-70% mask-radial-at-top",
          )}
          rows={resolvedRows}
          cols={resolvedCols}
          cellSize={resolvedCellSize}
          borderColor="var(--cell-border-color)"
          fillColor="var(--cell-fill-color)"
          clickedCell={clickedCell}
          onCellClick={(row, col) => {
            setClickedCell({ row, col });
            setRippleKey((k) => k + 1);
          }}
          interactive
        />
      </div>
    </div>
  );
}

interface DivGridProps {
  className?: string;
  rows: number;
  cols: number;
  cellSize: number;
  borderColor: string;
  fillColor: string;
  clickedCell: { row: number; col: number } | null;
  onCellClick?: (row: number, col: number) => void;
  interactive?: boolean;
}

type CellStyle = React.CSSProperties & {
  "--delay"?: string;
  "--duration"?: string;
};

function DivGrid({
  className,
  rows = 7,
  cols = 30,
  cellSize = 56,
  borderColor = "#3f3f46",
  fillColor = "rgba(14,165,233,0.3)",
  clickedCell = null,
  onCellClick = () => {},
  interactive = true,
}: DivGridProps) {
  const cells = useMemo(
    () => Array.from({ length: rows * cols }, (_, idx) => idx),
    [rows, cols],
  );

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
    gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
    width: cols * cellSize,
    height: rows * cellSize,
    marginInline: 0,
  };

  return (
    <div className={cn("relative z-3", className)} style={gridStyle}>
      {cells.map((idx) => {
        const rowIdx = Math.floor(idx / cols);
        const colIdx = idx % cols;
        const distance = clickedCell
          ? Math.hypot(clickedCell.row - rowIdx, clickedCell.col - colIdx)
          : 0;
        const delay = clickedCell ? Math.max(0, distance * 55) : 0;
        const duration = 200 + distance * 80;

        const style: CellStyle = clickedCell
          ? {
              "--delay": `${delay}ms`,
              "--duration": `${duration}ms`,
            }
          : {};

        return (
          <div
            role="presentation"
            aria-hidden="true"
            key={idx}
            className={cn(
              "cell relative border-[0.5px] opacity-50 transition-opacity duration-150 will-change-transform hover:opacity-100 dark:shadow-[0px_0px_40px_1px_var(--cell-shadow-color)_inset]",
              clickedCell && "animate-cell-ripple fill-mode-none",
              !interactive && "pointer-events-none",
            )}
            style={{
              backgroundColor: fillColor,
              borderColor: borderColor,
              ...style,
            }}
            onClick={
              interactive ? () => onCellClick?.(rowIdx, colIdx) : undefined
            }
          />
        );
      })}
    </div>
  );
}
