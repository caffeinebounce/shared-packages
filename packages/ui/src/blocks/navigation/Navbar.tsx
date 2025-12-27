"use client";

import { Menu, X } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

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
  /** Navigation links to display in desktop view */
  links?: NavLink[];
  /** Right side content (user menu, theme toggle, etc.) */
  rightContent?: ReactNode;
  /** Content to render in mobile menu (replaces default link rendering) */
  mobileContent?: ReactNode;
  /** Whether navbar should stick to top on scroll */
  sticky?: boolean;
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
  links = [],
  rightContent,
  mobileContent,
  sticky = true,
  variant = "blur",
  className,
  LinkComponent,
  showMobileMenu = true,
  mobileMenuOpenIcon,
  mobileMenuClosedIcon,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Determine the anchor/link element to use
  const LinkEl = LinkComponent || "a";

  // Build variant classes
  const variantClasses = {
    transparent: "bg-transparent",
    solid: "bg-background",
    blur: "bg-background/80 backdrop-blur-md",
  };

  return (
    <header
      className={cn(
        "z-50 w-full border-b border-border",
        sticky && "sticky top-0",
        variantClasses[variant],
        className,
      )}
    >
      <div className="container flex h-14 items-center justify-between gap-4">
        {/* Logo/Brand */}
        {logo}

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          {/* Navigation Links */}
          <nav className="flex items-center gap-2">
            {links.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground/70 hover:text-muted-foreground transition-colors whitespace-nowrap"
                >
                  {link.icon}
                  {link.label}
                </a>
              ) : (
                <LinkEl
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground/70 hover:text-muted-foreground transition-colors whitespace-nowrap"
                >
                  {link.icon}
                  {link.label}
                </LinkEl>
              ),
            )}
          </nav>

          {/* Right Content */}
          <div className="flex items-center gap-2">{rightContent}</div>
        </div>

        {/* Mobile: Right content + Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          {rightContent}
          {showMobileMenu && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen
                ? mobileMenuOpenIcon || <X className="h-5 w-5" />
                : mobileMenuClosedIcon || <Menu className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container py-4 flex flex-col gap-4">
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
                      className="flex items-center gap-1.5 text-sm text-muted-foreground/70 hover:text-muted-foreground transition-colors py-2"
                      onClick={closeMobileMenu}
                    >
                      {link.icon}
                      {link.label}
                    </a>
                  ) : (
                    <LinkEl
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground/70 hover:text-muted-foreground transition-colors py-2"
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
