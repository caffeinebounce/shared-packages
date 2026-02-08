/**
 * Component tests for Sidebar
 * Tests #832: Sidebar has overflow-x-hidden to prevent horizontal scrollbar
 */

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Sidebar, SidebarContent, SidebarProvider } from "./sidebar";

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.innerWidth for desktop testing
Object.defineProperty(window, "innerWidth", {
  writable: true,
  configurable: true,
  value: 1024,
});

describe("Sidebar - Overflow Control", () => {
  it("should have overflow-x-hidden class on desktop sidebar container (#832)", () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarContent>
            <div>Sidebar content</div>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    // Find the sidebar container div (has data-sidebar attribute)
    const sidebarContainer = container.querySelector('[data-sidebar="sidebar"]');
    expect(sidebarContainer).toBeInTheDocument();

    // Verify overflow-x-hidden class is present
    expect(sidebarContainer?.className).toContain("overflow-x-hidden");
  });

  it("should prevent horizontal scrollbar with overflow-x-hidden (#832)", () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarContent>
            <div style={{ width: "500px" }}>Wide content that would overflow</div>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    const sidebarContainer = container.querySelector('[data-sidebar="sidebar"]');
    expect(sidebarContainer).toBeInTheDocument();

    // Verify overflow-x is hidden
    // The className contains overflow-x-hidden, which translates to overflowX: 'hidden'
    expect(sidebarContainer?.className).toContain("overflow-x-hidden");
  });

  it("should have overflow-x-hidden in all collapsible modes (#832)", () => {
    const modes: Array<"icon" | "offcanvas"> = ["icon", "offcanvas"];

    modes.forEach((mode) => {
      const { container } = render(
        <SidebarProvider>
          <Sidebar collapsible={mode}>
            <SidebarContent>
              <div>Content</div>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>,
      );

      const sidebarContainer = container.querySelector('[data-sidebar="sidebar"]');
      
      // For icon and offcanvas modes on desktop
      expect(sidebarContainer).toBeInTheDocument();
      expect(sidebarContainer?.className).toContain("overflow-x-hidden");
    });
  });

  it("should maintain overflow-x-hidden with floating variant (#832)", () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar variant="floating" collapsible="icon">
          <SidebarContent>
            <div>Floating sidebar content</div>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    const sidebarContainer = container.querySelector('[data-sidebar="sidebar"]');
    expect(sidebarContainer).toBeInTheDocument();
    
    // Should have both overflow-x-hidden and floating variant classes
    expect(sidebarContainer?.className).toContain("overflow-x-hidden");
    expect(sidebarContainer?.className).toContain("rounded-lg"); // floating variant
  });

  it("should maintain overflow-x-hidden with inset variant (#832)", () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar variant="inset" collapsible="icon">
          <SidebarContent>
            <div>Inset sidebar content</div>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    const sidebarContainer = container.querySelector('[data-sidebar="sidebar"]');
    expect(sidebarContainer).toBeInTheDocument();
    
    // Should have overflow-x-hidden
    expect(sidebarContainer?.className).toContain("overflow-x-hidden");
  });

  it("should allow vertical scrolling while preventing horizontal (#832)", () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarContent>
            {/* Tall content that should scroll vertically */}
            {Array.from({ length: 50 }, (_, i) => (
              <div key={i}>Item {i}</div>
            ))}
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );

    const sidebarContainer = container.querySelector('[data-sidebar="sidebar"]');
    expect(sidebarContainer).toBeInTheDocument();
    
    // Should have overflow-x-hidden but allow vertical scroll (via SidebarContent)
    expect(sidebarContainer?.className).toContain("overflow-x-hidden");
    expect(sidebarContainer?.className).toContain("flex-col"); // vertical layout
  });
});
