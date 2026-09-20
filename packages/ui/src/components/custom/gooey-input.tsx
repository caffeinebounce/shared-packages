"use client";

import { Search, X } from "lucide-react";
import { motion } from "motion/react";
import * as React from "react";

import { cn } from "../../utils";

export type GooeyInputClassNames = {
  root?: string;
  filterWrap?: string;
  buttonRow?: string;
  trigger?: string;
  input?: string;
  clearButton?: string;
  bubble?: string;
  bubbleSurface?: string;
};

export interface GooeyInputProps
  extends Omit<
    React.ComponentProps<"input">,
    "className" | "defaultValue" | "disabled" | "onChange" | "value"
  > {
  className?: string;
  classNames?: GooeyInputClassNames;
  compactBreakpoint?: number;
  collapsedWidth?: number;
  compactOnNarrow?: boolean;
  defaultValue?: string;
  disabled?: boolean;
  expandFrom?: "left" | "right";
  expandedOffset?: number;
  expandedWidth?: number;
  gooeyBlur?: number;
  onOpenChange?: (open: boolean) => void;
  onValueChange?: (value: string) => void;
  reserveExpandedSpace?: boolean;
  value?: string;
}

const DEFAULT_COLLAPSED_WIDTH = 115;
const DEFAULT_EXPANDED_OFFSET = 50;
const DEFAULT_EXPANDED_WIDTH = 200;
const DEFAULT_GOOEY_BLUR = 5;

function sanitizeId(id: string) {
  return id.replace(/[^a-zA-Z0-9_-]/g, "");
}

function GooeyInput({
  className,
  classNames,
  compactBreakpoint,
  collapsedWidth = DEFAULT_COLLAPSED_WIDTH,
  compactOnNarrow = false,
  defaultValue = "",
  disabled = false,
  expandFrom = "left",
  expandedOffset = DEFAULT_EXPANDED_OFFSET,
  expandedWidth = DEFAULT_EXPANDED_WIDTH,
  gooeyBlur = DEFAULT_GOOEY_BLUR,
  onBlur,
  onFocus,
  onKeyDown,
  onOpenChange,
  onValueChange,
  placeholder = "Type to search...",
  reserveExpandedSpace = false,
  style,
  value,
  ...props
}: GooeyInputProps) {
  const reactId = React.useId();
  const filterId = React.useMemo(
    () => `gooey-input-${sanitizeId(reactId)}`,
    [reactId],
  );
  const rootRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [isOpen, setIsOpen] = React.useState(Boolean(value ?? defaultValue));
  const [availableWidth, setAvailableWidth] = React.useState<number | null>(
    null,
  );
  const [viewportWidth, setViewportWidth] = React.useState<number | null>(null);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;
  const visualOpen = isOpen || Boolean(currentValue);
  const baseInputPaddingLeft = Math.max(expandedOffset, 48);
  const isViewportConstrained =
    compactBreakpoint !== undefined &&
    viewportWidth !== null &&
    viewportWidth <= compactBreakpoint;
  const isContainerConstrained =
    compactBreakpoint === undefined &&
    availableWidth !== null &&
    availableWidth < expandedWidth;
  const isConstrained =
    compactOnNarrow && (isViewportConstrained || isContainerConstrained);
  const effectiveCollapsedWidth =
    isConstrained && !currentValue ? baseInputPaddingLeft : collapsedWidth;
  const requestedVisualWidth = visualOpen
    ? expandedWidth
    : effectiveCollapsedWidth;
  const requestedOuterWidth = reserveExpandedSpace
    ? expandedWidth
    : requestedVisualWidth;
  const maxAvailableWidth =
    availableWidth === null
      ? requestedOuterWidth
      : Math.max(baseInputPaddingLeft, Math.floor(availableWidth));
  const outerWidth = Math.min(requestedOuterWidth, maxAvailableWidth);
  const visualWidth = Math.min(requestedVisualWidth, outerWidth);
  const visualX =
    expandFrom === "right" ? Math.max(0, outerWidth - visualWidth) : 0;
  const inputPaddingLeft = Math.min(baseInputPaddingLeft, visualWidth);
  const inputPaddingRight = currentValue ? 44 : 16;

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      setIsOpen(nextOpen);
      onOpenChange?.(nextOpen);
    },
    [onOpenChange],
  );

  const setNextValue = React.useCallback(
    (nextValue: string) => {
      if (!isControlled) {
        setInternalValue(nextValue);
      }
      onValueChange?.(nextValue);
    },
    [isControlled, onValueChange],
  );

  React.useEffect(() => {
    const root = rootRef.current;
    const target = root?.parentElement ?? root;

    if (!target) {
      return;
    }

    let frame = 0;

    const updateAvailableWidth = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const nextWidth = target.getBoundingClientRect().width;
        setViewportWidth(document.documentElement.clientWidth);
        setAvailableWidth(nextWidth > 0 ? nextWidth : null);
      });
    };

    updateAvailableWidth();

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateAvailableWidth)
        : null;

    observer?.observe(target);
    window.addEventListener("resize", updateAvailableWidth);

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", updateAvailableWidth);
    };
  }, []);

  return (
    <motion.div
      ref={rootRef}
      animate={{ width: outerWidth }}
      className={cn(
        "relative isolate inline-flex h-12 max-w-full items-center",
        disabled && "pointer-events-none opacity-60",
        className,
      )}
      data-slot="gooey-input"
      initial={false}
      transition={{ damping: 26, stiffness: 360, type: "spring" }}
    >
      <svg aria-hidden="true" className="absolute h-0 w-0">
        <filter id={filterId}>
          <feGaussianBlur
            in="SourceGraphic"
            result="blur"
            stdDeviation={gooeyBlur}
          />
          <feColorMatrix
            in="blur"
            mode="matrix"
            result="goo"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
          />
          <feBlend in="SourceGraphic" in2="goo" />
        </filter>
      </svg>

      <div
        aria-hidden="true"
        className={cn("absolute inset-0", classNames?.filterWrap)}
        style={{ filter: `url(#${filterId})` }}
      >
        <motion.span
          animate={{
            width: visualWidth,
            x: visualX,
          }}
          className={cn(
            "absolute left-0 top-0 h-12 rounded-box bg-background shadow-xs",
            classNames?.bubbleSurface,
          )}
          initial={false}
          transition={{ damping: 26, stiffness: 360, type: "spring" }}
        />
        <motion.span
          animate={{
            width: Math.min(inputPaddingLeft, visualWidth),
            x: visualX,
          }}
          className={cn(
            "absolute left-0 top-0 h-12 rounded-box bg-background shadow-xs",
            classNames?.bubble,
          )}
          initial={false}
          transition={{ damping: 26, stiffness: 360, type: "spring" }}
        />
      </div>

      <motion.span
        aria-hidden="true"
        animate={{
          width: visualWidth,
          x: visualX,
        }}
        className={cn(
          "pointer-events-none absolute left-0 top-0 z-[1] h-12 rounded-box border border-input bg-transparent shadow-xs",
          classNames?.bubbleSurface,
        )}
        data-slot="gooey-input-surface"
        initial={false}
        transition={{ damping: 26, stiffness: 360, type: "spring" }}
      />

      <motion.div
        animate={{ width: outerWidth }}
        className={cn(
          "relative z-10 h-12 max-w-full",
          classNames?.buttonRow,
          classNames?.root,
        )}
        initial={false}
        transition={{ damping: 26, stiffness: 360, type: "spring" }}
      >
        <motion.div
          animate={{
            opacity: 1,
            width: visualWidth,
            x: visualX,
          }}
          initial={false}
          className="absolute left-0 top-0 h-12"
          transition={{ damping: 26, stiffness: 360, type: "spring" }}
        >
          <input
            {...props}
            className={cn(
              "h-12 w-full rounded-box border-0 bg-transparent px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none",
              classNames?.input,
            )}
            data-slot="gooey-input-field"
            disabled={disabled}
            onBlur={(event) => {
              if (!currentValue) {
                setOpen(false);
              }
              onBlur?.(event);
            }}
            onChange={(event) => setNextValue(event.target.value)}
            onFocus={(event) => {
              setOpen(true);
              onFocus?.(event);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                if (currentValue) {
                  setNextValue("");
                } else {
                  setOpen(false);
                  event.currentTarget.blur();
                }
              }
              onKeyDown?.(event);
            }}
            placeholder={placeholder}
            ref={inputRef}
            style={{
              ...style,
              paddingLeft: style?.paddingLeft ?? inputPaddingLeft,
              paddingRight: style?.paddingRight ?? inputPaddingRight,
            }}
            type={props.type ?? "search"}
            value={currentValue}
          />
          {currentValue ? (
            <button
              aria-label="Clear search"
              className={cn(
                "absolute right-0 top-0 flex h-12 w-11 items-center justify-center rounded-box text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
                classNames?.clearButton,
              )}
              disabled={disabled}
              onClick={() => {
                setNextValue("");
                setOpen(true);
                inputRef.current?.focus();
              }}
              onMouseDown={(event) => event.preventDefault()}
              type="button"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          ) : null}
        </motion.div>
        <motion.button
          animate={{ x: visualX }}
          aria-label="Open search"
          className={cn(
            "absolute left-0 top-0 flex h-12 items-center justify-center rounded-box text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
            classNames?.trigger,
          )}
          disabled={disabled}
          initial={false}
          onClick={() => {
            setOpen(true);
            inputRef.current?.focus();
          }}
          style={{ width: inputPaddingLeft }}
          transition={{ damping: 26, stiffness: 360, type: "spring" }}
          type="button"
        >
          <Search aria-hidden="true" className="size-5" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export { GooeyInput };
