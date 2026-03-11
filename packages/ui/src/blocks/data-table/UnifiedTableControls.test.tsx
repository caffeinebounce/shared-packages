import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { UnifiedTableControls } from "./UnifiedTableControls";
import type { UnifiedTableControl } from "./UnifiedTableControls.schema";

function setViewportWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: width,
  });
  fireEvent(window, new Event("resize"));
}

describe("UnifiedTableControls", () => {
  it("renders one-row desktop controls at desktop width", () => {
    setViewportWidth(1280);

    const controls: UnifiedTableControl[] = [
      { kind: "export", desktop: <div>Export</div> },
      { kind: "period", desktop: <div>Period</div> },
    ];

    render(<UnifiedTableControls controls={controls} />);

    expect(screen.getByRole("toolbar")).toBeInTheDocument();
    expect(screen.getByText("Period")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /filters & settings/i }),
    ).toBeNull();
  });

  it("collapses to a single mobile entrypoint", () => {
    setViewportWidth(375);

    const controls: UnifiedTableControl[] = [
      {
        kind: "filters",
        desktop: <div>Filters Desktop</div>,
        mobile: <div>Filters Mobile</div>,
      },
    ];

    render(<UnifiedTableControls controls={controls} />);

    const trigger = screen.getByRole("button", { name: /filters & settings/i });
    expect(trigger).toBeInTheDocument();

    fireEvent.click(trigger);
    expect(screen.getByText("Filters Mobile")).toBeInTheDocument();
  });
});
