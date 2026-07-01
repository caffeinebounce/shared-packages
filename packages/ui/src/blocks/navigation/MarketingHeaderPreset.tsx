"use client";

import type { ReactNode } from "react";

import { Button } from "../../components/ui/button";
import { cn } from "../../utils";
import { Navbar, type NavbarProps, type NavLink } from "./Navbar";

export interface MarketingHeaderPresetCta {
  href: string;
  label: string;
  external?: boolean;
  variant?: "default" | "outline" | "secondary" | "link";
}

export interface MarketingHeaderPresetProps {
  logo: ReactNode;
  links?: NavLink[];
  primaryCta?: MarketingHeaderPresetCta;
  secondaryCta?: MarketingHeaderPresetCta;
  rightContent?: ReactNode;
  mobileContent?: ReactNode;
  className?: string;
  containerClassName?: string;
  variant?: NavbarProps["variant"];
  preset?: NavbarProps["preset"];
  sticky?: boolean;
  hideOnScrollDown?: boolean;
  showMobileMenu?: boolean;
  LinkComponent?: NavbarProps["LinkComponent"];
}

function renderCtaLink(
  cta: MarketingHeaderPresetCta,
  LinkComponent?: NavbarProps["LinkComponent"],
) {
  const linkProps = cta.external
    ? { href: cta.href, rel: "noreferrer noopener", target: "_blank" as const }
    : { href: cta.href };

  if (LinkComponent && !cta.external) {
    return <LinkComponent href={cta.href}>{cta.label}</LinkComponent>;
  }

  return <a {...linkProps}>{cta.label}</a>;
}

export function MarketingHeaderPreset({
  logo,
  links = [],
  primaryCta,
  secondaryCta,
  rightContent,
  mobileContent,
  className,
  containerClassName,
  variant = "blur",
  preset = "default",
  sticky = true,
  hideOnScrollDown = true,
  showMobileMenu = true,
  LinkComponent,
}: MarketingHeaderPresetProps) {
  const ctas = [secondaryCta, primaryCta].filter(
    (cta): cta is MarketingHeaderPresetCta => Boolean(cta),
  );

  const resolvedRightContent =
    ctas.length > 0 || rightContent ? (
      <div className="hidden items-center gap-2 md:flex">
        {secondaryCta ? (
          <Button asChild variant={secondaryCta.variant ?? "outline"} size="sm">
            {renderCtaLink(secondaryCta, LinkComponent)}
          </Button>
        ) : null}
        {primaryCta ? (
          <Button asChild variant={primaryCta.variant ?? "default"} size="sm">
            {renderCtaLink(primaryCta, LinkComponent)}
          </Button>
        ) : null}
        {rightContent}
      </div>
    ) : undefined;

  const resolvedMobileContent =
    mobileContent || ctas.length > 0 ? (
      <div className="flex flex-col gap-2 pt-2">
        {mobileContent}
        {secondaryCta ? (
          <Button
            asChild
            variant={secondaryCta.variant ?? "outline"}
            size="sm"
            className="justify-start"
          >
            {renderCtaLink(secondaryCta, LinkComponent)}
          </Button>
        ) : null}
        {primaryCta ? (
          <Button
            asChild
            variant={primaryCta.variant ?? "default"}
            size="sm"
            className="justify-start"
          >
            {renderCtaLink(primaryCta, LinkComponent)}
          </Button>
        ) : null}
      </div>
    ) : undefined;

  return (
    <Navbar
      logo={logo}
      links={links}
      rightContent={resolvedRightContent}
      mobileContent={resolvedMobileContent}
      className={cn(className)}
      containerClassName={containerClassName}
      variant={variant}
      preset={preset}
      sticky={sticky}
      hideOnScrollDown={hideOnScrollDown}
      showMobileMenu={showMobileMenu}
      LinkComponent={LinkComponent}
    />
  );
}
