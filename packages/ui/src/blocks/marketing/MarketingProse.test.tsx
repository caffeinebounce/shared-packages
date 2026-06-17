import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MarketingProse } from "./MarketingProse";

describe("MarketingProse", () => {
  it("renders branded long-form copy with shared prose styling", () => {
    const { container } = render(
      <MarketingProse>
        <p>
          We help growth-ready businesses access the capital, knowledge, and
          networks they need to scale.
        </p>
      </MarketingProse>,
    );

    expect(
      screen.getByText(
        "We help growth-ready businesses access the capital, knowledge, and networks they need to scale.",
      ),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="marketing-prose"]'),
    ).toHaveClass("prose");
  });
});
