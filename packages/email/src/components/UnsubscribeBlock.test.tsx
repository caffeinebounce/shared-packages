import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UnsubscribeBlock } from "./UnsubscribeBlock";

describe("UnsubscribeBlock", () => {
  it("renders with default props", () => {
    const { container } = render(<UnsubscribeBlock />);

    const links = container.querySelectorAll("a");
    expect(links).toHaveLength(2);

    // Check preferences link
    expect(links[0].getAttribute("href")).toBe(
      "https://compass.thecapitalcollective.org/email-preferences",
    );
    expect(links[0].textContent).toBe("Email Preferences");

    // Check unsubscribe link
    expect(links[1].getAttribute("href")).toBe(
      "https://compass.thecapitalcollective.org/unsubscribe",
    );
    expect(links[1].textContent).toBe("Unsubscribe");
  });

  it("renders with email parameter", () => {
    const { container } = render(<UnsubscribeBlock email="user@example.com" />);

    const links = container.querySelectorAll("a");

    // Check that email is encoded in URLs
    expect(links[0].getAttribute("href")).toBe(
      "https://compass.thecapitalcollective.org/email-preferences?email=user%40example.com",
    );
    expect(links[1].getAttribute("href")).toBe(
      "https://compass.thecapitalcollective.org/unsubscribe?email=user%40example.com",
    );
  });

  it("renders with custom URLs", () => {
    const { container } = render(
      <UnsubscribeBlock
        unsubscribeUrl="https://example.com/unsub"
        preferencesUrl="https://example.com/prefs"
      />,
    );

    const links = container.querySelectorAll("a");

    expect(links[0].getAttribute("href")).toBe("https://example.com/prefs");
    expect(links[1].getAttribute("href")).toBe("https://example.com/unsub");
  });

  it("renders with custom URLs and email", () => {
    const { container } = render(
      <UnsubscribeBlock
        email="test@example.com"
        unsubscribeUrl="https://example.com/unsub"
        preferencesUrl="https://example.com/prefs"
      />,
    );

    const links = container.querySelectorAll("a");

    expect(links[0].getAttribute("href")).toBe(
      "https://example.com/prefs?email=test%40example.com",
    );
    expect(links[1].getAttribute("href")).toBe(
      "https://example.com/unsub?email=test%40example.com",
    );
  });

  it("renders default reason text", () => {
    const { container } = render(<UnsubscribeBlock />);

    expect(container.textContent).toContain(
      "You received this email because you have an account on Capital Compass.",
    );
  });

  it("renders custom reason text", () => {
    const { container } = render(
      <UnsubscribeBlock reason="Custom reason text" />,
    );

    expect(container.textContent).toContain("Custom reason text");
    expect(container.textContent).not.toContain(
      "You received this email because you have an account on Capital Compass.",
    );
  });

  it("renders company information", () => {
    const { container } = render(<UnsubscribeBlock />);

    expect(container.textContent).toContain("The Capital Collective");
    expect(container.textContent).toContain("Richmond, VA");
  });

  it("properly encodes special characters in email", () => {
    const { container } = render(
      <UnsubscribeBlock email="user+test@example.com" />,
    );

    const links = container.querySelectorAll("a");

    // The + should be encoded
    expect(links[0].getAttribute("href")).toContain(
      "email=user%2Btest%40example.com",
    );
    expect(links[1].getAttribute("href")).toContain(
      "email=user%2Btest%40example.com",
    );
  });

  it("renders separator between links", () => {
    const { container } = render(<UnsubscribeBlock />);

    expect(container.textContent).toContain("|");
  });

  it("renders all required elements", () => {
    const { container } = render(<UnsubscribeBlock email="user@example.com" />);

    // Check for links
    const links = container.querySelectorAll("a");
    expect(links).toHaveLength(2);

    // Check for reason text
    expect(container.textContent).toContain(
      "You received this email because you have an account on Capital Compass.",
    );

    // Check for company info
    expect(container.textContent).toContain("The Capital Collective");
    expect(container.textContent).toContain("Richmond, VA");

    // Check for separator
    expect(container.textContent).toContain("|");
  });
});
