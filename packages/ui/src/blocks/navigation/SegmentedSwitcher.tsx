"use client";

import { motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import type {
  ComponentType,
  MouseEvent,
  MouseEventHandler,
  ReactNode,
} from "react";
import { useEffect, useId, useMemo, useState } from "react";

import { cn } from "../../utils";

export type SegmentedSwitcherMatchMode = "exact" | "prefix";

export interface SegmentedSwitcherItem {
  id: string;
  label: ReactNode;
  disabled?: boolean;
  href?: string;
  match?: SegmentedSwitcherMatchMode;
}

export interface SegmentedSwitcherProps {
  items: SegmentedSwitcherItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  variant?: "investor" | "admin";
  showTrackBorder?: boolean;
  showTrackBackground?: boolean;
  ariaLabel?: string;
  className?: string;
}

export interface RouteSegmentedSwitcherItem extends SegmentedSwitcherItem {
  href: string;
  enabled?: boolean;
}

export interface RouteSegmentedSwitcherProps {
  items: RouteSegmentedSwitcherItem[];
  pathname?: string;
  value?: string;
  onValueChange?: (id: string) => void;
  LinkComponent?: ComponentType<{
    href: string;
    className?: string;
    children: ReactNode;
    onClick?: MouseEventHandler<HTMLAnchorElement>;
    "aria-current"?: "page";
    "aria-disabled"?: boolean;
    tabIndex?: number;
    "data-slot"?: string;
    "data-active"?: "true";
    "data-disabled"?: "true";
  }>;
  variant?: "investor" | "admin";
  showTrackBorder?: boolean;
  showTrackBackground?: boolean;
  ariaLabel?: string;
  className?: string;
}

const DEFAULT_ARIA_LABEL = "Section switcher";

function matchesPath(
  pathname: string,
  href: string,
  match: SegmentedSwitcherMatchMode = "prefix",
) {
  if (match === "exact") {
    return pathname === href;
  }

  if (pathname === href) {
    return true;
  }

  if (href === "/") {
    return pathname === href;
  }

  return pathname.startsWith(`${href}/`);
}

function getFirstEnabledId(items: SegmentedSwitcherItem[]) {
  return items.find((item) => !item.disabled)?.id ?? null;
}

function getLongestRouteMatch(
  items: RouteSegmentedSwitcherItem[],
  pathname: string,
) {
  const matches = items
    .filter((item) => !item.disabled)
    .filter((item) => matchesPath(pathname, item.href, item.match))
    .sort((a, b) => b.href.length - a.href.length);

  return matches[0]?.id ?? null;
}

function normalizeActiveId(items: SegmentedSwitcherItem[], id?: string | null) {
  if (!id) {
    return null;
  }

  const activeItem = items.find((item) => item.id === id && !item.disabled);
  return activeItem?.id ?? null;
}

function getIndicatorTransition(reducedMotion: boolean) {
  if (reducedMotion) {
    return { duration: 0 };
  }

  return {
    type: "spring",
    stiffness: 520,
    damping: 40,
    mass: 0.6,
  } as const;
}

function DefaultLinkComponent({
  href,
  className,
  children,
  onClick,
  ...props
}: {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  "aria-current"?: "page";
  "aria-disabled"?: boolean;
  tabIndex?: number;
  "data-slot"?: string;
  "data-active"?: "true";
  "data-disabled"?: "true";
}) {
  return (
    <a href={href} className={className} onClick={onClick} {...props}>
      {children}
    </a>
  );
}

export function SegmentedSwitcher({
  items,
  value,
  defaultValue,
  onValueChange,
  variant = "investor",
  showTrackBorder = true,
  showTrackBackground = true,
  ariaLabel = DEFAULT_ARIA_LABEL,
  className,
}: SegmentedSwitcherProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const indicatorLayoutId = `segmented-switcher-indicator-${useId().replaceAll(
    ":",
    "",
  )}`;

  const [uncontrolledValue, setUncontrolledValue] = useState<string | null>(
    () => {
      return normalizeActiveId(items, defaultValue) ?? getFirstEnabledId(items);
    },
  );

  const isControlled = value !== undefined;
  const firstEnabledId = useMemo(() => getFirstEnabledId(items), [items]);

  useEffect(() => {
    if (isControlled) {
      return;
    }

    const nextValue =
      normalizeActiveId(items, uncontrolledValue) ??
      normalizeActiveId(items, defaultValue) ??
      firstEnabledId;

    if (nextValue !== uncontrolledValue) {
      setUncontrolledValue(nextValue);
    }
  }, [defaultValue, firstEnabledId, isControlled, items, uncontrolledValue]);

  const activeId =
    normalizeActiveId(items, isControlled ? value : uncontrolledValue) ??
    normalizeActiveId(items, defaultValue) ??
    firstEnabledId;

  const transition = getIndicatorTransition(reducedMotion);

  function handleSelect(item: SegmentedSwitcherItem) {
    if (item.disabled) {
      return;
    }

    if (!isControlled) {
      setUncontrolledValue(item.id);
    }

    if (item.id !== activeId) {
      onValueChange?.(item.id);
    }
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label={ariaLabel}
      data-slot="segmented-switcher"
      data-variant={variant}
      data-track-border={showTrackBorder ? undefined : "false"}
      data-track-background={showTrackBackground ? undefined : "false"}
      data-reduced-motion={reducedMotion ? "true" : undefined}
      className={cn(className)}
    >
      <div data-slot="segmented-switcher-track">
        {items.map((item) => {
          const isActive = activeId === item.id;
          const isDisabled = item.disabled === true;

          if (item.href) {
            return (
              <a
                key={item.id}
                href={item.href}
                data-slot="segmented-switcher-item"
                data-active={isActive ? "true" : undefined}
                data-disabled={isDisabled ? "true" : undefined}
                aria-disabled={isDisabled || undefined}
                tabIndex={isDisabled ? -1 : undefined}
                onClick={(event) => {
                  if (isDisabled) {
                    event.preventDefault();
                    return;
                  }

                  handleSelect(item);
                }}
              >
                {isActive && (
                  <motion.span
                    layoutId={indicatorLayoutId}
                    transition={transition}
                    data-slot="segmented-switcher-indicator"
                    aria-hidden="true"
                  />
                )}
                <span data-slot="segmented-switcher-item-label">
                  {item.label}
                </span>
              </a>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              data-slot="segmented-switcher-item"
              data-active={isActive ? "true" : undefined}
              data-disabled={isDisabled ? "true" : undefined}
              disabled={isDisabled}
              aria-pressed={isActive}
              onClick={() => handleSelect(item)}
            >
              {isActive && (
                <motion.span
                  layoutId={indicatorLayoutId}
                  transition={transition}
                  data-slot="segmented-switcher-indicator"
                  aria-hidden="true"
                />
              )}
              <span data-slot="segmented-switcher-item-label">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function RouteSegmentedSwitcherWithPathname(
  props: Omit<RouteSegmentedSwitcherProps, "pathname">,
) {
  const pathname = usePathname() ?? "/";

  return <RouteSegmentedSwitcherInner {...props} pathname={pathname} />;
}

function RouteSegmentedSwitcherInner({
  items,
  pathname,
  value,
  onValueChange,
  LinkComponent,
  variant = "investor",
  showTrackBorder = true,
  showTrackBackground = true,
  ariaLabel = DEFAULT_ARIA_LABEL,
  className,
}: Omit<RouteSegmentedSwitcherProps, "pathname"> & { pathname: string }) {
  const reducedMotion = useReducedMotion() ?? false;
  const indicatorLayoutId = `segmented-switcher-indicator-${useId().replaceAll(
    ":",
    "",
  )}`;
  const LinkEl = LinkComponent ?? DefaultLinkComponent;

  const visibleItems = useMemo(
    () => items.filter((item) => item.enabled !== false),
    [items],
  );

  const firstEnabledId = useMemo(
    () => getFirstEnabledId(visibleItems),
    [visibleItems],
  );

  const activeId =
    normalizeActiveId(visibleItems, value) ??
    getLongestRouteMatch(visibleItems, pathname) ??
    firstEnabledId;

  const transition = getIndicatorTransition(reducedMotion);

  function handleClick(
    event: MouseEvent<HTMLAnchorElement>,
    item: RouteSegmentedSwitcherItem,
  ) {
    if (item.disabled) {
      event.preventDefault();
      return;
    }

    if (item.id !== activeId) {
      onValueChange?.(item.id);
    }
  }

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label={ariaLabel}
      data-slot="segmented-switcher"
      data-variant={variant}
      data-track-border={showTrackBorder ? undefined : "false"}
      data-track-background={showTrackBackground ? undefined : "false"}
      data-reduced-motion={reducedMotion ? "true" : undefined}
      className={cn(className)}
    >
      <div data-slot="segmented-switcher-track">
        {visibleItems.map((item) => {
          const isActive = activeId === item.id;
          const isDisabled = item.disabled === true;

          return (
            <LinkEl
              key={item.id}
              href={item.href}
              data-slot="segmented-switcher-item"
              data-active={isActive ? "true" : undefined}
              data-disabled={isDisabled ? "true" : undefined}
              aria-current={isActive ? "page" : undefined}
              aria-disabled={isDisabled || undefined}
              tabIndex={isDisabled ? -1 : undefined}
              onClick={(event) => handleClick(event, item)}
            >
              {isActive && (
                <motion.span
                  layoutId={indicatorLayoutId}
                  transition={transition}
                  data-slot="segmented-switcher-indicator"
                  aria-hidden="true"
                />
              )}
              <span data-slot="segmented-switcher-item-label">
                {item.label}
              </span>
            </LinkEl>
          );
        })}
      </div>
    </nav>
  );
}

export function RouteSegmentedSwitcher({
  pathname,
  ...props
}: RouteSegmentedSwitcherProps) {
  if (pathname !== undefined) {
    return <RouteSegmentedSwitcherInner {...props} pathname={pathname} />;
  }

  return <RouteSegmentedSwitcherWithPathname {...props} />;
}
