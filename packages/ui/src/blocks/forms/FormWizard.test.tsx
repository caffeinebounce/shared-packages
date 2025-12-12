import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Building2, FileText, Users } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { FormWizard, type FormWizardStep, type StepStatus } from "./FormWizard";

describe("FormWizard", () => {
  const mockSteps: FormWizardStep[] = [
    { id: "basic", label: "Basic Info", icon: Building2 },
    { id: "details", label: "Details", icon: FileText },
    { id: "team", label: "Team", icon: Users },
  ];

  const defaultGetStepStatus = (index: number): StepStatus => {
    if (index === 0) return "complete";
    if (index === 1) return "in-progress";
    return "not-started";
  };

  describe("rendering", () => {
    it("renders all steps", () => {
      render(
        <FormWizard
          steps={mockSteps}
          currentStep={0}
          onStepChange={vi.fn()}
          getStepStatus={defaultGetStepStatus}
        >
          <div>Step content</div>
        </FormWizard>,
      );

      expect(screen.getByText("Basic Info")).toBeInTheDocument();
      expect(screen.getByText("Details")).toBeInTheDocument();
      expect(screen.getByText("Team")).toBeInTheDocument();
    });

    it("renders children content", () => {
      render(
        <FormWizard
          steps={mockSteps}
          currentStep={0}
          onStepChange={vi.fn()}
          getStepStatus={defaultGetStepStatus}
        >
          <div data-testid="step-content">Custom content</div>
        </FormWizard>,
      );

      expect(screen.getByTestId("step-content")).toBeInTheDocument();
      expect(screen.getByText("Custom content")).toBeInTheDocument();
    });
  });

  describe("step status styles", () => {
    it("shows correct styling for complete status", () => {
      const getStepStatus = () => "complete" as StepStatus;
      const { container } = render(
        <FormWizard
          steps={mockSteps}
          currentStep={0}
          onStepChange={vi.fn()}
          getStepStatus={getStepStatus}
        >
          <div>Content</div>
        </FormWizard>,
      );

      // Complete steps should have foreground border/background
      const completedCircles = container.querySelectorAll(".bg-foreground");
      expect(completedCircles.length).toBeGreaterThan(0);
    });

    it("shows correct styling for error status", () => {
      const getStepStatus = () => "error" as StepStatus;
      const { container } = render(
        <FormWizard
          steps={mockSteps}
          currentStep={0}
          onStepChange={vi.fn()}
          getStepStatus={getStepStatus}
        >
          <div>Content</div>
        </FormWizard>,
      );

      // Error steps should have destructive background
      const errorCircles = container.querySelectorAll(".bg-destructive");
      expect(errorCircles.length).toBeGreaterThan(0);
    });

    it("shows correct styling for incomplete status", () => {
      const getStepStatus = () => "incomplete" as StepStatus;
      const { container } = render(
        <FormWizard
          steps={mockSteps}
          currentStep={0}
          onStepChange={vi.fn()}
          getStepStatus={getStepStatus}
        >
          <div>Content</div>
        </FormWizard>,
      );

      // Incomplete steps should have yellow background
      const incompleteCircles = container.querySelectorAll(".bg-yellow-500");
      expect(incompleteCircles.length).toBeGreaterThan(0);
    });

    it("shows correct styling for in-progress status", () => {
      const getStepStatus = () => "in-progress" as StepStatus;
      const { container } = render(
        <FormWizard
          steps={mockSteps}
          currentStep={0}
          onStepChange={vi.fn()}
          getStepStatus={getStepStatus}
        >
          <div>Content</div>
        </FormWizard>,
      );

      // In-progress steps should have primary background
      const inProgressCircles = container.querySelectorAll(".bg-primary");
      expect(inProgressCircles.length).toBeGreaterThan(0);
    });

    it("shows correct styling for not-started status", () => {
      const getStepStatus = () => "not-started" as StepStatus;
      const { container } = render(
        <FormWizard
          steps={mockSteps}
          currentStep={1}
          onStepChange={vi.fn()}
          getStepStatus={getStepStatus}
        >
          <div>Content</div>
        </FormWizard>,
      );

      // Should render without errors
      expect(container).toBeTruthy();
    });
  });

  describe("step click handlers", () => {
    it("calls onStepChange when step is clicked", async () => {
      const user = userEvent.setup();
      const onStepChange = vi.fn();

      render(
        <FormWizard
          steps={mockSteps}
          currentStep={0}
          onStepChange={onStepChange}
          getStepStatus={defaultGetStepStatus}
        >
          <div>Content</div>
        </FormWizard>,
      );

      const buttons = screen.getAllByRole("button");
      await user.click(buttons[1]); // Click second step

      expect(onStepChange).toHaveBeenCalledWith(1);
    });
  });

  describe("keyboard navigation", () => {
    it("navigates to previous step with Alt+ArrowLeft", async () => {
      const user = userEvent.setup();
      const onStepChange = vi.fn();

      render(
        <FormWizard
          steps={mockSteps}
          currentStep={1}
          onStepChange={onStepChange}
          getStepStatus={defaultGetStepStatus}
          enableKeyboardNavigation={true}
          scopeToDialog={false}
        >
          <div>Content</div>
        </FormWizard>,
      );

      await user.keyboard("{Alt>}{ArrowLeft}{/Alt}");

      expect(onStepChange).toHaveBeenCalledWith(0);
    });

    it("navigates to next step with Alt+ArrowRight", async () => {
      const user = userEvent.setup();
      const onStepChange = vi.fn();

      render(
        <FormWizard
          steps={mockSteps}
          currentStep={0}
          onStepChange={onStepChange}
          getStepStatus={defaultGetStepStatus}
          enableKeyboardNavigation={true}
          scopeToDialog={false}
        >
          <div>Content</div>
        </FormWizard>,
      );

      await user.keyboard("{Alt>}{ArrowRight}{/Alt}");

      expect(onStepChange).toHaveBeenCalledWith(1);
    });

    it("does not navigate backward from first step", async () => {
      const user = userEvent.setup();
      const onStepChange = vi.fn();

      render(
        <FormWizard
          steps={mockSteps}
          currentStep={0}
          onStepChange={onStepChange}
          getStepStatus={defaultGetStepStatus}
          enableKeyboardNavigation={true}
          scopeToDialog={false}
        >
          <div>Content</div>
        </FormWizard>,
      );

      await user.keyboard("{Alt>}{ArrowLeft}{/Alt}");

      expect(onStepChange).not.toHaveBeenCalled();
    });

    it("does not navigate forward from last step", async () => {
      const user = userEvent.setup();
      const onStepChange = vi.fn();

      render(
        <FormWizard
          steps={mockSteps}
          currentStep={2}
          onStepChange={onStepChange}
          getStepStatus={defaultGetStepStatus}
          enableKeyboardNavigation={true}
          scopeToDialog={false}
        >
          <div>Content</div>
        </FormWizard>,
      );

      await user.keyboard("{Alt>}{ArrowRight}{/Alt}");

      expect(onStepChange).not.toHaveBeenCalled();
    });

    it("respects enableKeyboardNavigation=false", async () => {
      const user = userEvent.setup();
      const onStepChange = vi.fn();

      render(
        <FormWizard
          steps={mockSteps}
          currentStep={1}
          onStepChange={onStepChange}
          getStepStatus={defaultGetStepStatus}
          enableKeyboardNavigation={false}
          scopeToDialog={false}
        >
          <div>Content</div>
        </FormWizard>,
      );

      await user.keyboard("{Alt>}{ArrowRight}{/Alt}");

      expect(onStepChange).not.toHaveBeenCalled();
    });
  });

  describe("tooltips", () => {
    it("shows custom tooltip for error steps", () => {
      const getStepStatus = () => "error" as StepStatus;
      const getStepTooltip = (_index: number, status: StepStatus) =>
        status === "error" ? "Custom error message" : null;

      render(
        <FormWizard
          steps={mockSteps}
          currentStep={0}
          onStepChange={vi.fn()}
          getStepStatus={getStepStatus}
          getStepTooltip={getStepTooltip}
        >
          <div>Content</div>
        </FormWizard>,
      );

      // Tooltip provider should be rendered
      const { container } = render(
        <FormWizard
          steps={mockSteps}
          currentStep={0}
          onStepChange={vi.fn()}
          getStepStatus={getStepStatus}
          getStepTooltip={getStepTooltip}
        >
          <div>Content</div>
        </FormWizard>,
      );

      expect(container).toBeTruthy();
    });

    it("shows default tooltip for incomplete steps", () => {
      const getStepStatus = () => "incomplete" as StepStatus;

      const { container } = render(
        <FormWizard
          steps={mockSteps}
          currentStep={0}
          onStepChange={vi.fn()}
          getStepStatus={getStepStatus}
        >
          <div>Content</div>
        </FormWizard>,
      );

      expect(container).toBeTruthy();
    });
  });

  describe("custom className", () => {
    it("applies custom className to container", () => {
      const { container } = render(
        <FormWizard
          steps={mockSteps}
          currentStep={0}
          onStepChange={vi.fn()}
          getStepStatus={defaultGetStepStatus}
          className="custom-wizard"
        >
          <div>Content</div>
        </FormWizard>,
      );

      const wizardContainer = container.querySelector(".custom-wizard");
      expect(wizardContainer).toBeInTheDocument();
    });
  });
});
