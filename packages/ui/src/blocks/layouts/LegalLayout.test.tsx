import { fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LegalLayout } from "./LegalLayout";
import { LegalSection } from "./LegalSection";

class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
}

describe("LegalLayout", () => {
  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("renders a sticky legal header with back link and metadata", () => {
    const { container, getByRole, getByText } = render(
      <LegalLayout
        title="Privacy Policy"
        lastUpdated="January 1, 2026"
        backHref="/login"
        backLabel="Back to sign in"
        tableOfContents={[{ id: "intro", title: "Introduction" }]}
      >
        <LegalSection id="intro" title="Introduction">
          <p>Welcome.</p>
        </LegalSection>
      </LegalLayout>,
    );

    const header = container.querySelector('[data-slot="legal-page-header"]');

    expect(header).toHaveClass("sticky");
    expect(getByRole("link", { name: /back to sign in/i })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(getByText("Last updated: January 1, 2026")).toBeInTheDocument();
  });

  it("smooth-scrolls table of contents links below the sticky header", () => {
    const scrollTo = vi.fn();
    const matchMedia = vi.fn().mockReturnValue({ matches: false });
    const pushState = vi
      .spyOn(window.history, "pushState")
      .mockImplementation(() => undefined);

    vi.stubGlobal("scrollTo", scrollTo);
    vi.stubGlobal("matchMedia", matchMedia);

    const { container, getAllByRole } = render(
      <LegalLayout
        title="Terms"
        backHref="/login"
        tableOfContents={[{ id: "intro", title: "Introduction" }]}
      >
        <LegalSection id="intro" title="Introduction">
          <p>Welcome.</p>
        </LegalSection>
      </LegalLayout>,
    );

    const header = container.querySelector('[data-slot="legal-page-header"]');
    const section = container.querySelector("#intro");
    const heading = container.querySelector("#intro h2");

    vi.spyOn(header as Element, "getBoundingClientRect").mockReturnValue({
      bottom: 96,
    } as DOMRect);
    vi.spyOn(section as Element, "getBoundingClientRect").mockReturnValue({
      top: 400,
    } as DOMRect);
    vi.spyOn(heading as Element, "getBoundingClientRect").mockReturnValue({
      top: 360,
    } as DOMRect);

    fireEvent.click(getAllByRole("link", { name: "Introduction" })[0]);

    expect(scrollTo).toHaveBeenCalledWith({
      top: 256,
      behavior: "smooth",
    });
    expect(pushState).toHaveBeenCalledWith(null, "", "#intro");
  });
});
