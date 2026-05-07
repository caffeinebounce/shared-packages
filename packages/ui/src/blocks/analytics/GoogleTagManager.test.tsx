import { render, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GoogleTagManager } from "./GoogleTagManager";

describe("GoogleTagManager", () => {
  afterEach(() => {
    document.head.innerHTML = "";
    document.body.innerHTML = "";
    delete window.dataLayer;
    vi.restoreAllMocks();
  });

  it("does not load GTM without a container ID", () => {
    render(<GoogleTagManager />);

    expect(
      document.querySelector('script[src*="googletagmanager.com/gtm.js"]'),
    ).toBeNull();
    expect(window.dataLayer).toBeUndefined();
  });

  it("does not load GTM when disabled", () => {
    render(<GoogleTagManager containerId="GTM-ABC123" enabled={false} />);

    expect(
      document.querySelector('script[src*="googletagmanager.com/gtm.js"]'),
    ).toBeNull();
    expect(window.dataLayer).toBeUndefined();
  });

  it("loads GTM with a normalized container ID", async () => {
    render(<GoogleTagManager containerId=" gtm-abc123 " />);

    await waitFor(() => {
      expect(
        document.querySelector('script[src*="googletagmanager.com/gtm.js"]'),
      ).toHaveAttribute(
        "src",
        "https://www.googletagmanager.com/gtm.js?id=GTM-ABC123",
      );
    });
    expect(window.dataLayer).toEqual(
      expect.arrayContaining([expect.objectContaining({ event: "gtm.js" })]),
    );
  });

  it("renders the noscript iframe fallback", () => {
    const html = renderToStaticMarkup(
      <GoogleTagManager containerId="GTM-ABC123" />,
    );

    expect(html).toContain(
      'src="https://www.googletagmanager.com/ns.html?id=GTM-ABC123"',
    );
  });

  it("does not load duplicate scripts", async () => {
    const { rerender } = render(<GoogleTagManager containerId="GTM-ABC123" />);

    await waitFor(() => {
      expect(
        document.querySelectorAll('script[src*="googletagmanager.com/gtm.js"]'),
      ).toHaveLength(1);
    });

    rerender(<GoogleTagManager containerId="GTM-ABC123" />);

    expect(
      document.querySelectorAll('script[src*="googletagmanager.com/gtm.js"]'),
    ).toHaveLength(1);
  });

  it("warns and skips unsafe container IDs", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    render(<GoogleTagManager containerId="G-ABC123" />);

    expect(warn).toHaveBeenCalledWith(
      "Invalid Google Tag Manager container ID: G-ABC123. Expected format: GTM-XXXXXXX",
    );
    expect(
      document.querySelector('script[src*="googletagmanager.com/gtm.js"]'),
    ).toBeNull();
  });
});
