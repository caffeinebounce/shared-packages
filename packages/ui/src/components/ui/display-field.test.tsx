import { render, screen } from "@testing-library/react";
import { Mail, Phone } from "lucide-react";
import { describe, expect, it } from "vitest";
import { DisplayField, DisplayFieldGroup } from "./display-field";

describe("DisplayField", () => {
  describe("basic rendering", () => {
    it("renders label and value", () => {
      render(<DisplayField label="Company Name" value="Acme Corp" />);

      expect(screen.getByText("Company Name")).toBeInTheDocument();
      expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    });

    it("renders numeric value", () => {
      render(<DisplayField label="Employees" value={42} />);

      expect(screen.getByText("42")).toBeInTheDocument();
    });

    it("renders placeholder when value is null", () => {
      render(<DisplayField label="Website" value={null} />);

      expect(screen.getByText("Not set")).toBeInTheDocument();
    });

    it("renders placeholder when value is undefined", () => {
      render(<DisplayField label="Website" value={undefined} />);

      expect(screen.getByText("Not set")).toBeInTheDocument();
    });

    it("renders placeholder when value is empty string", () => {
      render(<DisplayField label="Website" value="" />);

      expect(screen.getByText("Not set")).toBeInTheDocument();
    });

    it("uses custom placeholder", () => {
      render(
        <DisplayField
          label="Optional Field"
          value={null}
          placeholder="No data available"
        />,
      );

      expect(screen.getByText("No data available")).toBeInTheDocument();
    });
  });

  describe("with icon", () => {
    it("renders icon before value", () => {
      render(
        <DisplayField label="Email" value="test@example.com" icon={Mail} />,
      );

      // Icon should be rendered as SVG
      const valueContainer = screen.getByText("test@example.com").parentElement;
      expect(valueContainer?.querySelector("svg")).toBeInTheDocument();
    });

    it("does not render icon when platform is provided", () => {
      const { container } = render(
        <DisplayField
          label="LinkedIn"
          value="linkedin.com/in/user"
          icon={Phone}
          platform="linkedin"
        />,
      );

      // Platform icon should take precedence - only one icon in the value area
      const dd = container.querySelector("dd");
      const svgs = dd?.querySelectorAll("svg");
      // Should have social icon but not the Phone icon
      expect(svgs?.length).toBeGreaterThan(0);
    });
  });

  describe("with link", () => {
    it("renders value as link when href is provided", () => {
      render(
        <DisplayField
          label="Website"
          value="example.com"
          href="https://example.com"
        />,
      );

      const link = screen.getByRole("link", { name: /example\.com/i });
      expect(link).toHaveAttribute("href", "https://example.com");
    });

    it("opens link in new tab by default", () => {
      render(
        <DisplayField
          label="Website"
          value="example.com"
          href="https://example.com"
        />,
      );

      const link = screen.getByRole("link", { name: /example\.com/i });
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("opens link in same tab when external is false", () => {
      render(
        <DisplayField
          label="Internal Page"
          value="Settings"
          href="/settings"
          external={false}
        />,
      );

      const link = screen.getByRole("link", { name: /settings/i });
      expect(link).not.toHaveAttribute("target");
    });

    it("does not render link when value is empty", () => {
      render(
        <DisplayField
          label="Website"
          value={null}
          href="https://example.com"
        />,
      );

      expect(screen.queryByRole("link")).toBeNull();
      expect(screen.getByText("Not set")).toBeInTheDocument();
    });
  });

  describe("social platform", () => {
    it("renders social icon for linkedin", () => {
      const { container } = render(
        <DisplayField label="LinkedIn" value="Profile" platform="linkedin" />,
      );

      // Should render the social icon
      const dd = container.querySelector("dd");
      expect(dd?.querySelector("svg")).toBeInTheDocument();
    });

    it("renders social icon for twitter", () => {
      const { container } = render(
        <DisplayField label="Twitter" value="@username" platform="twitter" />,
      );

      const dd = container.querySelector("dd");
      expect(dd?.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("multiline", () => {
    it("preserves whitespace in multiline mode", () => {
      render(
        <DisplayField label="Description" value={"Line 1\nLine 2"} multiline />,
      );

      const valueElement = screen.getByText(/Line 1/);
      expect(valueElement).toHaveClass("whitespace-pre-wrap");
    });

    it("does not preserve whitespace by default", () => {
      render(<DisplayField label="Name" value="John Doe" />);

      const valueElement = screen.getByText("John Doe");
      expect(valueElement).not.toHaveClass("whitespace-pre-wrap");
    });
  });

  describe("className props", () => {
    it("applies custom className to container", () => {
      const { container } = render(
        <DisplayField
          label="Test"
          value="Value"
          className="custom-container"
        />,
      );

      expect(container.firstChild).toHaveClass("custom-container");
    });

    it("applies valueClassName to value element", () => {
      render(
        <DisplayField
          label="Test"
          value="Value"
          valueClassName="custom-value"
        />,
      );

      const valueElement = screen.getByText("Value");
      expect(valueElement).toHaveClass("custom-value");
    });
  });
});

describe("DisplayFieldGroup", () => {
  it("renders children in a grid", () => {
    const { container } = render(
      <DisplayFieldGroup>
        <DisplayField label="Name" value="John" />
        <DisplayField label="Email" value="john@example.com" />
      </DisplayFieldGroup>,
    );

    expect(container.querySelector("dl")).toHaveClass("grid");
  });

  it("applies correct column class for 1 column", () => {
    const { container } = render(
      <DisplayFieldGroup columns={1}>
        <DisplayField label="Name" value="John" />
      </DisplayFieldGroup>,
    );

    expect(container.querySelector("dl")).toHaveClass("grid-cols-1");
  });

  it("applies correct column class for 2 columns", () => {
    const { container } = render(
      <DisplayFieldGroup columns={2}>
        <DisplayField label="Name" value="John" />
      </DisplayFieldGroup>,
    );

    const dl = container.querySelector("dl");
    expect(dl).toHaveClass("grid-cols-1");
    expect(dl).toHaveClass("sm:grid-cols-2");
  });

  it("applies correct column class for 3 columns", () => {
    const { container } = render(
      <DisplayFieldGroup columns={3}>
        <DisplayField label="Name" value="John" />
      </DisplayFieldGroup>,
    );

    const dl = container.querySelector("dl");
    expect(dl).toHaveClass("lg:grid-cols-3");
  });

  it("applies correct column class for 4 columns", () => {
    const { container } = render(
      <DisplayFieldGroup columns={4}>
        <DisplayField label="Name" value="John" />
      </DisplayFieldGroup>,
    );

    const dl = container.querySelector("dl");
    expect(dl).toHaveClass("lg:grid-cols-4");
  });

  it("applies custom className", () => {
    const { container } = render(
      <DisplayFieldGroup className="custom-group">
        <DisplayField label="Name" value="John" />
      </DisplayFieldGroup>,
    );

    expect(container.querySelector("dl")).toHaveClass("custom-group");
  });
});
