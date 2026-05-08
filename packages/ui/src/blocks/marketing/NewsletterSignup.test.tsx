import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NewsletterSignup } from "./NewsletterSignup";

describe("NewsletterSignup", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts email and source to the configured endpoint", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn(),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <NewsletterSignup
        buttonLabel="Join the List"
        endpoint="/api/subscribe"
        placeholder="Email for updates"
        source="factory-home"
        successDescription="We'll send the next update there."
        successTitle="You're on the list."
      />,
    );

    await user.type(
      screen.getByRole("textbox", { name: "Email address" }),
      "doug@example.com",
    );
    await user.click(screen.getByRole("button", { name: "Join the List" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "doug@example.com",
          source: "factory-home",
        }),
      });
    });
    expect(screen.getByText("You're on the list.")).toBeInTheDocument();
    expect(
      screen.getByText("We'll send the next update there."),
    ).toBeInTheDocument();
  });
});
