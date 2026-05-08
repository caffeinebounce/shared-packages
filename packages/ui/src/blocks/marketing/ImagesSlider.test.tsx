import { render, screen } from "@testing-library/react";
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

    await user.keyboard("{ArrowRight}");

    expect(
      screen.getByRole("img", { name: "Building exterior" }),
    ).toHaveAttribute("src", "/exterior.jpg");

    await user.keyboard("{ArrowLeft}");

    expect(
      screen.getByRole("img", { name: "Studio interior" }),
    ).toHaveAttribute("src", "/studio.jpg");
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
