import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressBar } from "./progress-bar";

describe("ProgressBar", () => {
  describe("percentage calculation", () => {
    it("calculates 50% for value=50, max=100", () => {
      const { container } = render(<ProgressBar value={50} max={100} />);
      expect(screen.getByText("50%")).toBeInTheDocument();

      const progressFill = container.querySelector(".bg-primary");
      expect(progressFill).toHaveStyle({ width: "50%" });
    });

    it("calculates 0% for value=0, max=100", () => {
      const { container } = render(<ProgressBar value={0} max={100} />);
      expect(screen.getByText("0%")).toBeInTheDocument();

      const progressFill = container.querySelector(".bg-primary");
      expect(progressFill).toHaveStyle({ width: "0%" });
    });

    it("caps at 100% when value exceeds max", () => {
      const { container } = render(<ProgressBar value={150} max={100} />);
      expect(screen.getByText("100%")).toBeInTheDocument();

      const progressFill = container.querySelector(".bg-primary");
      expect(progressFill).toHaveStyle({ width: "100%" });
    });

    it("caps at 0% for negative values", () => {
      const { container } = render(<ProgressBar value={-10} max={100} />);
      expect(screen.getByText("0%")).toBeInTheDocument();

      const progressFill = container.querySelector(".bg-primary");
      expect(progressFill).toHaveStyle({ width: "0%" });
    });

    it("handles custom max value", () => {
      const { container } = render(<ProgressBar value={25} max={50} />);
      expect(screen.getByText("50%")).toBeInTheDocument();

      const progressFill = container.querySelector(".bg-primary");
      expect(progressFill).toHaveStyle({ width: "50%" });
    });

    it("handles fractional percentages", () => {
      const { container } = render(<ProgressBar value={33} max={100} />);
      // Should round to 33%
      expect(screen.getByText("33%")).toBeInTheDocument();

      const progressFill = container.querySelector(".bg-primary");
      expect(progressFill).toHaveStyle({ width: "33%" });
    });
  });

  describe("ARIA attributes", () => {
    it("sets correct role and ARIA attributes", () => {
      render(<ProgressBar value={50} max={100} />);

      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toHaveAttribute("aria-valuenow", "50");
      expect(progressBar).toHaveAttribute("aria-valuemin", "0");
      expect(progressBar).toHaveAttribute("aria-valuemax", "100");
      expect(progressBar).toHaveAttribute(
        "aria-label",
        "Application 50% complete",
      );
    });

    it("updates ARIA attributes with different values", () => {
      render(<ProgressBar value={75} max={200} />);

      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toHaveAttribute("aria-valuenow", "75");
      expect(progressBar).toHaveAttribute("aria-valuemax", "200");
    });
  });

  describe("label rendering", () => {
    it("shows label by default", () => {
      render(<ProgressBar value={50} />);

      expect(screen.getByText("Application Progress")).toBeInTheDocument();
      expect(screen.getByText("50%")).toBeInTheDocument();
    });

    it("hides label when showLabel is false", () => {
      render(<ProgressBar value={50} showLabel={false} />);

      expect(
        screen.queryByText("Application Progress"),
      ).not.toBeInTheDocument();
      expect(screen.queryByText("50%")).not.toBeInTheDocument();
    });
  });

  describe("size variants", () => {
    it("applies small size class", () => {
      const { container } = render(<ProgressBar value={50} size="sm" />);
      const progressContainer = container.querySelector(".h-1\\.5");
      expect(progressContainer).toBeInTheDocument();
    });

    it("applies medium size class by default", () => {
      const { container } = render(<ProgressBar value={50} />);
      const progressContainer = container.querySelector(".h-2\\.5");
      expect(progressContainer).toBeInTheDocument();
    });

    it("applies large size class", () => {
      const { container } = render(<ProgressBar value={50} size="lg" />);
      const progressContainer = container.querySelector(".h-4");
      expect(progressContainer).toBeInTheDocument();
    });
  });

  describe("custom styling", () => {
    it("applies custom className", () => {
      const { container } = render(
        <ProgressBar value={50} className="custom-class" />,
      );
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("custom-class");
    });

    it("passes through additional props", () => {
      const { container } = render(
        <ProgressBar value={50} data-testid="progress" />,
      );
      const wrapper = container.firstChild;
      expect(wrapper).toHaveAttribute("data-testid", "progress");
    });
  });
});
