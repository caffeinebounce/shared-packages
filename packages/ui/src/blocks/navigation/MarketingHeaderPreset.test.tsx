import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { MarketingHeaderPreset } from "./MarketingHeaderPreset";

function TestLink({
  href,
  className,
  children,
  onClick,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  );
}

describe("MarketingHeaderPreset", () => {
  it("renders desktop navigation links and CTAs", () => {
    render(
      <MarketingHeaderPreset
        logo={<span>Capital Collective</span>}
        links={[
          { href: "/about", label: "About" },
          { href: "/programs", label: "Programs" },
        ]}
        primaryCta={{ href: "/apply", label: "Apply Now" }}
        secondaryCta={{ href: "/contact", label: "Contact" }}
        LinkComponent={TestLink}
      />,
    );

    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
      "href",
      "/about",
    );
    expect(screen.getByRole("link", { name: "Programs" })).toHaveAttribute(
      "href",
      "/programs",
    );
    expect(
      screen.getAllByRole("link", { name: "Apply Now" })[0],
    ).toHaveAttribute("href", "/apply");
    expect(screen.getAllByRole("link", { name: "Contact" })[0]).toHaveAttribute(
      "href",
      "/contact",
    );
  });
});
