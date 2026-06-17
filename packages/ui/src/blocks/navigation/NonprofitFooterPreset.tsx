"use client";

import type { ReactNode } from "react";

import { Footer, type FooterLinkGroup, type FooterProps } from "./Footer";

export interface NonprofitFooterPresetLink {
  href: string;
  label: string;
  external?: boolean;
}

export interface NonprofitFooterPresetProps {
  logo?: ReactNode;
  tagline?: ReactNode;
  supportTitle?: string;
  supportLinks?: NonprofitFooterPresetLink[];
  legalTitle?: string;
  legalLinks?: NonprofitFooterPresetLink[];
  socialLinks?: FooterProps["socialLinks"];
  newsletter?: FooterProps["newsletter"];
  copyright?: string;
  bottomContent?: ReactNode;
  className?: string;
  containerClassName?: string;
}

function toLinkGroup(
  title: string,
  links: NonprofitFooterPresetLink[],
): FooterLinkGroup {
  return {
    title,
    links: links.map((link) => ({
      href: link.href,
      label: link.label,
      external: link.external,
    })),
  };
}

export function NonprofitFooterPreset({
  logo,
  tagline,
  supportTitle = "Support",
  supportLinks = [],
  legalTitle = "Legal",
  legalLinks = [],
  socialLinks = [],
  newsletter,
  copyright,
  bottomContent,
  className,
  containerClassName,
}: NonprofitFooterPresetProps) {
  const linkGroups: FooterLinkGroup[] = [];

  if (supportLinks.length > 0) {
    linkGroups.push(toLinkGroup(supportTitle, supportLinks));
  }

  if (legalLinks.length > 0) {
    linkGroups.push(toLinkGroup(legalTitle, legalLinks));
  }

  return (
    <Footer
      variant="brand"
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
