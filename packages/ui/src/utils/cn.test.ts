import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn utility", () => {
  it("merges multiple class strings", () => {
    const result = cn("text-red-500", "bg-blue-500", "p-4");
    expect(result).toContain("text-red-500");
    expect(result).toContain("bg-blue-500");
    expect(result).toContain("p-4");
  });

  it("handles conditional classes", () => {
    const isActive = true;
    const result = cn("base-class", isActive && "active-class");
    expect(result).toContain("base-class");
    expect(result).toContain("active-class");
  });

  it("handles falsy conditional classes", () => {
    const isActive = false;
    const result = cn("base-class", isActive && "active-class");
    expect(result).toContain("base-class");
    expect(result).not.toContain("active-class");
  });

  it("properly merges Tailwind conflicts (later class wins)", () => {
    // tailwind-merge should keep only the last padding value
    const result = cn("p-4", "p-2");
    expect(result).toBe("p-2");
  });

  it("properly merges Tailwind conflicts with different properties", () => {
    // Different properties should both be kept
    const result = cn("px-4", "py-2");
    expect(result).toContain("px-4");
    expect(result).toContain("py-2");
  });

  it("handles arrays of classes", () => {
    const result = cn(["text-red-500", "bg-blue-500"]);
    expect(result).toContain("text-red-500");
    expect(result).toContain("bg-blue-500");
  });

  it("handles objects with boolean values", () => {
    const result = cn({
      "text-red-500": true,
      "bg-blue-500": false,
      "p-4": true,
    });
    expect(result).toContain("text-red-500");
    expect(result).not.toContain("bg-blue-500");
    expect(result).toContain("p-4");
  });

  it("handles empty inputs", () => {
    const result = cn();
    expect(result).toBe("");
  });

  it("handles undefined and null values", () => {
    const result = cn("text-red-500", undefined, null, "bg-blue-500");
    expect(result).toContain("text-red-500");
    expect(result).toContain("bg-blue-500");
  });
});
