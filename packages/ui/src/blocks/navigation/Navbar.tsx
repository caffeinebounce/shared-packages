"use client";

import { ChevronDown, X } from "lucide-react";
import {
  motion,
  useAnimation,
  useReducedMotion,
  type Variants,
} from "motion/react";
import type { ReactNode } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { Container } from "../../components/ui/container";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../../components/ui/navigation-menu";
import { useScrollDirection } from "../../hooks/useScrollDirection";
import { cn } from "../../utils";

/**
 * Navigation link definition
 */
export interface NavLink {
  /** Display label */
  label: string;
  /** Optional supporting copy rendered under the label in grouped menus */
  description?: ReactNode;
  /** Link destination */
  href: string;
  /** Whether link opens in new tab */
  external?: boolean;
  /** Optional icon to display */
  icon?: ReactNode;
}

export interface NavbarMenuGroup {
  /** Trigger label for the grouped desktop menu */
  label: string;
  /** Navigation links rendered in the menu content */
  links: NavLink[];
  /** Accessible label for the menu content */
  ariaLabel?: string;
  /** Whether to render the menu label inside the content panel */
  showHeading?: boolean;
}

export interface NavbarMenuClassNames {
  /** Classes for the shared navigation menu root */
  root?: string;
  /** Classes for the navigation menu list */
  list?: string;
  /** Classes for each navigation menu item wrapper */
  menuItem?: string;
  /** Classes for each menu trigger button */
  trigger?: string;
  /** Classes for the trigger chevron icon */
  triggerIcon?: string;
  /** Classes for each content panel */
  content?: string;
  /** Classes for the optional content heading */
  heading?: string;
  /** Classes for each link inside a content panel */
  item?: string;
  /** Classes for each content-panel link label */
  itemLabel?: string;
  /** Classes for each content-panel link description */
  itemDescription?: string;
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
  /** Grouped desktop menus rendered with the shared navigation menu primitive */
  menuGroups?: NavbarMenuGroup[];
  /** Slot class hooks for restyling grouped desktop menus */
  menuClassNames?: NavbarMenuClassNames;
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
  /** Additional classes layered onto the shared container width/padding system. */
  containerClassName?: string;
}

function DefaultMobileMenuIcon({
  open,
  reducedMotion,
}: {
  open: boolean;
  reducedMotion: boolean;
}) {
  const controls = useAnimation();
  const lineVariants: Variants = {
    normal: {
      opacity: 1,
      rotate: 0,
      y: 0,
    },
    animate: (line: number) => ({
      opacity: line === 2 ? 0 : 1,
      rotate: line === 1 ? 45 : line === 3 ? -45 : 0,
      y: line === 1 ? 6 : line === 3 ? -6 : 0,
      transition: reducedMotion
        ? { duration: 0 }
        : {
            damping: 20,
            stiffness: 260,
            type: "spring",
          },
    }),
  };

  useEffect(() => {
    controls.start(
      open ? "animate" : "normal",
      reducedMotion ? { duration: 0 } : undefined,
    );
  }, [controls, open, reducedMotion]);

  const handleMouseEnter = () => {
    if (!open) {
      controls.start("animate");
    }
  };

  const handleMouseLeave = () => {
    controls.start(open ? "animate" : "normal");
  };

  return (
    <span
      aria-hidden="true"
      data-animation="lucide-animated-menu"
      data-slot="navbar-mobile-menu-icon"
      data-state={open ? "open" : "closed"}
      className="relative flex h-9 w-9 items-center justify-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <svg
        aria-hidden="true"
        fill="none"
        focusable="false"
        height="20"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="20"
        xmlns="http://www.w3.org/2000/svg"
      >
        {[1, 2, 3].map((line) => (
          <motion.line
            animate={controls}
            custom={line}
            key={line}
            variants={lineVariants}
            x1="4"
            x2="20"
            y1={line === 1 ? "6" : line === 2 ? "12" : "18"}
            y2={line === 1 ? "6" : line === 2 ? "12" : "18"}
          />
        ))}
      </svg>
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
  menuGroups = [],
  menuClassNames,
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
      <Container
        data-slot="navbar-container"
        className={cn(
          "flex h-14 items-center justify-between gap-4",
          containerClassName,
        )}
      >
        {/* Logo/Brand */}
        {logo}

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          {/* Navigation Links */}
          <nav className="flex items-center gap-6">
            {menuGroups.length > 0 ? (
              <NavigationMenu
                data-slot="navbar-menu"
                className={cn("justify-start", menuClassNames?.root)}
              >
                <NavigationMenuList
                  data-slot="navbar-menu-list"
                  className={cn("justify-start gap-1", menuClassNames?.list)}
                >
                  {menuGroups.map((group) => (
                    <NavigationMenuItem
                      data-slot="navbar-menu-item"
                      className={menuClassNames?.menuItem}
                      key={group.label}
                    >
                      <NavigationMenuTrigger
                        data-slot="navbar-menu-trigger"
                        className={cn(
                          "gap-1.5 bg-transparent px-2 text-foreground/70 hover:bg-transparent hover:text-foreground focus:bg-transparent focus:text-foreground",
                          menuClassNames?.trigger,
                        )}
                      >
                        {group.label}
                        <ChevronDown
                          aria-hidden="true"
                          className={cn(
                            "relative top-px size-3.5 transition-transform duration-300 group-data-[state=open]:rotate-180",
                            menuClassNames?.triggerIcon,
                          )}
                          data-slot="navbar-menu-trigger-icon"
                        />
                      </NavigationMenuTrigger>
                      <NavigationMenuContent
                        aria-label={
                          group.ariaLabel ?? `${group.label} navigation`
                        }
                        data-slot="navbar-menu-content"
                        className={menuClassNames?.content}
                      >
                        {group.showHeading === false ? null : (
                          <p
                            className={cn(
                              "px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                              menuClassNames?.heading,
                            )}
                          >
                            {group.label}
                          </p>
                        )}
                        {group.links.map((link) =>
                          link.external ? (
                            <NavigationMenuLink asChild key={link.href}>
                              <a
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                  "group flex min-w-48 items-start gap-2 whitespace-nowrap",
                                  menuClassNames?.item,
                                )}
                              >
                                {link.icon}
                                <span className="flex flex-col gap-1">
                                  <span
                                    data-slot="navbar-menu-item-label"
                                    className={menuClassNames?.itemLabel}
                                  >
                                    {link.label}
                                  </span>
                                  {link.description ? (
                                    <span
                                      data-slot="navbar-menu-item-description"
                                      className={cn(
                                        "max-w-72 whitespace-normal text-xs leading-5 text-muted-foreground",
                                        menuClassNames?.itemDescription,
                                      )}
                                    >
                                      {link.description}
                                    </span>
                                  ) : null}
                                </span>
                              </a>
                            </NavigationMenuLink>
                          ) : (
                            <NavigationMenuLink asChild key={link.href}>
                              <LinkEl
                                href={link.href}
                                className={cn(
                                  "group flex min-w-48 items-start gap-2 whitespace-nowrap",
                                  menuClassNames?.item,
                                )}
                              >
                                {link.icon}
                                <span className="flex flex-col gap-1">
                                  <span
                                    data-slot="navbar-menu-item-label"
                                    className={menuClassNames?.itemLabel}
                                  >
                                    {link.label}
                                  </span>
                                  {link.description ? (
                                    <span
                                      data-slot="navbar-menu-item-description"
                                      className={cn(
                                        "max-w-72 whitespace-normal text-xs leading-5 text-muted-foreground",
                                        menuClassNames?.itemDescription,
                                      )}
                                    >
                                      {link.description}
                                    </span>
                                  ) : null}
                                </span>
                              </LinkEl>
                            </NavigationMenuLink>
                          ),
                        )}
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            ) : null}
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
                "inline-flex h-9 w-9 items-center justify-center rounded-box text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                presetClasses[preset].mobileMenuButton,
              )}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {usesCustomMobileMenuIcons ? (
                mobileMenuOpen ? (
                  mobileMenuOpenIcon || <X className="h-5 w-5" />
                ) : (
                  mobileMenuClosedIcon || (
                    <DefaultMobileMenuIcon
                      open={false}
                      reducedMotion={reducedMotion}
                    />
                  )
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
      </Container>

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
          <Container
            data-slot="navbar-mobile-menu-container"
            className={cn(
              "py-4",
              isScreenHeightMobileMenu && "h-full",
              containerClassName,
            )}
          >
            <nav
              data-slot="navbar-mobile-menu-content"
              className={cn(
                "flex flex-col gap-4",
                isScreenHeightMobileMenu && "min-h-full overflow-y-auto",
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
          </Container>
        </div>
      )}
    </header>
  );
}
