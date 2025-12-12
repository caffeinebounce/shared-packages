"use client";

import { History } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";

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
  tableOfContents,
  children,
  className,
}: LegalLayoutProps) {
  const [activeSection, setActiveSection] = useState<string>("");

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

  return (
    <div
      className={cn(
        "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8",
        "print:max-w-none print:px-0",
        className,
      )}
    >
      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Table of Contents - Desktop Sidebar */}
        {tableOfContents && tableOfContents.length > 0 && (
          <aside className="hidden lg:col-span-3 lg:block print:hidden">
            <nav
              className="sticky top-20 space-y-1"
              aria-label="Table of contents"
            >
              <h3 className="text-sm font-semibold text-foreground mb-4">
                On this page
              </h3>
              <ul className="space-y-2">
                {tableOfContents.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
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
          {/* Header */}
          <header className="mb-8 print:mb-6">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl print:text-3xl">
              {title}
            </h1>
            {(lastUpdated || archiveUrl) && (
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
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
          </header>

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
              "prose-headings:scroll-mt-20 prose-headings:font-semibold",
              "prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-2",
              "prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-2",
              // Paragraphs - reduced top margin
              "prose-p:text-base prose-p:leading-7 prose-p:mb-4 prose-p:mt-0",
              // Links - explicit styling for visibility
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
