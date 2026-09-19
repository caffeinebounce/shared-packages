import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { InlineEditableText } from "./inline-editable";

describe("InlineEditableText", () => {
  describe("display mode", () => {
    it("renders value as clickable button", () => {
      render(<InlineEditableText value="Hello World" onSave={vi.fn()} />);

      const button = screen.getByRole("button", { name: "Hello World" });
      expect(button).toBeInTheDocument();
    });

    it("renders placeholder when value is empty", () => {
      render(
        <InlineEditableText
          value=""
          onSave={vi.fn()}
          placeholder="Enter text..."
        />,
      );

      expect(screen.getByText("Enter text...")).toBeInTheDocument();
    });

    it("uses default placeholder when not specified", () => {
      render(<InlineEditableText value="" onSave={vi.fn()} />);

      expect(screen.getByText("Click to edit...")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      render(
        <InlineEditableText
          value="Test"
          onSave={vi.fn()}
          className="custom-class"
        />,
      );

      expect(screen.getByRole("button")).toHaveClass("custom-class");
    });
  });

  describe("edit mode", () => {
    it("switches to edit mode when clicked", async () => {
      const user = userEvent.setup();
      render(<InlineEditableText value="Edit me" onSave={vi.fn()} />);

      await user.click(screen.getByRole("button", { name: "Edit me" }));

      expect(screen.getByRole("textbox")).toBeInTheDocument();
      expect(screen.getByRole("textbox")).toHaveValue("Edit me");
    });

    it("focuses input when entering edit mode", async () => {
      const user = userEvent.setup();
      render(<InlineEditableText value="Edit me" onSave={vi.fn()} />);

      await user.click(screen.getByRole("button", { name: "Edit me" }));

      expect(screen.getByRole("textbox")).toHaveFocus();
    });

    it("shows loading spinner when isLoading is true", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <InlineEditableText value="Loading" onSave={vi.fn()} isLoading />,
      );

      await user.click(screen.getByRole("button", { name: "Loading" }));

      // Loader2 has animate-spin class
      expect(container.querySelector(".animate-spin")).toBeInTheDocument();
    });
  });

  describe("save behavior", () => {
    it("calls onSave with trimmed value when pressing Enter", async () => {
      const user = userEvent.setup();
      const onSave = vi.fn();
      render(<InlineEditableText value="Original" onSave={onSave} />);

      await user.click(screen.getByRole("button", { name: "Original" }));
      await user.clear(screen.getByRole("textbox"));
      await user.type(screen.getByRole("textbox"), "New Value  ");
      await user.keyboard("{Enter}");

      expect(onSave).toHaveBeenCalledWith("New Value");
    });

    it("calls onSave when input loses focus", async () => {
      const user = userEvent.setup();
      const onSave = vi.fn();
      render(
        <div>
          <InlineEditableText value="Original" onSave={onSave} />
          <button type="button">Other button</button>
        </div>,
      );

      await user.click(screen.getByRole("button", { name: "Original" }));
      await user.clear(screen.getByRole("textbox"));
      await user.type(screen.getByRole("textbox"), "Changed");
      await user.click(screen.getByRole("button", { name: "Other button" }));

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith("Changed");
      });
    });

    it("does not call onSave when value unchanged", async () => {
      const user = userEvent.setup();
      const onSave = vi.fn();
      render(<InlineEditableText value="Same" onSave={onSave} />);

      await user.click(screen.getByRole("button", { name: "Same" }));
      await user.keyboard("{Enter}");

      expect(onSave).not.toHaveBeenCalled();
    });
  });

  describe("cancel behavior", () => {
    it("cancels edit and reverts value when pressing Escape", async () => {
      const user = userEvent.setup();
      const onSave = vi.fn();
      render(<InlineEditableText value="Original" onSave={onSave} />);

      await user.click(screen.getByRole("button", { name: "Original" }));
      await user.clear(screen.getByRole("textbox"));
      await user.type(screen.getByRole("textbox"), "Changed");
      await user.keyboard("{Escape}");

      expect(onSave).not.toHaveBeenCalled();
      expect(
        screen.getByRole("button", { name: "Original" }),
      ).toBeInTheDocument();
    });
  });

  describe("multiline mode", () => {
    it("renders textarea when multiline is true", async () => {
      const user = userEvent.setup();
      render(<InlineEditableText value="Line 1" onSave={vi.fn()} multiline />);

      await user.click(screen.getByRole("button", { name: "Line 1" }));

      const textarea = screen.getByRole("textbox");
      expect(textarea.tagName).toBe("TEXTAREA");
    });

    it("applies rows prop to textarea", async () => {
      const user = userEvent.setup();
      render(
        <InlineEditableText value="Text" onSave={vi.fn()} multiline rows={5} />,
      );

      await user.click(screen.getByRole("button", { name: "Text" }));

      expect(screen.getByRole("textbox")).toHaveAttribute("rows", "5");
    });

    it("allows multiline input with Shift+Enter", async () => {
      const user = userEvent.setup();
      const onSave = vi.fn();
      render(<InlineEditableText value="Line 1" onSave={onSave} multiline />);

      await user.click(screen.getByRole("button", { name: "Line 1" }));
      await user.type(
        screen.getByRole("textbox"),
        "{Shift>}{Enter}{/Shift}Line 2",
      );

      // Should not trigger save with Shift+Enter
      expect(onSave).not.toHaveBeenCalled();
      expect(screen.getByRole("textbox")).toHaveValue("Line 1\nLine 2");
    });
  });

  describe("input constraints", () => {
    it("applies maxLength to input", async () => {
      const user = userEvent.setup();
      render(
        <InlineEditableText value="Test" onSave={vi.fn()} maxLength={10} />,
      );

      await user.click(screen.getByRole("button", { name: "Test" }));

      expect(screen.getByRole("textbox")).toHaveAttribute("maxLength", "10");
    });

    it("disables input when isLoading is true", async () => {
      const user = userEvent.setup();
      render(<InlineEditableText value="Test" onSave={vi.fn()} isLoading />);

      await user.click(screen.getByRole("button", { name: "Test" }));

      expect(screen.getByRole("textbox")).toBeDisabled();
    });
  });

  describe("value synchronization", () => {
    it("updates edit value when prop value changes", async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <InlineEditableText value="Initial" onSave={vi.fn()} />,
      );

      await user.click(screen.getByRole("button", { name: "Initial" }));

      rerender(<InlineEditableText value="Updated" onSave={vi.fn()} />);

      expect(screen.getByRole("textbox")).toHaveValue("Updated");
    });
  });
});
