"use client";

import { type FormEvent, type ReactNode, useState } from "react";
import { Button } from "../../components/ui/button";
import { Container } from "../../components/ui/container";
import { Input } from "../../components/ui/input";
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
  /** Additional classes layered onto the shared container width/padding system. */
  containerClassName?: string;
  /** Footer variant */
  variant?: "default" | "brand" | "minimal";
  /** Tagline text (brand variant) */
  tagline?: string | ReactNode;
  /** Newsletter CTA config (brand variant) */
  newsletter?: {
    placeholder?: string;
    buttonText?: string;
    onSubmit?: (email: string) => void;
  };
}

export function Footer({
  logo,
  linkGroups = [],
  socialLinks = [],
  copyright,
  bottomContent,
  className,
  containerClassName,
  variant = "default",
  tagline,
  newsletter,
}: FooterProps) {
  if (variant === "minimal") {
    return (
      <MinimalFooter
        copyright={copyright}
        socialLinks={socialLinks}
        linkGroups={linkGroups}
        className={className}
        containerClassName={containerClassName}
      />
    );
  }

  if (variant === "brand") {
    return (
      <BrandFooter
        logo={logo}
        tagline={tagline}
        newsletter={newsletter}
        linkGroups={linkGroups}
        socialLinks={socialLinks}
        copyright={copyright}
        bottomContent={bottomContent}
        className={className}
        containerClassName={containerClassName}
      />
    );
  }

  // Default variant — original implementation
  return (
    <footer className={cn("bg-muted/50 border-t", className)}>
      <Container
        data-slot="footer-container"
        className={cn("py-12 md:py-16", containerClassName)}
      >
        <div className="flex flex-col md:flex-row justify-between gap-8">
          {logo && (
            <div className="shrink-0">
              {logo}
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
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              {copyright && (
                <p className="text-sm text-muted-foreground">{copyright}</p>
              )}
              {bottomContent}
            </div>
          </>
        )}
      </Container>
    </footer>
  );
}

// ── Brand variant ──────────────────────────────────────────────

function BrandFooter({
  logo,
  tagline,
  newsletter,
  linkGroups = [],
  socialLinks = [],
  copyright,
  bottomContent,
  className,
  containerClassName,
}: Pick<
  FooterProps,
  | "logo"
  | "tagline"
  | "newsletter"
  | "linkGroups"
  | "socialLinks"
  | "copyright"
  | "bottomContent"
  | "className"
  | "containerClassName"
>) {
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e: FormEvent) => {
    e.preventDefault();
    newsletter?.onSubmit?.(email);
    setEmail("");
  };

  return (
    <footer
      className={cn("backdrop-blur-2xl", className)}
      style={{
        background:
          "linear-gradient(to bottom, color-mix(in oklch, var(--color-primary, #6366f1) 4%, var(--color-background, #fff)), color-mix(in oklch, var(--color-primary, #6366f1) 8%, var(--color-muted, #f5f5f5)))",
        borderTop: "1px solid var(--color-border, hsl(var(--border)))",
      }}
    >
      {/* Decorative gradient border-top */}
      <div
        style={{
          height: "1px",
          background:
            "linear-gradient(to right, transparent, color-mix(in oklch, var(--color-primary, #6366f1) 30%, transparent), transparent)",
        }}
      />

      <Container
        data-slot="footer-container"
        className={cn("py-16 md:py-20", containerClassName)}
      >
        {/* Top zone: logo + tagline / newsletter */}
        {(logo || tagline || newsletter) && (
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
            <div className="space-y-3">
              {logo}
              {tagline && (
                <p className="text-base text-muted-foreground max-w-sm">
                  {tagline}
                </p>
              )}
            </div>

            {newsletter && (
              <form
                onSubmit={handleNewsletterSubmit}
                className="flex gap-2 w-full max-w-sm"
              >
                <Input
                  type="email"
                  placeholder={newsletter.placeholder ?? "Enter your email"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                  required
                />
                <Button type="submit" size="sm">
                  {newsletter.buttonText ?? "Subscribe"}
                </Button>
              </form>
            )}
          </div>
        )}

        {/* Middle zone: link groups grid */}
        {linkGroups.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
            {linkGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  {group.title}
                </h3>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground/80 hover:text-foreground transition-colors"
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

        {/* Bottom zone */}
        <Separator className="mb-8" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {copyright && (
            <p className="text-sm text-muted-foreground">{copyright}</p>
          )}

          {socialLinks.length > 0 && (
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                  data-slot="footer-social-link"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          )}

          {bottomContent}
        </div>
      </Container>
    </footer>
  );
}

// ── Minimal variant ────────────────────────────────────────────

function MinimalFooter({
  copyright,
  socialLinks = [],
  linkGroups = [],
  className,
  containerClassName,
}: Pick<
  FooterProps,
  | "copyright"
  | "socialLinks"
  | "linkGroups"
  | "className"
  | "containerClassName"
>) {
  // Flatten all links for the minimal row
  const allLinks = linkGroups.flatMap((g) => g.links);

  return (
    <footer className={cn("bg-background border-t border-border", className)}>
      <Container
        data-slot="footer-container"
        className={cn("py-6", containerClassName)}
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {copyright && (
            <p className="text-sm text-muted-foreground">{copyright}</p>
          )}

          {socialLinks.length > 0 && (
            <div className="flex gap-3">
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

          {allLinks.length > 0 && (
            <div className="flex gap-4">
              {allLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  {...(link.external && {
                    target: "_blank",
                    rel: "noopener noreferrer",
                  })}
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </Container>
    </footer>
  );
}
