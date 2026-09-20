import { fireEvent, render, screen } from "@testing-library/react";
import { Mail } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { ProfileSection } from "./profile-section";

describe("ProfileSection", () => {
  describe("basic rendering", () => {
    it("renders title and children", () => {
      render(
        <ProfileSection title="Contact Information">
          <p>Section content</p>
        </ProfileSection>,
      );

      expect(screen.getByText("Contact Information")).toBeInTheDocument();
      expect(screen.getByText("Section content")).toBeInTheDocument();
    });

    it("renders description when provided", () => {
      render(
        <ProfileSection
          title="Settings"
          description="Manage your account settings"
        >
          <p>Content</p>
        </ProfileSection>,
      );

      expect(
        screen.getByText("Manage your account settings"),
      ).toBeInTheDocument();
    });

    it("renders icon when provided", () => {
      render(
        <ProfileSection title="Contact" icon={Mail}>
          <p>Content</p>
        </ProfileSection>,
      );

      // Icon should be rendered (lucide icons render as SVG)
      const title = screen.getByText("Contact");
      const header = title.closest("div");
      expect(header?.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("edit mode", () => {
    it("shows edit button when onEdit is provided", () => {
      const onEdit = vi.fn();
      render(
        <ProfileSection title="Profile" onEdit={onEdit}>
          <p>Content</p>
        </ProfileSection>,
      );

      const editButton = screen.getByRole("button", { name: /edit profile/i });
      expect(editButton).toBeInTheDocument();
    });

    it("calls onEdit when edit button is clicked", () => {
      const onEdit = vi.fn();
      render(
        <ProfileSection title="Profile" onEdit={onEdit}>
          <p>Content</p>
        </ProfileSection>,
      );

      fireEvent.click(screen.getByRole("button", { name: /edit profile/i }));
      expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it("shows save and cancel buttons in editing mode", () => {
      const onSave = vi.fn();
      const onCancel = vi.fn();
      render(
        <ProfileSection
          title="Profile"
          isEditing
          onEdit={() => {}}
          onSave={onSave}
          onCancel={onCancel}
        >
          <p>Content</p>
        </ProfileSection>,
      );

      expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /cancel/i }),
      ).toBeInTheDocument();
    });

    it("calls onSave when save button is clicked", () => {
      const onSave = vi.fn();
      render(
        <ProfileSection
          title="Profile"
          isEditing
          onEdit={() => {}}
          onSave={onSave}
        >
          <p>Content</p>
        </ProfileSection>,
      );

      fireEvent.click(screen.getByRole("button", { name: /save/i }));
      expect(onSave).toHaveBeenCalledTimes(1);
    });

    it("calls onCancel when cancel button is clicked", () => {
      const onCancel = vi.fn();
      render(
        <ProfileSection
          title="Profile"
          isEditing
          onEdit={() => {}}
          onCancel={onCancel}
        >
          <p>Content</p>
        </ProfileSection>,
      );

      fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("disables edit button when editDisabled is true", () => {
      render(
        <ProfileSection title="Profile" onEdit={() => {}} editDisabled>
          <p>Content</p>
        </ProfileSection>,
      );

      const editButton = screen.getByRole("button", { name: /edit profile/i });
      expect(editButton).toBeDisabled();
    });

    it("uses custom editLabel for aria-label", () => {
      render(
        <ProfileSection
          title="Profile"
          onEdit={() => {}}
          editLabel="Modify user details"
        >
          <p>Content</p>
        </ProfileSection>,
      );

      expect(
        screen.getByRole("button", { name: "Modify user details" }),
      ).toBeInTheDocument();
    });

    it("shows spinner when isSaving is true", () => {
      render(
        <ProfileSection
          title="Profile"
          isEditing
          isSaving
          onEdit={() => {}}
          onSave={() => {}}
        >
          <p>Content</p>
        </ProfileSection>,
      );

      // Spinner component should be rendered (check for spinner class or role)
      const saveButton = screen.getByRole("button", { name: /save/i });
      expect(saveButton.querySelector(".animate-spin")).toBeInTheDocument();
    });

    it("disables save and cancel buttons when isSaving", () => {
      render(
        <ProfileSection
          title="Profile"
          isEditing
          isSaving
          onEdit={() => {}}
          onSave={() => {}}
          onCancel={() => {}}
        >
          <p>Content</p>
        </ProfileSection>,
      );

      expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
      expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    });
  });

  describe("collapsible behavior", () => {
    it("shows content by default when collapsible", () => {
      render(
        <ProfileSection title="Settings" collapsible>
          <p>Collapsible content</p>
        </ProfileSection>,
      );

      expect(screen.getByText("Collapsible content")).toBeInTheDocument();
    });

    it("hides content when defaultCollapsed is true", () => {
      render(
        <ProfileSection title="Settings" collapsible defaultCollapsed>
          <p>Collapsible content</p>
        </ProfileSection>,
      );

      expect(screen.queryByText("Collapsible content")).not.toBeInTheDocument();
    });

    it("toggles content visibility when collapse button is clicked", () => {
      render(
        <ProfileSection title="Settings" collapsible>
          <p>Collapsible content</p>
        </ProfileSection>,
      );

      // Content should be visible initially
      expect(screen.getByText("Collapsible content")).toBeInTheDocument();

      // Click collapse button
      fireEvent.click(screen.getByRole("button", { name: /collapse/i }));

      // Content should be hidden
      expect(screen.queryByText("Collapsible content")).not.toBeInTheDocument();

      // Click expand button
      fireEvent.click(screen.getByRole("button", { name: /expand/i }));

      // Content should be visible again
      expect(screen.getByText("Collapsible content")).toBeInTheDocument();
    });

    it("sets aria-expanded correctly", () => {
      render(
        <ProfileSection title="Settings" collapsible>
          <p>Content</p>
        </ProfileSection>,
      );

      const button = screen.getByRole("button", { name: /collapse/i });
      expect(button).toHaveAttribute("aria-expanded", "true");

      fireEvent.click(button);
      expect(screen.getByRole("button", { name: /expand/i })).toHaveAttribute(
        "aria-expanded",
        "false",
      );
    });
  });

  describe("custom action", () => {
    it("renders custom action instead of edit button", () => {
      render(
        <ProfileSection
          title="Members"
          action={<button type="button">Add Member</button>}
        >
          <p>Content</p>
        </ProfileSection>,
      );

      expect(
        screen.getByRole("button", { name: "Add Member" }),
      ).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /edit/i })).toBeNull();
    });
  });

  describe("variants", () => {
    it("renders card variant by default", () => {
      const { container } = render(
        <ProfileSection title="Card Section">
          <p>Content</p>
        </ProfileSection>,
      );

      // Card variant should have the Card component structure
      expect(container.querySelector('[class*="rounded"]')).toBeInTheDocument();
    });

    it("renders simple variant without card wrapper", () => {
      const { container } = render(
        <ProfileSection title="Simple Section" variant="simple">
          <p>Content</p>
        </ProfileSection>,
      );

      // Simple variant should be a div with space-y-2
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("space-y-2");
    });
  });

  describe("className props", () => {
    it("applies custom className to container", () => {
      const { container } = render(
        <ProfileSection title="Test" className="custom-class">
          <p>Content</p>
        </ProfileSection>,
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("applies contentClassName to content area", () => {
      render(
        <ProfileSection title="Test" contentClassName="content-class">
          <p>Content</p>
        </ProfileSection>,
      );

      // The CardContent should have the custom class
      const content = screen.getByText("Content").parentElement;
      expect(content).toHaveClass("content-class");
    });
  });
});
