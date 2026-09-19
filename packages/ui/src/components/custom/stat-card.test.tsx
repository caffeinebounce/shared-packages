import { fireEvent, render, screen } from "@testing-library/react";
import { Users } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { StatCard, StatCardsContainer } from "./stat-card";

describe("StatCard", () => {
  describe("basic rendering", () => {
    it("renders title and value", () => {
      render(<StatCard title="Total Users" value={1234} />);

      expect(screen.getByText("Total Users")).toBeInTheDocument();
      expect(screen.getByText("1,234")).toBeInTheDocument();
    });

    it("renders string value as-is", () => {
      render(<StatCard title="Status" value="Active" />);

      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    it("renders description", () => {
      render(
        <StatCard
          title="Revenue"
          value={50000}
          description="Monthly recurring revenue"
        />,
      );

      expect(screen.getByText("Monthly recurring revenue")).toBeInTheDocument();
    });

    it("renders footer", () => {
      render(<StatCard title="Users" value={100} footer="Updated just now" />);

      expect(screen.getByText("Updated just now")).toBeInTheDocument();
    });

    it("renders icon", () => {
      render(
        <StatCard
          title="Users"
          value={100}
          icon={<Users data-testid="user-icon" />}
        />,
      );

      expect(screen.getByTestId("user-icon")).toBeInTheDocument();
    });
  });

  describe("value formatting", () => {
    it("formats number with locale by default", () => {
      render(<StatCard title="Count" value={1234567} />);

      // Large numbers get compact notation
      expect(screen.getByText("1.2M")).toBeInTheDocument();
    });

    it("formats with currency format", () => {
      render(<StatCard title="Revenue" value={1234} format="currency" />);

      expect(screen.getByText("$1,234")).toBeInTheDocument();
    });

    it("formats with percent format", () => {
      render(<StatCard title="Growth" value={12.5} format="percent" />);

      expect(screen.getByText("12.5%")).toBeInTheDocument();
    });

    it("formats with compact notation", () => {
      render(<StatCard title="Views" value={1500} format="compact" />);

      expect(screen.getByText("1.5K")).toBeInTheDocument();
    });

    it("formats with none (as-is)", () => {
      render(<StatCard title="Code" value={12345} format="none" />);

      expect(screen.getByText("12345")).toBeInTheDocument();
    });

    it("supports legacy formatValue prop", () => {
      render(<StatCard title="Count" value={1234} formatValue />);

      expect(screen.getByText("1,234")).toBeInTheDocument();
    });
  });

  describe("trend indicator", () => {
    it("renders upward trend with positive value", () => {
      render(
        <StatCard
          title="Users"
          value={100}
          trend={{ value: 12.5, direction: "up" }}
        />,
      );

      expect(screen.getByText("+12.5%")).toBeInTheDocument();
    });

    it("renders downward trend with negative value", () => {
      render(
        <StatCard
          title="Users"
          value={100}
          trend={{ value: -5, direction: "down" }}
        />,
      );

      expect(screen.getByText("-5%")).toBeInTheDocument();
    });

    it("renders neutral trend", () => {
      render(
        <StatCard
          title="Users"
          value={100}
          trend={{ value: 0, direction: "neutral" }}
        />,
      );

      expect(screen.getByText("+0%")).toBeInTheDocument();
    });

    it("renders trend label", () => {
      render(
        <StatCard
          title="Users"
          value={100}
          trend={{ value: 10, direction: "up", label: "vs last month" }}
        />,
      );

      expect(screen.getByText("vs last month")).toBeInTheDocument();
    });

    it("renders absolute value when isPercentage is false", () => {
      render(
        <StatCard
          title="Users"
          value={100}
          trend={{ value: 50, direction: "up", isPercentage: false }}
        />,
      );

      expect(screen.getByText("+50")).toBeInTheDocument();
    });
  });

  describe("variants", () => {
    it("renders with default variant", () => {
      const { container } = render(
        <StatCard title="Test" value={100} variant="default" />,
      );

      const card = container.firstChild;
      expect(card).toBeInTheDocument();
    });

    it("renders with gradient variant", () => {
      const { container } = render(
        <StatCard title="Test" value={100} variant="gradient" />,
      );

      const card = container.firstChild;
      expect(card).toHaveClass("bg-gradient-to-t");
    });

    it("renders with outline variant", () => {
      const { container } = render(
        <StatCard title="Test" value={100} variant="outline" />,
      );

      const card = container.firstChild;
      expect(card).toHaveClass("border-2");
    });

    it("renders with muted variant", () => {
      const { container } = render(
        <StatCard title="Test" value={100} variant="muted" />,
      );

      const card = container.firstChild;
      expect(card).toHaveClass("bg-linear-to-t");
    });
  });

  describe("interactivity", () => {
    it("calls onClick when clicked", () => {
      const handleClick = vi.fn();
      render(<StatCard title="Test" value={100} onClick={handleClick} />);

      const card = screen.getByText("Test").closest("[class*='card']");
      fireEvent.click(card!);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("renders link when href provided", () => {
      render(<StatCard title="Test" value={100} href="/dashboard" />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/dashboard");
    });
  });

  describe("flip-to-chart feature", () => {
    const mockChartData = {
      data: [
        { label: "Mon", value: 10 },
        { label: "Tue", value: 25 },
        { label: "Wed", value: 18 },
        { label: "Thu", value: 32 },
        { label: "Fri", value: 45 },
      ],
      type: "area" as const,
    };

    it("renders flip indicator when chart is provided", () => {
      const { container } = render(
        <StatCard title="Users" value={100} chart={mockChartData} />,
      );

      // Should have flip indicator dots (now a div, not buttons)
      const flipIndicators = container.querySelectorAll('[aria-hidden="true"]');
      expect(flipIndicators.length).toBeGreaterThan(0);
    });

    it("flips to chart on click", () => {
      const { container } = render(
        <StatCard title="Users" value={100} chart={mockChartData} />,
      );

      // Find the main flip button (the card container)
      const flipButton = container.querySelector('button[type="button"]');
      expect(flipButton).toBeInTheDocument();

      // Click to flip
      fireEvent.click(flipButton!);

      // Should now show chart view (rotated)
      expect(flipButton).toHaveClass("[transform:rotateY(180deg)]");
    });

    it("starts on chart side when defaultSide is chart", () => {
      const { container } = render(
        <StatCard
          title="Users"
          value={100}
          chart={mockChartData}
          defaultSide="chart"
        />,
      );

      const flipButton = container.querySelector('button[type="button"]');
      expect(flipButton).toHaveClass("[transform:rotateY(180deg)]");
    });

    it("renders chart with period label", () => {
      render(
        <StatCard
          title="Users"
          value={100}
          chart={{ ...mockChartData, periodLabel: "Last 7 days" }}
        />,
      );

      expect(screen.getByText("Last 7 days")).toBeInTheDocument();
    });

    it("renders chart x-axis labels", () => {
      render(<StatCard title="Users" value={100} chart={mockChartData} />);

      expect(screen.getByText("Mon")).toBeInTheDocument();
      expect(screen.getByText("Fri")).toBeInTheDocument();
    });

    it("handles single data point without division by zero", () => {
      const singlePointData = {
        data: [{ label: "Today", value: 42 }],
        type: "area" as const,
      };

      // Should render without throwing
      const { container } = render(
        <StatCard title="Users" value={100} chart={singlePointData} />,
      );

      // Chart should be rendered
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();

      // Labels should show (appears twice - start and end)
      const labels = screen.getAllByText("Today");
      expect(labels.length).toBe(2);
    });

    it("has accessible aria attributes on flip button", () => {
      const { container } = render(
        <StatCard title="Users" value={100} chart={mockChartData} />,
      );

      const flipButton = container.querySelector('button[type="button"]');
      expect(flipButton).toHaveAttribute("aria-label", "Show chart view");
      expect(flipButton).toHaveAttribute("aria-pressed", "false");
    });
  });
});

describe("StatCardsContainer", () => {
  it("renders children in a grid", () => {
    const { container } = render(
      <StatCardsContainer>
        <StatCard title="Card 1" value={1} />
        <StatCard title="Card 2" value={2} />
      </StatCardsContainer>,
    );

    const grid = container.firstChild;
    expect(grid).toHaveClass("grid");
  });

  it("applies default column classes", () => {
    const { container } = render(
      <StatCardsContainer>
        <StatCard title="Card 1" value={1} />
      </StatCardsContainer>,
    );

    const grid = container.firstChild;
    expect(grid).toHaveClass("grid-cols-1");
    expect(grid).toHaveClass("sm:grid-cols-2");
    expect(grid).toHaveClass("lg:grid-cols-4");
  });

  it("applies custom column configuration", () => {
    const { container } = render(
      <StatCardsContainer columns={{ default: 2, sm: 3, md: 4, lg: 4 }}>
        <StatCard title="Card 1" value={1} />
      </StatCardsContainer>,
    );

    const grid = container.firstChild;
    expect(grid).toHaveClass("grid-cols-2");
    expect(grid).toHaveClass("sm:grid-cols-3");
    expect(grid).toHaveClass("md:grid-cols-4");
    expect(grid).toHaveClass("lg:grid-cols-4");
  });

  it("applies custom className", () => {
    const { container } = render(
      <StatCardsContainer className="custom-class">
        <StatCard title="Card 1" value={1} />
      </StatCardsContainer>,
    );

    const grid = container.firstChild;
    expect(grid).toHaveClass("custom-class");
  });
});
