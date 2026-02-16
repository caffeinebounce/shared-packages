"use client";

import type { ReactNode } from "react";
import { Separator } from "../../components/ui/separator";
import { cn } from "../../utils";

export interface FooterLinkGroup {
  /** Title of the link group */
  title: string;
  /** Links in this group */
  links: { label: string; href: string; external?: boolean }[];
}

export interface FooterProps {
  /** Logo/brand element */
  logo?: ReactNode;
  /** Link groups for columns */
  linkGroups?: FooterLinkGroup[];
  /** Social media links */
  socialLinks?: { icon: ReactNode; href: string; label: string }[];
  /** Copyright text */
  copyright?: string;
  /** Additional bottom content */
  bottomContent?: ReactNode;
  className?: string;
  /** Additional className for the inner container (e.g., "max-w-5xl") */
  containerClassName?: string;
}

export function Footer({
  logo,
  linkGroups = [],
  socialLinks = [],
  copyright,
  bottomContent,
  className,
  containerClassName,
}: FooterProps) {
  return (
    <footer className={cn("bg-muted/50 border-t", className)}>
      <div className={cn("container mx-auto px-4 md:px-8 py-12 md:py-16", containerClassName)}>
        <div className="flex flex-col md:flex-row justify-between gap-8">
          {/* Brand Section */}
          {logo && (
            <div className="shrink-0">
              {logo}
              {/* Social Links */}
              {socialLinks.length > 0 && (
                <div className="flex gap-4 mt-6">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={social.label}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Links Section - Grouped to the right */}
          {linkGroups.length > 0 && (
            <div className="flex flex-wrap gap-12 md:gap-16">
              {linkGroups.map((group) => (
                <div key={group.title}>
                  <h3 className="text-sm font-semibold text-foreground mb-4">
                    {group.title}
                  </h3>
                  <ul className="space-y-3">
                    {group.links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                          {...(link.external && {
                            target: "_blank",
                            rel: "noopener noreferrer",
                          })}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {(copyright || bottomContent) && (
          <>
            <Separator className="my-8" />

            {/* Bottom Section */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              {copyright && (
                <p className="text-sm text-muted-foreground">{copyright}</p>
              )}
              {bottomContent}
            </div>
          </>
        )}
      </div>
    </footer>
  );
}
