"use client";

import { CircleHelp, Info } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { SidebarTrigger } from "../../components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { cn } from "../../utils";
import { ThemeToggle } from "../theme/ThemeToggle";

export interface HeaderLink {
  /** Link href */
  href: string;
  /** Link label for accessibility */
  label: string;
  /** Icon component (defaults to CircleHelp for help, Info for about) */
  icon?: ComponentType<{ className?: string }>;
  /** Keyboard shortcut display (e.g., "⌃⇧H") */
  shortcutDisplay?: string;
  /** Tooltip text */
  tooltip?: string;
}

export interface AppHeaderProps {
  /** Show the sidebar trigger button */
  showSidebarTrigger?: boolean;
  /** Show the theme toggle */
  showThemeToggle?: boolean;
  /** Theme toggle shortcut display */
  themeToggleShortcut?: string;
  /** Whether shortcuts are visible based on user preference */
  shortcutsVisible?: boolean;
  /** Help link configuration */
  helpLink?: HeaderLink | string;
  /** About link configuration */
  aboutLink?: HeaderLink | string;
  /** Custom actions to show between the spacer and nav links */
  actions?: ReactNode;
  /** Content to show after the sidebar trigger */
  leadingContent?: ReactNode;
  /** Additional className */
  className?: string;
  /** Link component to use (for Next.js Link, etc.) */
  LinkComponent?: ComponentType<{
    href: string;
    className?: string;
    children: ReactNode;
  }>;
  /** Keyboard shortcut display component */
  ShortcutComponent?: ComponentType<{
    className?: string;
    children: ReactNode;
  }>;
}

/**
 * AppHeader - Standard header bar for app layouts
 *
 * Includes SidebarTrigger, help/about links, theme toggle, and custom action slots.
 *
 * @example
 * ```tsx
 * <AppHeader
 *   helpLink={{ href: "/help", label: "Help", icon: CircleHelp, shortcutDisplay: "⌃⇧H" }}
 *   aboutLink="/about"
 *   actions={<FeedbackButton />}
 * />
 * ```
 */
export function AppHeader({
  showSidebarTrigger = true,
  showThemeToggle = true,
  themeToggleShortcut,
  shortcutsVisible,
  helpLink,
  aboutLink,
  actions,
  leadingContent,
  className,
  LinkComponent = "a" as unknown as ComponentType<{
    href: string;
    className?: string;
    children: ReactNode;
  }>,
  ShortcutComponent,
}: AppHeaderProps) {
  const Link = LinkComponent;

  // Normalize link configs
  const helpConfig: HeaderLink | null = helpLink
    ? typeof helpLink === "string"
      ? { href: helpLink, label: "Help", icon: CircleHelp, tooltip: "Get help" }
      : { icon: CircleHelp, tooltip: "Get help", ...helpLink }
    : null;

  const aboutConfig: HeaderLink | null = aboutLink
    ? typeof aboutLink === "string"
      ? { href: aboutLink, label: "About", icon: Info, tooltip: "About" }
      : { icon: Info, tooltip: "About", ...aboutLink }
    : null;

  const renderLink = (config: HeaderLink) => {
    const Icon = config.icon;
    const content = (
      <Link
        href={config.href}
        className="inline-flex h-8 w-8 items-center justify-center text-icon transition-colors hover:text-icon-hover"
      >
        {Icon && (
          <Icon className="h-4 w-4 transition-transform duration-300 hover:rotate-12" />
        )}
        <span className="sr-only">{config.label}</span>
      </Link>
    );

    if (config.tooltip || config.shortcutDisplay) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="bottom">
            <span>{config.tooltip || config.label}</span>
            {config.shortcutDisplay && ShortcutComponent && (
              <ShortcutComponent className="ml-2 text-[10px]">
                {config.shortcutDisplay}
              </ShortcutComponent>
            )}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4",
        className,
      )}
    >
      {showSidebarTrigger && <SidebarTrigger className="-ml-1" />}
      {leadingContent}
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        {actions}
        {helpConfig && renderLink(helpConfig)}
        {aboutConfig && renderLink(aboutConfig)}
        {showThemeToggle && (
          <ThemeToggle
            shortcutDisplay={themeToggleShortcut}
            shortcutsVisible={shortcutsVisible}
          />
        )}
      </div>
    </header>
  );
}
