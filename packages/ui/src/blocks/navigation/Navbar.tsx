"use client";

import { useReducedMotion } from "motion/react";
import { Menu, X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { useScrollDirection } from "../../hooks/useScrollDirection";
import { cn } from "../../utils";

/**
 * Navigation link definition
 */
export interface NavLink {
  /** Display label */
  label: string;
  /** Link destination */
  href: string;
  /** Whether link opens in new tab */
  external?: boolean;
  /** Optional icon to display */
  icon?: ReactNode;
}

/**
 * Props for the Navbar component
 */
export interface NavbarProps {
  /** Logo/brand element (typically an image with text) */
  logo: ReactNode;
  /** Optional named styling preset for site-specific chrome */
  preset?: "default" | "keenan";
  /** Navigation links to display in desktop view */
  links?: NavLink[];
  /** Right side content (user menu, theme toggle, etc.) */
  rightContent?: ReactNode;
  /** Content to render in mobile menu (replaces default link rendering) */
  mobileContent?: ReactNode;
  /** Whether navbar should stick to top on scroll */
  sticky?: boolean;
  /**
   * Hide navbar when scrolling down, show when scrolling up.
   * Only applies when sticky is true.
   * Common pattern for marketing pages to maximize content area.
   */
  hideOnScrollDown?: boolean;
  /** Background style variant */
  variant?: "transparent" | "solid" | "blur";
  /** Additional className for the header element */
  className?: string;
  /** Link component for client-side navigation (e.g., Next.js Link) */
  LinkComponent?: React.ComponentType<{
    href: string;
    className?: string;
    children: ReactNode;
    onClick?: () => void;
  }>;
  /** Whether to show mobile menu button */
  showMobileMenu?: boolean;
  /** Custom mobile menu button content when open */
  mobileMenuOpenIcon?: ReactNode;
  /** Custom mobile menu button content when closed */
  mobileMenuClosedIcon?: ReactNode;
  /** Mobile menu height behavior */
  mobileMenuHeight?: "content" | "screen";
  /** Max width for the inner container (e.g., "max-w-5xl", "max-w-7xl"). Defaults to full container width. */
  containerClassName?: string;
}

function DefaultMobileMenuIcon({
  open,
  reducedMotion,
}: {
  open: boolean;
  reducedMotion: boolean;
}) {
  const transition = reducedMotion
    ? "none"
    : "transform 300ms cubic-bezier(0.22, 1, 0.36, 1), opacity 300ms cubic-bezier(0.22, 1, 0.36, 1)";
  const lineStyle = {
    backgroundColor: "currentColor",
    transition,
  };

  return (
    <span
      aria-hidden="true"
      data-slot="navbar-mobile-menu-icon"
      data-state={open ? "open" : "closed"}
      className="relative flex h-5 w-5 items-center justify-center"
    >
      <span
        className="absolute h-0.5 w-5 rounded-full"
        style={{
          ...lineStyle,
          transform: open ? "translateY(0) rotate(45deg)" : "translateY(-6px)",
        }}
      />
      <span
        className="absolute h-0.5 w-5 rounded-full"
        style={{
          ...lineStyle,
          opacity: open ? 0 : 1,
          transform: open ? "scaleX(0)" : "scaleX(1)",
        }}
      />
      <span
        className="absolute h-0.5 w-5 rounded-full"
        style={{
          ...lineStyle,
          transform: open ? "translateY(0) rotate(-45deg)" : "translateY(6px)",
        }}
      />
    </span>
  );
}

/**
 * A configurable navigation bar component with responsive mobile menu.
 *
 * @example
 * ```tsx
 * <Navbar
 *   logo={<Image src="/logo.png" alt="Brand" />}
 *   links={[
 *     { label: "Home", href: "/" },
 *     { label: "About", href: "/about" },
 *     { label: "Docs", href: "https://docs.example.com", external: true },
 *   ]}
 *   rightContent={<ThemeToggle />}
 *   sticky
 *   variant="blur"
 * />
 * ```
 */
export function Navbar({
  logo,
  preset = "default",
  links = [],
  rightContent,
  mobileContent,
  sticky = true,
  hideOnScrollDown = false,
  variant = "blur",
  className,
  LinkComponent,
  showMobileMenu = true,
  mobileMenuOpenIcon,
  mobileMenuClosedIcon,
  mobileMenuHeight = "content",
  containerClassName,
}: NavbarProps) {
  const headerRef = useRef<HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMenuTop, setMobileMenuTop] = useState(0);
  const reducedMotion = useReducedMotion() ?? false;
  const { direction, isAtTop } = useScrollDirection({
    threshold: 10,
    topThreshold: 50,
  });

  const usesCustomMobileMenuIcons =
    mobileMenuOpenIcon !== undefined || mobileMenuClosedIcon !== undefined;
  const isScreenHeightMobileMenu = mobileMenuHeight === "screen";
  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Determine the anchor/link element to use
  const LinkEl = LinkComponent || "a";

  // Build variant classes
  // For transparent variant: only transparent when at top, otherwise use blur for readability
  // Border classes are included in each variant to avoid conflicts
  const variantClasses = {
    transparent: isAtTop
      ? "bg-transparent border-b border-transparent"
      : "bg-background/80 backdrop-blur-xl backdrop-saturate-150 border-b border-border dark:border-white/10",
    solid: "bg-background border-b border-border",
    blur: "bg-background/60 backdrop-blur-xl backdrop-saturate-150 border-b border-border dark:border-white/10",
  };
  const presetClasses = {
    default: {
      header: "",
      mobileMenuHeader: "bg-background border-b border-border shadow-lg",
      mobileMenu: "bg-background shadow-lg",
      mobileMenuButton: "",
    },
    keenan: {
      header:
        "border-white/10 bg-black/65 shadow-[0_18px_48px_rgba(0,0,0,0.45)] backdrop-blur-2xl",
      mobileMenuHeader:
        "border-white/10 bg-black shadow-[0_18px_48px_rgba(0,0,0,0.45)] backdrop-blur-2xl",
      mobileMenu:
        "border-white/10 bg-black shadow-[0_22px_56px_rgba(0,0,0,0.5)]",
      mobileMenuButton: "text-white hover:bg-white/5 hover:text-white",
    },
  };

  // Determine visibility based on scroll direction
  const shouldHide =
    sticky &&
    hideOnScrollDown &&
    !mobileMenuOpen &&
    !isAtTop &&
    direction === "down";

  useLayoutEffect(() => {
    if (!mobileMenuOpen || !isScreenHeightMobileMenu) {
      setMobileMenuTop(0);
      return;
    }

    const updateMobileMenuTop = () => {
      const nextTop = Math.max(
        headerRef.current?.getBoundingClientRect().bottom ?? 0,
        0,
      );
      setMobileMenuTop(nextTop);
    };

    updateMobileMenuTop();
    window.addEventListener("resize", updateMobileMenuTop);
    window.addEventListener("scroll", updateMobileMenuTop, { passive: true });

    return () => {
      window.removeEventListener("resize", updateMobileMenuTop);
      window.removeEventListener("scroll", updateMobileMenuTop);
    };
  }, [mobileMenuOpen, isScreenHeightMobileMenu]);

  useEffect(() => {
    if (!mobileMenuOpen || !isScreenHeightMobileMenu) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [mobileMenuOpen, isScreenHeightMobileMenu]);

  // Use fixed positioning when hideOnScrollDown is enabled for smooth hide/show
  // Otherwise use sticky for standard behavior
  const positionClass =
    sticky && hideOnScrollDown
      ? "fixed top-0 left-0 right-0"
      : sticky
        ? "sticky top-0"
        : "";

  return (
    <header
      ref={headerRef}
      data-preset={preset}
      className={cn(
        "z-50 w-full transition-[transform,background-color,border-color,backdrop-filter] duration-300",
        positionClass,
        variantClasses[variant],
        presetClasses[preset].header,
        mobileMenuOpen && presetClasses[preset].mobileMenuHeader,
        className,
      )}
      style={{
        transform: shouldHide ? "translateY(-100%)" : "translateY(0)",
      }}
    >
      <div
        className={cn(
          "container mx-auto flex h-14 items-center justify-between gap-4 px-4 md:px-8",
          containerClassName,
        )}
      >
        {/* Logo/Brand */}
        {logo}

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          {/* Navigation Links */}
          <nav className="flex items-center gap-6">
            {links.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-foreground/70 hover:text-foreground transition-colors whitespace-nowrap"
                >
                  {link.icon}
                  {link.label}
                </a>
              ) : (
                <LinkEl
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 text-sm text-foreground/70 hover:text-foreground transition-colors whitespace-nowrap"
                >
                  {link.icon}
                  {link.label}
                </LinkEl>
              ),
            )}
          </nav>

          {/* Right Content */}
          <div className="flex items-center gap-3 ml-4">{rightContent}</div>
        </div>

        {/* Mobile: Right content + Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          {rightContent}
          {showMobileMenu && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-slot="navbar-mobile-menu-button"
              data-state={mobileMenuOpen ? "open" : "closed"}
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                presetClasses[preset].mobileMenuButton,
              )}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {usesCustomMobileMenuIcons ? (
                mobileMenuOpen ? (
                  mobileMenuOpenIcon || <X className="h-5 w-5" />
                ) : (
                  mobileMenuClosedIcon || <Menu className="h-5 w-5" />
                )
              ) : (
                <DefaultMobileMenuIcon
                  open={mobileMenuOpen}
                  reducedMotion={reducedMotion}
                />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && mobileMenuOpen && (
        <div
          data-slot="navbar-mobile-menu"
          data-height={mobileMenuHeight}
          data-preset={preset}
          className={cn(
            "md:hidden border-t border-border",
            presetClasses[preset].mobileMenu,
            isScreenHeightMobileMenu &&
              "fixed inset-x-0 overflow-y-auto overscroll-contain",
          )}
          style={
            isScreenHeightMobileMenu
              ? {
                  top: mobileMenuTop,
                  height: `calc(100dvh - ${mobileMenuTop}px)`,
                }
              : undefined
          }
        >
          <nav
            data-slot="navbar-mobile-menu-content"
            className={cn(
              "container mx-auto flex flex-col gap-4 px-4 py-4 md:px-8",
              isScreenHeightMobileMenu && "min-h-full overflow-y-auto",
              containerClassName,
            )}
          >
            {mobileContent || (
              <>
                {/* Default: Render links */}
                {links.map((link) =>
                  link.external ? (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-foreground/70 hover:text-foreground transition-colors py-2"
                      onClick={closeMobileMenu}
                    >
                      {link.icon}
                      {link.label}
                    </a>
                  ) : (
                    <LinkEl
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-1.5 text-sm text-foreground/70 hover:text-foreground transition-colors py-2"
                      onClick={closeMobileMenu}
                    >
                      {link.icon}
                      {link.label}
                    </LinkEl>
                  ),
                )}
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
