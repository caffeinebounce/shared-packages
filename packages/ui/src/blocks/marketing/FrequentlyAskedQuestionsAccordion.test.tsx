import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { FrequentlyAskedQuestionsAccordion } from "./FrequentlyAskedQuestionsAccordion";

vi.mock("motion/react", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  motion: {
    div: ({ children, ...props }: React.ComponentPropsWithoutRef<"div">) => (
      <div {...props}>{children}</div>
    ),
  },
  useReducedMotion: () => false,
}));

const items = [
  {
    question: "Is this investment advice only?",
    answer:
      "No. The point is coordination across investments, liquidity, taxes, estate, reporting, and decision rhythm.",
  },
  {
    question: "Can this stand alone?",
    answer:
      "Yes. Many clients eventually need more than one Factory service, but the right starting point depends on the current problem.",
  },
];

describe("FrequentlyAskedQuestionsAccordion", () => {
  it("renders heading copy and FAQ questions with the first answer open by default", () => {
    render(
      <FrequentlyAskedQuestionsAccordion
        eyebrow="Common Questions"
        heading="Frequently asked questions"
        description="A concise place for service details."
        items={items}
      />,
    );

    expect(screen.getByText("Common Questions")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Frequently asked questions" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("A concise place for service details."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Is this investment advice only?" }),
    ).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByText(/The point is coordination across investments/),
    ).toBeInTheDocument();
  });

  it("opens the configured default item", () => {
    render(
      <FrequentlyAskedQuestionsAccordion
        heading="Frequently asked questions"
        defaultOpenIndex={1}
        items={items}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Is this investment advice only?" }),
    ).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.getByRole("button", { name: "Can this stand alone?" }),
    ).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByText(/Many clients eventually need/),
    ).toBeInTheDocument();
  });

  it("opens one item at a time when a question is clicked", async () => {
    const user = userEvent.setup();

    render(
      <FrequentlyAskedQuestionsAccordion
        heading="Frequently asked questions"
        items={items}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Can this stand alone?" }),
    );

    expect(
      screen.getByRole("button", { name: "Is this investment advice only?" }),
    ).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.getByRole("button", { name: "Can this stand alone?" }),
    ).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByText(/right starting point depends/),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/The point is coordination across investments/),
    ).not.toBeInTheDocument();
  });
});
