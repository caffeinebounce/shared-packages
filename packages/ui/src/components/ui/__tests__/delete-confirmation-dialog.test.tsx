import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DeleteConfirmationDialog } from "../delete-confirmation-dialog";

describe("DeleteConfirmationDialog", () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onConfirm: vi.fn(),
    itemName: "Test Item",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders when open is true", () => {
    render(<DeleteConfirmationDialog {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("displays the item name in the description", () => {
    render(<DeleteConfirmationDialog {...defaultProps} />);
    expect(screen.getByText(/Test Item/)).toBeInTheDocument();
  });

  it("uses custom title when provided", () => {
    render(<DeleteConfirmationDialog {...defaultProps} title="Custom Title" />);
    expect(screen.getByText("Custom Title")).toBeInTheDocument();
  });

  it("uses custom description when provided", () => {
    render(
      <DeleteConfirmationDialog
        {...defaultProps}
        description="Custom description text"
      />,
    );
    expect(screen.getByText("Custom description text")).toBeInTheDocument();
  });

  it("uses custom button labels when provided", () => {
    render(
      <DeleteConfirmationDialog
        {...defaultProps}
        cancelLabel="Go Back"
        confirmLabel="Yes, Delete"
      />,
    );
    expect(screen.getByText("Go Back")).toBeInTheDocument();
    expect(screen.getByText("Yes, Delete")).toBeInTheDocument();
  });

  it("calls onOpenChange with false when cancel is clicked", () => {
    const onOpenChange = vi.fn();
    render(
      <DeleteConfirmationDialog
        {...defaultProps}
        onOpenChange={onOpenChange}
      />,
    );

    fireEvent.click(screen.getByText("Cancel"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("calls onConfirm when confirm button is clicked", async () => {
    const onConfirm = vi.fn();
    render(
      <DeleteConfirmationDialog {...defaultProps} onConfirm={onConfirm} />,
    );

    fireEvent.click(screen.getByText("Delete"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("handles async onConfirm and shows loading state", async () => {
    const onConfirm = vi.fn(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );
    render(
      <DeleteConfirmationDialog {...defaultProps} onConfirm={onConfirm} />,
    );

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    // Button should show loading text (confirmLabel + "...")
    await waitFor(() => {
      expect(screen.getByText("Delete...")).toBeInTheDocument();
    });

    // Wait for async operation to complete
    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
  });

  it("disables buttons while loading", async () => {
    const onConfirm = vi.fn(
      () => new Promise((resolve) => setTimeout(resolve, 200)),
    );
    render(
      <DeleteConfirmationDialog {...defaultProps} onConfirm={onConfirm} />,
    );

    fireEvent.click(screen.getByText("Delete"));

    await waitFor(() => {
      const cancelButton = screen.getByText("Cancel");
      expect(cancelButton).toBeDisabled();
    });
  });

  it("closes dialog after successful confirm", async () => {
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn().mockResolvedValue(undefined);

    render(
      <DeleteConfirmationDialog
        {...defaultProps}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />,
    );

    fireEvent.click(screen.getByText("Delete"));

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("applies danger variant by default", () => {
    render(<DeleteConfirmationDialog {...defaultProps} />);
    const deleteButton = screen.getByText("Delete");
    expect(deleteButton).toHaveClass("bg-destructive");
  });

  it("applies warning variant when specified", () => {
    render(<DeleteConfirmationDialog {...defaultProps} variant="warning" />);
    const deleteButton = screen.getByText("Delete");
    // Warning variant should have amber/warning styling
    expect(deleteButton).toHaveClass("bg-amber-500");
  });

  it("does not render when open is false", () => {
    render(<DeleteConfirmationDialog {...defaultProps} open={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  describe("type-to-confirm mode", () => {
    const confirmationText = "DELETE";

    it("renders input field when confirmationText is provided", () => {
      render(
        <DeleteConfirmationDialog
          {...defaultProps}
          confirmationText={confirmationText}
        />,
      );
      expect(screen.getByRole("textbox")).toBeInTheDocument();
      expect(screen.getByText(confirmationText)).toBeInTheDocument();
    });

    it("does not render input field when confirmationText is not provided", () => {
      render(<DeleteConfirmationDialog {...defaultProps} />);
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    });

    it("disables delete button until input matches confirmationText", () => {
      render(
        <DeleteConfirmationDialog
          {...defaultProps}
          confirmationText={confirmationText}
        />,
      );

      const deleteButton = screen.getByText("Delete");
      const input = screen.getByRole("textbox");

      // Initially disabled
      expect(deleteButton).toBeDisabled();

      // Type partial text - still disabled
      fireEvent.change(input, { target: { value: "DEL" } });
      expect(deleteButton).toBeDisabled();

      // Type full text - enabled
      fireEvent.change(input, { target: { value: confirmationText } });
      expect(deleteButton).not.toBeDisabled();
    });

    it("enforces case sensitivity for confirmation text", () => {
      render(
        <DeleteConfirmationDialog
          {...defaultProps}
          confirmationText={confirmationText}
        />,
      );

      const deleteButton = screen.getByText("Delete");
      const input = screen.getByRole("textbox");

      // Wrong case - should remain disabled
      fireEvent.change(input, { target: { value: "delete" } });
      expect(deleteButton).toBeDisabled();

      // Correct case - should enable
      fireEvent.change(input, { target: { value: "DELETE" } });
      expect(deleteButton).not.toBeDisabled();
    });

    it("resets input value when dialog closes", async () => {
      const { rerender } = render(
        <DeleteConfirmationDialog
          {...defaultProps}
          confirmationText={confirmationText}
        />,
      );

      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: confirmationText } });
      expect(input).toHaveValue(confirmationText);

      // Close dialog
      rerender(
        <DeleteConfirmationDialog
          {...defaultProps}
          confirmationText={confirmationText}
          open={false}
        />,
      );

      // Reopen dialog
      rerender(
        <DeleteConfirmationDialog
          {...defaultProps}
          confirmationText={confirmationText}
          open={true}
        />,
      );

      // Input should be reset
      const newInput = screen.getByRole("textbox");
      expect(newInput).toHaveValue("");
    });

    it("triggers confirmation on Enter key when input matches", async () => {
      const onConfirm = vi.fn();
      render(
        <DeleteConfirmationDialog
          {...defaultProps}
          confirmationText={confirmationText}
          onConfirm={onConfirm}
        />,
      );

      const input = screen.getByRole("textbox");

      // Type correct text
      fireEvent.change(input, { target: { value: confirmationText } });

      // Press Enter
      fireEvent.keyDown(input, { key: "Enter" });

      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it("does not trigger confirmation on Enter when input does not match", () => {
      const onConfirm = vi.fn();
      render(
        <DeleteConfirmationDialog
          {...defaultProps}
          confirmationText={confirmationText}
          onConfirm={onConfirm}
        />,
      );

      const input = screen.getByRole("textbox");

      // Type incorrect text
      fireEvent.change(input, { target: { value: "wrong" } });

      // Press Enter
      fireEvent.keyDown(input, { key: "Enter" });

      expect(onConfirm).not.toHaveBeenCalled();
    });
  });
});
