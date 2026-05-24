import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Footer } from "./Footer";

describe("Footer", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses the shared container defaults in the default variant", () => {
    const { container } = render(
      <Footer logo={<span>Logo</span>} copyright="Copyright" />,
    );

    const footerContainer = container.querySelector(
      '[data-slot="footer-container"]',
    );

    expect(footerContainer).toHaveClass("w-full");
    expect(footerContainer).toHaveClass("px-4");
    expect(footerContainer).toHaveClass("sm:px-6");
    expect(footerContainer).toHaveClass("lg:px-8");
    expect(footerContainer).not.toHaveClass("md:px-8");
  });

  it("uses the shared container defaults in the brand variant", () => {
    const { container } = render(
      <Footer variant="brand" logo={<span>Logo</span>} copyright="Copyright" />,
    );

    const footerContainer = container.querySelector(
      '[data-slot="footer-container"]',
    );

    expect(footerContainer).toHaveClass("w-full");
    expect(footerContainer).toHaveClass("px-4");
    expect(footerContainer).toHaveClass("sm:px-6");
    expect(footerContainer).toHaveClass("lg:px-8");
    expect(footerContainer).not.toHaveClass("md:px-8");
  });

  it("preserves custom container overrides", () => {
    const { container } = render(
      <Footer
        variant="brand"
        logo={<span>Logo</span>}
        copyright="Copyright"
        containerClassName="max-w-5xl"
      />,
    );

    const footerContainer = container.querySelector(
      '[data-slot="footer-container"]',
    );

    expect(footerContainer).toHaveClass("max-w-5xl");
  });

  it("shows a brand newsletter signup by default", () => {
    render(
      <Footer variant="brand" logo={<span>Logo</span>} copyright="Copyright" />,
    );

    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
  });

  it("allows brand newsletter signup to be disabled", () => {
    render(
      <Footer
        variant="brand"
        logo={<span>Logo</span>}
        copyright="Copyright"
        newsletter={false}
      />,
    );

    expect(screen.queryByLabelText("Email address")).not.toBeInTheDocument();
  });

  it("renders logo in the minimal variant", () => {
    const { container } = render(
      <Footer
        variant="minimal"
        logo={<span>Factory</span>}
        copyright="Copyright"
      />,
    );

    const logo = container.querySelector('[data-slot="footer-logo"]');

    expect(logo).toHaveTextContent("Factory");
  });

  it("posts brand newsletter submissions to the configured endpoint", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ status: "subscribed" }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }),
    );

    render(
      <Footer
        variant="brand"
        logo={<span>Logo</span>}
        newsletter={{
          endpoint: "/api/subscribe",
          source: "footer-test",
          buttonText: "Join",
        }}
      />,
    );

    await user.type(screen.getByLabelText("Email address"), "doug@example.com");
    await user.click(screen.getByRole("button", { name: "Join" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/subscribe", {
        body: JSON.stringify({
          email: "doug@example.com",
          source: "footer-test",
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
    });
    expect(screen.getByText("You're subscribed!")).toBeInTheDocument();
  });

  it("applies newsletter customization props to callback submissions", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <Footer
        variant="brand"
        logo={<span>Logo</span>}
        newsletter={{
          buttonClassName: "callback-button",
          buttonText: "Request invite",
          inputClassName: "callback-input",
          inputLabel: "Work email",
          onSubmit,
          placeholder: "you@company.com",
        }}
      />,
    );

    const input = screen.getByLabelText("Work email");
    const button = screen.getByRole("button", { name: "Request invite" });

    expect(input).toHaveClass("callback-input");
    expect(input).toHaveAttribute("placeholder", "you@company.com");
    expect(button).toHaveClass("callback-button");

    await user.type(input, "doug@example.com");
    await user.click(button);

    expect(onSubmit).toHaveBeenCalledWith("doug@example.com");
    expect(input).toHaveValue("");
  });
});
