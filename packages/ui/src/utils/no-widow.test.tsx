import { render, screen, waitFor } from "@testing-library/react";
import { Fragment, useEffect, useState } from "react";
import { describe, expect, it } from "vitest";
import { NoWidowText, preventWidowsInReactNode } from "./no-widow";
import { NoWidowProvider } from "./no-widow-provider";

function DynamicCopy() {
  const [copy, setCopy] = useState("Loading");

  useEffect(() => {
    setCopy("Dynamic culture ownership");
  }, []);

  return <p>{copy}</p>;
}

describe("preventWidowsInReactNode", () => {
  it("transforms string children", () => {
    expect(preventWidowsInReactNode("Factory helps clients build")).toBe(
      "Factory\u00A0helps clients\u00A0build",
    );
  });

  it("transforms arrays, fragments, and nested elements", () => {
    const result = preventWidowsInReactNode(
      <>
        Factory helps clients build
        <span>Durable wealth ownership</span>
      </>,
    );

    const { container } = render(<div>{result}</div>);

    expect(container.textContent).toBe(
      "Factory\u00A0helps clients\u00A0buildDurable wealth\u00A0ownership",
    );
  });

  it("preserves array identity when no child changes", () => {
    const children = [<code key="code">Factory helps clients build</code>];

    expect(preventWidowsInReactNode(children)).toBe(children);
  });

  it("skips code and opted-out elements", () => {
    const result = preventWidowsInReactNode(
      <div>
        <p>Factory helps clients build</p>
        <code>Factory helps clients build</code>
        <span data-widow-control="off">Factory helps clients build</span>
      </div>,
    );

    const { container } = render(<div>{result}</div>);

    expect(container.querySelector("p")?.textContent).toBe(
      "Factory\u00A0helps clients\u00A0build",
    );
    expect(container.querySelector("code")?.textContent).toBe(
      "Factory helps clients build",
    );
    expect(
      container.querySelector("[data-widow-control='off']")?.textContent,
    ).toBe("Factory helps clients build");
  });
});

describe("NoWidowText", () => {
  it("renders transformed copy with configured word count", () => {
    render(
      <NoWidowText as="h2" wordCount={3}>
        We turn culture and influence into capital and ownership.
      </NoWidowText>,
    );

    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(
      "We turn culture and influence into capital\u00A0and\u00A0ownership.",
    );
  });

  it("accepts element-specific props when rendered polymorphically", () => {
    render(
      <NoWidowText as="a" href="/start">
        Start ownership journey
      </NoWidowText>,
    );

    expect(screen.getByRole("link")).toHaveAttribute("href", "/start");
    expect(screen.getByRole("link").textContent).toBe(
      "Start ownership\u00A0journey",
    );
  });
});

describe("NoWidowProvider", () => {
  it("processes eligible UI text after hydration", async () => {
    const { container } = render(
      <Fragment>
        <NoWidowProvider defaultWordCount={2} />
        <p>Factory helps clients build</p>
        <button type="button">Submit next steps</button>
      </Fragment>,
    );

    await waitFor(() => {
      expect(container.querySelector("p")?.textContent).toBe(
        "Factory\u00A0helps clients\u00A0build",
      );
    });

    expect(screen.getByRole("button").textContent).toBe(
      "Submit next\u00A0steps",
    );
  });

  it("uses data-widow-words for stronger element-level locks", async () => {
    render(
      <Fragment>
        <NoWidowProvider defaultWordCount={2} />
        <h2 data-widow-words="3">
          We turn culture into capital and ownership.
        </h2>
      </Fragment>,
    );

    await waitFor(() => {
      expect(screen.getByRole("heading").textContent).toBe(
        "We turn culture into capital\u00A0and\u00A0ownership.",
      );
    });
  });

  it("preserves selector entries that contain commas", async () => {
    const { container } = render(
      <Fragment>
        <NoWidowProvider selectors={["p:not(.skip, .other)"]} />
        <p>Factory helps clients build</p>
        <p className="skip">Factory helps clients build</p>
      </Fragment>,
    );

    await waitFor(() => {
      expect(container.querySelector("p")?.textContent).toBe(
        "Factory\u00A0helps clients\u00A0build",
      );
    });

    expect(container.querySelector(".skip")?.textContent).toBe(
      "Factory helps clients build",
    );
  });

  it("ignores excluded and opted-out DOM nodes", async () => {
    const { container } = render(
      <Fragment>
        <NoWidowProvider defaultWordCount={2} />
        <p data-no-widow>Factory helps clients build</p>
        <code>Factory helps clients build</code>
        <label htmlFor="name">Factory helps clients build</label>
        <input id="name" defaultValue="Factory helps clients build" />
      </Fragment>,
    );

    await waitFor(() => {
      expect(container.querySelector("label")?.textContent).toBe(
        "Factory\u00A0helps clients\u00A0build",
      );
    });

    expect(container.querySelector("p")?.textContent).toBe(
      "Factory helps clients build",
    );
    expect(container.querySelector("code")?.textContent).toBe(
      "Factory helps clients build",
    );
    expect(screen.getByRole("textbox")).toHaveValue(
      "Factory helps clients build",
    );
  });

  it("processes dynamic text mutations", async () => {
    const { container } = render(
      <Fragment>
        <NoWidowProvider defaultWordCount={2} />
        <DynamicCopy />
      </Fragment>,
    );

    await waitFor(() => {
      expect(container.querySelector("p")?.textContent).toBe(
        "Dynamic culture\u00A0ownership",
      );
    });
  });
});
