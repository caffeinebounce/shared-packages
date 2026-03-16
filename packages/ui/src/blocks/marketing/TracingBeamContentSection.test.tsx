import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TracingBeamContentSection } from "./TracingBeamContentSection";

describe("TracingBeamContentSection", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation(() => ({
        matches: false,
        media: "",
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders timeline content", () => {
    render(
      <TracingBeamContentSection
        items={[
          { id: "a", title: "Connect", body: "Import data" },
          { id: "b", title: "Analyze", body: "Generate insights" },
        ]}
      />,
    );

    expect(screen.getByText("Connect")).toBeInTheDocument();
    expect(screen.getByText("Analyze")).toBeInTheDocument();
  });
});
