import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HoverBorderCTAGroup } from "./HoverBorderCTAGroup";

describe("HoverBorderCTAGroup", () => {
  it("renders CTA cards", () => {
    render(
      <HoverBorderCTAGroup
        items={[
          {
            id: "1",
            title: "Start trial",
            description: "No credit card",
            href: "/trial",
            ctaLabel: "Try now",
          },
        ]}
      />,
    );

    expect(screen.getByText("Start trial")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Try now" })).toHaveAttribute(
      "href",
      "/trial",
    );
  });
});
