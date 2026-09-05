import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { GoogleAnalytics } from "./GoogleAnalytics";

describe("GoogleAnalytics", () => {
  afterEach(() => {
    cleanup();
    document.head.innerHTML = "";
    delete window.gtag;
    delete window.dataLayer;
  });

  it("queues initialization and events as Google tag command messages", () => {
    render(<GoogleAnalytics measurementId="G-TEST123" />);
    const script = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.googletagmanager.com/gtag/js?id=G-TEST123"]',
    );
    expect(script).not.toBeNull();
    fireEvent.load(script as HTMLScriptElement);
    window.gtag?.("event", "sign_up", { method: "website" });

    // gtag.js dispatches Arguments objects as commands. Plain arrays take
    // its separate data-model method branch and silently drop these calls.
    const commands = window.dataLayer ?? [];
    expect(commands).toHaveLength(3);
    for (const command of commands) {
      expect(Object.prototype.toString.call(command)).toBe(
        "[object Arguments]",
      );
      expect(Array.isArray(command)).toBe(false);
    }
    expect(
      commands.map((command) => Array.from(command as IArguments)),
    ).toEqual([
      ["js", expect.any(Date)],
      ["config", "G-TEST123"],
      ["event", "sign_up", { method: "website" }],
    ]);
  });
});
