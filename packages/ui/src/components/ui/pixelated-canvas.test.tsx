import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PixelatedCanvas } from "./pixelated-canvas";

class MockImage {
  onload: ((event: Event) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  naturalWidth = 12;
  naturalHeight = 12;
  complete = false;
  crossOrigin: string | null = null;
  private internalSrc = "";

  get src() {
    return this.internalSrc;
  }

  set src(value: string) {
    this.internalSrc = value;

    if (!value) {
      return;
    }

    setTimeout(() => {
      if (value.includes("cors-fail") && this.crossOrigin !== null) {
        this.onerror?.(new Event("error"));
        return;
      }

      this.complete = true;
      this.onload?.(new Event("load"));
    }, 0);
  }
}

describe("PixelatedCanvas", () => {
  beforeEach(() => {
    const mockData = new Uint8ClampedArray(12 * 12 * 4);

    for (let index = 0; index < mockData.length; index += 4) {
      mockData[index] = 120;
      mockData[index + 1] = 120;
      mockData[index + 2] = 120;
      mockData[index + 3] = 255;
    }

    const mockContext = {
      arc: vi.fn(),
      beginPath: vi.fn(),
      clearRect: vi.fn(),
      drawImage: vi.fn(),
      fill: vi.fn(),
      fillRect: vi.fn(),
      fillStyle: "#000",
      getImageData: vi.fn(() => ({ data: mockData }) as ImageData),
      globalAlpha: 1,
      resetTransform: vi.fn(),
      scale: vi.fn(),
    };

    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(((
      contextId: string,
    ) => {
      if (contextId === "2d") {
        return mockContext as unknown as CanvasRenderingContext2D;
      }

      return null;
    }) as typeof HTMLCanvasElement.prototype.getContext);

    vi.stubGlobal("Image", MockImage);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("renders with default accessible image semantics", () => {
    render(
      <PixelatedCanvas
        alt="Profile mosaic"
        cellSize={6}
        height={12}
        interactive={false}
        src="/image.png"
        width={12}
      />,
    );

    expect(screen.getByRole("img", { name: "Profile mosaic" })).toBeVisible();
  });

  it("respects aria-hidden without injecting aria-label", () => {
    const { container } = render(
      <PixelatedCanvas
        aria-hidden
        cellSize={6}
        height={12}
        interactive={false}
        src="/image.png"
        width={12}
      />,
    );

    const canvas = container.querySelector("canvas");
    expect(canvas).toHaveAttribute("aria-hidden", "true");
    expect(canvas).not.toHaveAttribute("aria-label");
    expect(canvas).not.toHaveAttribute("role");
  });

  it("calls onReady after image load, including CORS retry fallback", async () => {
    const onReady = vi.fn();

    render(
      <PixelatedCanvas
        cellSize={6}
        height={12}
        interactive={false}
        onReady={onReady}
        src="/cors-fail.png"
        width={12}
      />,
    );

    await waitFor(() => {
      expect(onReady).toHaveBeenCalledTimes(1);
    });
  });
});
