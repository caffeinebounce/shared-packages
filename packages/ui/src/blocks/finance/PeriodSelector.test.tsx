import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PeriodSelector } from "./PeriodSelector";

describe("PeriodSelector", () => {
  it("emits allDates payload when integrated all-dates mode is selected", () => {
    const onChange = vi.fn();

    render(
      <PeriodSelector
        granularity="month"
        periodStart="2026-02-01"
        periodEnd="2026-02-28"
        enableAllDates
        allDates={false}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /february 2026/i }));
    fireEvent.click(screen.getByRole("button", { name: /all dates/i }));

    expect(onChange).toHaveBeenCalledWith({
      granularity: "month",
      periodStart: "",
      periodEnd: "",
      timeUnit: "month",
      allDates: true,
    });
  });

  it("keeps existing behavior when all-dates mode is not enabled", () => {
    const onChange = vi.fn();

    render(
      <PeriodSelector
        granularity="month"
        periodStart="2026-02-01"
        periodEnd="2026-02-28"
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /february 2026/i }));

    expect(screen.queryByRole("button", { name: /all dates/i })).toBeNull();
  });
});
