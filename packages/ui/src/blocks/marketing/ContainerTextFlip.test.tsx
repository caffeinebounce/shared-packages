import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ContainerTextFlip } from "./ContainerTextFlip";

function currentWord() {
  return document.querySelector('[data-slot="container-text-flip-word"]')
    ?.textContent;
}

describe("ContainerTextFlip", () => {
  beforeEach(() => {
    vi.useFakeTimers();
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
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("cycles through the supplied words on the configured interval", () => {
    const onIndexChange = vi.fn();

    render(
      <ContainerTextFlip
        interval={1000}
        onIndexChange={onIndexChange}
        words={["Influence", "Infrastructure", "Ownership"]}
      />,
    );

    expect(currentWord()).toBe("Influence");
    expect(onIndexChange).toHaveBeenLastCalledWith(0, "Influence");

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(currentWord()).toBe("Infrastructure");
    expect(onIndexChange).toHaveBeenLastCalledWith(1, "Infrastructure");

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(currentWord()).toBe("Ownership");
    expect(onIndexChange).toHaveBeenLastCalledWith(2, "Ownership");
  });

  it("uses a stable accessible label for animated words", () => {
    render(
      <ContainerTextFlip
        ariaLabel="Influence to Infrastructure to Ownership"
        interval={1000}
        words={["Influence", "Infrastructure", "Ownership"]}
      />,
    );

    expect(
      screen.getByLabelText("Influence to Infrastructure to Ownership"),
    ).toHaveAttribute("data-slot", "container-text-flip");
    expect(
      screen.getByText("Influence to Infrastructure to Ownership"),
    ).toHaveClass("sr-only");
  });

  it("preserves spaces and can highlight words inside phrases", () => {
    render(
      <ContainerTextFlip
        highlightClassName="underlined-word"
        highlightWords={["creates"]}
        interval={1000}
        words={["Culture creates Influence."]}
      />,
    );

    expect(currentWord()?.replace(/\u00a0/g, " ")).toBe(
      "Culture creates Influence.",
    );
    expect(screen.getByText("creates")).toHaveClass("underlined-word");
  });

  it("does not start an interval when there is only one word", () => {
    const setIntervalSpy = vi.spyOn(globalThis, "setInterval");

    render(<ContainerTextFlip interval={1000} words={["Influence"]} />);

    expect(currentWord()).toBe("Influence");
    expect(setIntervalSpy).not.toHaveBeenCalled();
  });
});
