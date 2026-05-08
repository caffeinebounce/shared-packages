import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ImagesSlider } from "./ImagesSlider";

describe("ImagesSlider", () => {
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
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("renders the current image, overlay, and children", () => {
    render(
      <ImagesSlider
        autoplay={false}
        images={[{ src: "/studio.jpg", alt: "Studio interior" }]}
      >
        <p>Featured space</p>
      </ImagesSlider>,
    );

    expect(
      screen.getByRole("region", { name: "Image slider" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Studio interior" }),
    ).toHaveAttribute("src", "/studio.jpg");
    expect(screen.getByText("Featured space")).toBeInTheDocument();
    expect(
      document.querySelector('[data-slot="images-slider-overlay"]'),
    ).toBeInTheDocument();
  });

  it("lets users select images with indicators", async () => {
    const user = userEvent.setup();
    const onIndexChange = vi.fn();

    render(
      <ImagesSlider
        autoplay={false}
        images={[
          { src: "/studio.jpg", alt: "Studio interior" },
          { src: "/exterior.jpg", alt: "Building exterior" },
        ]}
        onIndexChange={onIndexChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Show image 2" }));

    expect(onIndexChange).toHaveBeenCalledWith(1);
    expect(onIndexChange).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("button", { name: "Show image 2" }),
    ).toHaveAttribute("aria-current", "true");
    expect(
      screen.getByRole("img", { name: "Building exterior" }),
    ).toHaveAttribute("src", "/exterior.jpg");
  });

  it("allows active indicator styling to be themed", () => {
    render(
      <ImagesSlider
        activeIndicatorClassName="brand-active"
        autoplay={false}
        images={[
          { src: "/studio.jpg", alt: "Studio interior" },
          { src: "/exterior.jpg", alt: "Building exterior" },
        ]}
        indicatorButtonClassName="brand-indicator"
      />,
    );

    const firstIndicator = screen.getByRole("button", { name: "Show image 1" });
    const secondIndicator = screen.getByRole("button", {
      name: "Show image 2",
    });

    expect(firstIndicator).toHaveAttribute("data-active", "true");
    expect(firstIndicator).toHaveClass("brand-indicator");
    expect(firstIndicator).toHaveClass("brand-active");
    expect(secondIndicator).toHaveAttribute("data-active", "false");
    expect(secondIndicator).toHaveClass("brand-indicator");
    expect(secondIndicator).not.toHaveClass("brand-active");
  });

  it("supports left and right arrow keyboard controls", async () => {
    const user = userEvent.setup();

    render(
      <ImagesSlider
        autoplay={false}
        images={[
          { src: "/studio.jpg", alt: "Studio interior" },
          { src: "/exterior.jpg", alt: "Building exterior" },
        ]}
      />,
    );

    const slider = screen.getByRole("region", { name: "Image slider" });
    slider.focus();

    await user.keyboard("{ArrowRight}");

    expect(
      screen.getByRole("img", { name: "Building exterior" }),
    ).toHaveAttribute("src", "/exterior.jpg");

    await user.keyboard("{ArrowLeft}");

    expect(
      screen.getByRole("img", { name: "Studio interior" }),
    ).toHaveAttribute("src", "/studio.jpg");
  });

  it("prevents page arrow-key behavior when keyboard controls handle navigation", () => {
    render(
      <ImagesSlider
        autoplay={false}
        images={[
          { src: "/studio.jpg", alt: "Studio interior" },
          { src: "/exterior.jpg", alt: "Building exterior" },
        ]}
      />,
    );

    const slider = screen.getByRole("region", { name: "Image slider" });
    const event = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "ArrowRight",
    });
    const stopPropagation = vi.spyOn(event, "stopPropagation");

    act(() => {
      slider.dispatchEvent(event);
    });

    expect(event.defaultPrevented).toBe(true);
    expect(stopPropagation).toHaveBeenCalled();
    expect(
      screen.getByRole("img", { name: "Building exterior" }),
    ).toHaveAttribute("src", "/exterior.jpg");
  });

  it("scopes arrow-key navigation to the focused slider", async () => {
    const user = userEvent.setup();

    render(
      <>
        <ImagesSlider
          ariaLabel="First image slider"
          autoplay={false}
          images={[
            { src: "/first-studio.jpg", alt: "First studio" },
            { src: "/first-exterior.jpg", alt: "First exterior" },
          ]}
        />
        <ImagesSlider
          ariaLabel="Second image slider"
          autoplay={false}
          images={[
            { src: "/second-studio.jpg", alt: "Second studio" },
            { src: "/second-exterior.jpg", alt: "Second exterior" },
          ]}
        />
      </>,
    );

    screen.getByRole("region", { name: "First image slider" }).focus();
    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("img", { name: "First exterior" })).toHaveAttribute(
      "src",
      "/first-exterior.jpg",
    );
    expect(screen.getByRole("img", { name: "Second studio" })).toHaveAttribute(
      "src",
      "/second-studio.jpg",
    );

    screen.getByRole("region", { name: "Second image slider" }).focus();
    await user.keyboard("{ArrowRight}");

    expect(
      screen.getByRole("img", { name: "Second exterior" }),
    ).toHaveAttribute("src", "/second-exterior.jpg");
  });

  it("resets the autoplay timer after keyboard navigation", () => {
    vi.useFakeTimers();
    const onIndexChange = vi.fn();

    render(
      <ImagesSlider
        images={[
          { src: "/studio.jpg", alt: "Studio interior" },
          { src: "/exterior.jpg", alt: "Building exterior" },
        ]}
        intervalMs={1000}
        onIndexChange={onIndexChange}
      />,
    );

    const slider = screen.getByRole("region", { name: "Image slider" });

    act(() => {
      vi.advanceTimersByTime(900);
    });

    act(() => {
      slider.dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "ArrowRight" }),
      );
    });

    expect(
      screen.getByRole("img", { name: "Building exterior" }),
    ).toHaveAttribute("src", "/exterior.jpg");

    act(() => {
      vi.advanceTimersByTime(999);
    });

    expect(
      screen.getByRole("img", { name: "Building exterior" }),
    ).toHaveAttribute("src", "/exterior.jpg");

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(
      screen.getByRole("img", { name: "Studio interior" }),
    ).toHaveAttribute("src", "/studio.jpg");
    expect(onIndexChange).toHaveBeenCalledWith(1);
    expect(onIndexChange).toHaveBeenLastCalledWith(0);
    expect(onIndexChange).toHaveBeenCalledTimes(2);
  });

  it("keeps the incoming image in place while the outgoing image slides away", async () => {
    const user = userEvent.setup();

    render(
      <ImagesSlider
        autoplay={false}
        images={[
          { src: "/studio.jpg", alt: "Studio interior" },
          { src: "/exterior.jpg", alt: "Building exterior" },
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Show image 2" }));

    const incomingImage = screen.getByRole("img", {
      name: "Building exterior",
    });

    expect(incomingImage).toHaveStyle({ transform: "none" });
    expect(incomingImage).toHaveClass("z-0");
  });

  it("can render without overlay or indicators", () => {
    render(
      <ImagesSlider
        autoplay={false}
        images={["/studio.jpg"]}
        overlay={false}
        showIndicators={false}
      />,
    );

    expect(
      document.querySelector('[data-slot="images-slider-overlay"]'),
    ).not.toBeInTheDocument();
    expect(
      document.querySelector('[data-slot="images-slider-indicators"]'),
    ).not.toBeInTheDocument();
  });
});
