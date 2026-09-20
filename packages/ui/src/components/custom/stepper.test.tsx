import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Stepper, type StepperStep } from "./stepper";

describe("Stepper", () => {
  const mockSteps: StepperStep[] = [
    { id: "step1", label: "Step 1", description: "First step" },
    { id: "step2", label: "Step 2", description: "Second step" },
    { id: "step3", label: "Step 3", description: "Third step" },
  ];

  describe("rendering", () => {
    it("renders correct number of steps in desktop view", () => {
      render(
        <Stepper
          steps={mockSteps}
          currentStep="step1"
          completedSteps={[]}
          onStepClick={vi.fn()}
        />,
      );

      // Check that step labels are present (they appear in both desktop and mobile)
      const labels = screen.getAllByText("Step 1");
      expect(labels.length).toBeGreaterThan(0);
    });

    it("shows mobile view with step count", () => {
      render(
        <Stepper
          steps={mockSteps}
          currentStep="step2"
          completedSteps={["step1"]}
          onStepClick={vi.fn()}
        />,
      );

      expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();
    });

    it("can render compact visual steps on mobile", () => {
      const { container } = render(
        <Stepper
          steps={mockSteps}
          currentStep="step2"
          completedSteps={["step1"]}
          mobileVariant="steps"
          size="compact"
          onStepClick={vi.fn()}
        />,
      );

      const mobileSteps = container.querySelector(
        '[data-slot="stepper-mobile-steps"]',
      );
      expect(mobileSteps).toBeInTheDocument();
      expect(mobileSteps).toHaveTextContent("Step 1");
      expect(mobileSteps).toHaveTextContent("Step 2");
      expect(mobileSteps).toHaveTextContent("Step 3");
      expect(screen.queryByText("Step 2 of 3")).not.toBeInTheDocument();
    });
  });

  describe("current step highlighting", () => {
    it("highlights current step with aria-current", () => {
      render(
        <Stepper
          steps={mockSteps}
          currentStep="step2"
          completedSteps={["step1"]}
          onStepClick={vi.fn()}
        />,
      );

      const buttons = screen.getAllByRole("button");
      const currentButton = buttons.find(
        (btn) => btn.getAttribute("aria-current") === "step",
      );
      expect(currentButton).toBeDefined();
    });

    it("shows step number for incomplete steps", () => {
      const { container } = render(
        <Stepper
          steps={mockSteps}
          currentStep="step1"
          completedSteps={[]}
          onStepClick={vi.fn()}
        />,
      );

      // Step numbers should be visible in the circles
      expect(container.textContent).toContain("1");
      expect(container.textContent).toContain("2");
      expect(container.textContent).toContain("3");
    });
  });

  describe("completed steps", () => {
    it("shows checkmark for completed steps", () => {
      const { container } = render(
        <Stepper
          steps={mockSteps}
          currentStep="step3"
          completedSteps={["step1", "step2"]}
          onStepClick={vi.fn()}
        />,
      );

      // Check icons should be present for completed steps
      const svgs = container.querySelectorAll("svg");
      expect(svgs.length).toBeGreaterThan(0);
    });

    it("applies completed styling to completed steps", () => {
      const { container } = render(
        <Stepper
          steps={mockSteps}
          currentStep="step3"
          completedSteps={["step1", "step2"]}
          onStepClick={vi.fn()}
        />,
      );

      // Completed steps should have primary background
      const completedCircles = container.querySelectorAll(".bg-primary");
      expect(completedCircles.length).toBeGreaterThan(0);
    });
  });

  describe("step click handlers", () => {
    it("calls onStepClick when clicking completed step", async () => {
      const user = userEvent.setup();
      const onStepClick = vi.fn();

      render(
        <Stepper
          steps={mockSteps}
          currentStep="step3"
          completedSteps={["step1", "step2"]}
          onStepClick={onStepClick}
        />,
      );

      const buttons = screen.getAllByRole("button");
      await user.click(buttons[0]); // Click first step

      expect(onStepClick).toHaveBeenCalledWith("step1");
    });

    it("calls onStepClick when clicking current step", async () => {
      const user = userEvent.setup();
      const onStepClick = vi.fn();

      render(
        <Stepper
          steps={mockSteps}
          currentStep="step2"
          completedSteps={["step1"]}
          onStepClick={onStepClick}
        />,
      );

      const buttons = screen.getAllByRole("button");
      await user.click(buttons[1]); // Click second step (current)

      expect(onStepClick).toHaveBeenCalledWith("step2");
    });

    it("does not call onStepClick when clicking incomplete step", async () => {
      const user = userEvent.setup();
      const onStepClick = vi.fn();

      render(
        <Stepper
          steps={mockSteps}
          currentStep="step1"
          completedSteps={[]}
          onStepClick={onStepClick}
        />,
      );

      const buttons = screen.getAllByRole("button");
      // Try to click an incomplete step (step 3)
      await user.click(buttons[2]);

      // Should not be called since step3 is not completed or current
      expect(onStepClick).not.toHaveBeenCalledWith("step3");
    });
  });

  describe("disabled state", () => {
    it("disables click on incomplete steps", () => {
      render(
        <Stepper
          steps={mockSteps}
          currentStep="step1"
          completedSteps={[]}
          onStepClick={vi.fn()}
        />,
      );

      const buttons = screen.getAllByRole("button");
      // Step 2 and 3 should be disabled
      expect(buttons[1]).toBeDisabled();
      expect(buttons[2]).toBeDisabled();
    });

    it("enables click on completed and current steps", () => {
      render(
        <Stepper
          steps={mockSteps}
          currentStep="step2"
          completedSteps={["step1"]}
          onStepClick={vi.fn()}
        />,
      );

      const buttons = screen.getAllByRole("button");
      // Step 1 (completed) and Step 2 (current) should be enabled
      expect(buttons[0]).not.toBeDisabled();
      expect(buttons[1]).not.toBeDisabled();
      // Step 3 should be disabled
      expect(buttons[2]).toBeDisabled();
    });
  });

  describe("accessibility", () => {
    it("has proper navigation role", () => {
      render(
        <Stepper
          steps={mockSteps}
          currentStep="step1"
          completedSteps={[]}
          onStepClick={vi.fn()}
        />,
      );

      const nav = screen.getByRole("navigation");
      expect(nav).toHaveAttribute("aria-label", "Application progress");
    });

    it("sets aria-current on current step", () => {
      render(
        <Stepper
          steps={mockSteps}
          currentStep="step2"
          completedSteps={["step1"]}
          onStepClick={vi.fn()}
        />,
      );

      const buttons = screen.getAllByRole("button");
      expect(buttons[1]).toHaveAttribute("aria-current", "step");
      expect(buttons[0]).not.toHaveAttribute("aria-current");
      expect(buttons[2]).not.toHaveAttribute("aria-current");
    });
  });
});
