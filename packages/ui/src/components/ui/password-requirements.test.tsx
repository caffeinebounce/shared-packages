import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  defaultPasswordRules,
  PasswordRequirements,
} from "./password-requirements";

describe("PasswordRequirements", () => {
  describe("defaultPasswordRules", () => {
    it("min-length validator passes for 8+ characters", () => {
      const rule = defaultPasswordRules.find((r) => r.id === "min-length");
      expect(rule).toBeDefined();
      expect(rule!.validator("12345678")).toBe(true);
      expect(rule!.validator("123456789")).toBe(true);
    });

    it("min-length validator fails for 7 characters", () => {
      const rule = defaultPasswordRules.find((r) => r.id === "min-length");
      expect(rule).toBeDefined();
      expect(rule!.validator("1234567")).toBe(false);
      expect(rule!.validator("123")).toBe(false);
    });

    it("uppercase validator passes for password with uppercase", () => {
      const rule = defaultPasswordRules.find((r) => r.id === "uppercase");
      expect(rule).toBeDefined();
      expect(rule!.validator("Password")).toBe(true);
      expect(rule!.validator("HELLO")).toBe(true);
      expect(rule!.validator("helloWorld")).toBe(true);
    });

    it("uppercase validator fails for password without uppercase", () => {
      const rule = defaultPasswordRules.find((r) => r.id === "uppercase");
      expect(rule).toBeDefined();
      expect(rule!.validator("password")).toBe(false);
      expect(rule!.validator("12345")).toBe(false);
    });

    it("special validator passes for password with special character", () => {
      const rule = defaultPasswordRules.find((r) => r.id === "special");
      expect(rule).toBeDefined();
      expect(rule!.validator("pass!")).toBe(true);
      expect(rule!.validator("test@123")).toBe(true);
      expect(rule!.validator("hello#world")).toBe(true);
      expect(rule!.validator("pass$word")).toBe(true);
    });

    it("special validator fails for password without special character", () => {
      const rule = defaultPasswordRules.find((r) => r.id === "special");
      expect(rule).toBeDefined();
      expect(rule!.validator("pass")).toBe(false);
      expect(rule!.validator("password123")).toBe(false);
    });
  });

  describe("component rendering", () => {
    it("renders all default rules", () => {
      render(<PasswordRequirements password="" />);

      expect(
        screen.getByText("Must be at least 8 characters long"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Must contain an uppercase letter"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Must contain a special character"),
      ).toBeInTheDocument();
    });

    it("shows unmet rules with info icon for empty password", () => {
      const { container } = render(<PasswordRequirements password="" />);

      // All rules should show as unmet
      const unmetRules = container.querySelectorAll(".text-muted-foreground");
      expect(unmetRules.length).toBe(3);
    });

    it("shows met rules with check icon when password meets requirements", () => {
      const { container } = render(
        <PasswordRequirements password="Password123!" />, // pragma: allowlist secret
      );

      // All rules should show as met
      const metRules = container.querySelectorAll(".text-green-600");
      expect(metRules.length).toBe(3);
    });

    it("shows partially met rules correctly", () => {
      const { container } = render(
        <PasswordRequirements password="password" />, // pragma: allowlist secret
      );

      // Only min-length should be met (8 chars), not uppercase or special
      const metRules = container.querySelectorAll(".text-green-600");
      expect(metRules.length).toBe(1);

      const unmetRules = container.querySelectorAll(".text-muted-foreground");
      expect(unmetRules.length).toBe(2);
    });

    it("handles password with uppercase but no special character", () => {
      const { container } = render(
        <PasswordRequirements password="Password" />, // pragma: allowlist secret
      );

      // min-length and uppercase should be met
      const metRules = container.querySelectorAll(".text-green-600");
      expect(metRules.length).toBe(2);

      const unmetRules = container.querySelectorAll(".text-muted-foreground");
      expect(unmetRules.length).toBe(1);
    });

    it("applies custom className", () => {
      const { container } = render(
        <PasswordRequirements password="" className="custom-class" />,
      );

      const ul = container.querySelector("ul");
      expect(ul).toHaveClass("custom-class");
    });

    it("accepts custom rules", () => {
      const customRules = [
        {
          id: "custom",
          label: "Custom requirement",
          validator: (password: string) => password.length > 10, // pragma: allowlist secret
        },
      ];

      render(<PasswordRequirements password="test" rules={customRules} />); // pragma: allowlist secret

      expect(screen.getByText("Custom requirement")).toBeInTheDocument();
    });
  });
});
