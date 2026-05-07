"use client";

import { ArrowLeft, History } from "lucide-react";
import { type MouseEvent, type ReactNode, useEffect, useState } from "react";

import { cn } from "../../utils";

/**
 * Props for the LegalLayout component
 */
export interface LegalLayoutProps {
  /** Page title */
  title: string;
  /** Last updated date */
  lastUpdated?: string;
  /** URL to the archive/version history page */
  archiveUrl?: string;
  /** Optional URL for the header back link */
  backHref?: string;
  /** Accessible label for the header back link */
  backLabel?: string;
  /** Table of contents items */
  tableOfContents?: { id: string; title: string }[];
  /** Main content */
  children: ReactNode;
  /** Additional className for the root container */
  className?: string;
}

/**
 * A layout component for legal pages with clean typography, table of contents, and print-friendly styling.
 *
 * @example
 * ```tsx
 * <LegalLayout
 *   title="Terms of Service"
 *   lastUpdated="2024-01-15"
 *   tableOfContents={[
 *     { id: "acceptance", title: "Acceptance of Terms" },
 *     { id: "accounts", title: "Account Responsibilities" }
 *   ]}
 * >
 *   <LegalSection id="acceptance" title="Acceptance of Terms">
 *     Content here...
 *   </LegalSection>
 * </LegalLayout>
 * ```
 */
export function LegalLayout({
  title,
  lastUpdated,
  archiveUrl,
  backHref,
  backLabel = "Back",
  tableOfContents,
  children,
  className,
}: LegalLayoutProps) {
  const [activeSection, setActiveSection] = useState<string>("");
  const hasMetadata = Boolean(lastUpdated || archiveUrl);

  // Scroll spy to track active section
  useEffect(() => {
    if (!tableOfContents || tableOfContents.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      {
        rootMargin: "-80px 0px -70% 0px",
        threshold: 0,
      },
    );

    // Observe all sections
    for (const item of tableOfContents) {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    }

    return () => observer.disconnect();
  }, [tableOfContents]);

  const scrollToSection = (
    event: MouseEvent<HTMLAnchorElement>,
    sectionId: string,
  ) => {
    const target = document.getElementById(sectionId);

    if (!target) {
      return;
    }

    event.preventDefault();

    const prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targetHeading = target.querySelector("h2, h3, h4, h5, h6") ?? target;
    const stickyHeader = document.querySelector(
      '[data-slot="legal-page-header"]',
    );
    const stickyHeaderBottom =
      stickyHeader?.getBoundingClientRect().bottom ?? 0;
    const targetTop =
      targetHeading.getBoundingClientRect().top +
      window.scrollY -
      stickyHeaderBottom -
      8;

    window.scrollTo({
      top: Math.max(targetTop, 0),
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
    window.history.pushState(null, "", `#${sectionId}`);
    setActiveSection(sectionId);
  };

  return (
    <div
      className={cn(
        "mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8",
        "print:max-w-none print:px-0",
        className,
      )}
    >
      <header
        key="legal-page-header"
        data-slot="legal-page-header"
        className={cn(
          "sticky top-[3px] z-20 -mx-4 mb-8 border-b border-border bg-background px-4 py-5 sm:-mx-6 sm:px-6 lg:-mx-8 lg:mb-10 lg:px-8",
          "print:static print:mb-6 print:border-b print:bg-transparent print:p-0 print:backdrop-blur-none",
        )}
      >
        <div className="flex flex-col gap-4">
          {backHref && (
            <a
              href={backHref}
              className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background print:hidden"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {backLabel}
            </a>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl print:text-3xl">
              {title}
            </h1>
            {hasMetadata && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground sm:justify-end">
                {lastUpdated && <span>Last updated: {lastUpdated}</span>}
                {archiveUrl && (
                  <a
                    href={archiveUrl}
                    className="inline-flex items-center gap-1.5 text-primary hover:underline print:hidden"
                  >
                    <History className="h-3.5 w-3.5" />
                    <span>View version history</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
      <div
        key="legal-page-content"
        className="lg:grid lg:grid-cols-12 lg:gap-8"
      >
        {/* Table of Contents - Desktop Sidebar */}
        {tableOfContents && tableOfContents.length > 0 && (
          <aside className="hidden lg:col-span-3 lg:sticky lg:top-[10.5rem] lg:block lg:max-h-[calc(100vh-11.5rem)] lg:self-start lg:overflow-y-auto print:hidden">
            <nav className="space-y-1" aria-label="Table of contents">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                On this page
              </h3>
              <ul className="space-y-2">
                {tableOfContents.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={(event) => scrollToSection(event, item.id)}
                      className={cn(
                        "block text-sm transition-all duration-200 py-1",
                        "border-l-2 pl-3 -ml-px",
                        activeSection === item.id
                          ? "text-primary border-primary font-medium"
                          : "text-muted-foreground border-transparent hover:text-foreground hover:border-muted-foreground/50",
                      )}
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main
          className={cn(
            tableOfContents && tableOfContents.length > 0
              ? "lg:col-span-9"
              : "lg:col-span-12",
            "print:col-span-12",
          )}
        >
          {/* Table of Contents - Mobile */}
          {tableOfContents && tableOfContents.length > 0 && (
            <nav
              className="mb-8 rounded-lg border border-border bg-muted/30 p-4 lg:hidden print:hidden"
              aria-label="Table of contents"
            >
              <h2 className="text-sm font-semibold text-foreground mb-3">
                On this page
              </h2>
              <ul className="space-y-2">
                {tableOfContents.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={(event) => scrollToSection(event, item.id)}
                      className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* Content */}
          <div
            className={cn(
              "prose prose-slate dark:prose-invert max-w-none",
              // Headings
              "prose-headings:scroll-mt-32 prose-headings:font-semibold",
              "prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-2",
              "prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-2",
              // Paragraphs - reduced top margin
              "prose-p:text-base prose-p:leading-7 prose-p:mb-4 prose-p:mt-0",
              // Links - explicit styling for visibility (but not on section header links)
              "[&>section>a]:no-underline [&>section>a:hover]:no-underline",
              "prose-a:text-primary prose-a:underline prose-a:underline-offset-2",
              "hover:prose-a:text-primary/80",
              // Lists - ensure bullets/numbers are visible
              "prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-2",
              "prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6 prose-ol:space-y-2",
              "prose-li:my-0 prose-li:pl-2",
              // Strong text
              "prose-strong:font-semibold prose-strong:text-foreground",
              // Print styles
              "print:prose-headings:text-black print:prose-p:text-black",
              "print:prose-h2:text-xl print:prose-h3:text-lg",
            )}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
