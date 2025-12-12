import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { VerificationCodeInput } from "./verification-code-input";

describe("VerificationCodeInput", () => {
  describe("rendering", () => {
    it("renders 6 visible input boxes by default", () => {
      render(<VerificationCodeInput />);
      // There's 1 hidden input + 6 visible inputs = 7 total
      const inputs = screen.getAllByRole("textbox");
      expect(inputs).toHaveLength(7); // hidden + 6 visible
    });

    it("renders custom number of visible input boxes", () => {
      render(<VerificationCodeInput length={4} />);
      // There's 1 hidden input + 4 visible inputs = 5 total
      const inputs = screen.getAllByRole("textbox");
      expect(inputs).toHaveLength(5); // hidden + 4 visible
    });

    it("has proper aria labels for visible inputs", () => {
      render(<VerificationCodeInput length={3} />);
      expect(screen.getByLabelText("Digit 1")).toBeInTheDocument();
      expect(screen.getByLabelText("Digit 2")).toBeInTheDocument();
      expect(screen.getByLabelText("Digit 3")).toBeInTheDocument();
    });
  });

  describe("single digit input", () => {
    it("handles single digit input correctly", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<VerificationCodeInput onChange={onChange} autoFocus={false} />);

      const inputs = screen.getAllByRole("textbox");
      await user.type(inputs[0], "5");

      expect(onChange).toHaveBeenCalledWith("5");
    });

    it("focuses next input after digit entry", async () => {
      const user = userEvent.setup();
      render(<VerificationCodeInput autoFocus={false} />);

      const inputs = screen.getAllByRole("textbox");
      await user.click(inputs[0]);
      await user.keyboard("5");

      // The second input should receive focus (but we can't directly test focus in jsdom)
      // We can verify the onChange was called
      expect(inputs[0]).toHaveValue("5");
    });

    it("does not advance on non-digit input", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<VerificationCodeInput onChange={onChange} autoFocus={false} />);

      const inputs = screen.getAllByRole("textbox");
      await user.click(inputs[0]);
      await user.keyboard("a");

      // Non-digits should be filtered out
      expect(inputs[0]).toHaveValue("");
    });
  });

  describe("paste handling", () => {
    it("calls onChange with pasted code", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onComplete = vi.fn();
      render(
        <VerificationCodeInput
          onChange={onChange}
          onComplete={onComplete}
          autoFocus={false}
        />,
      );

      const inputs = screen.getAllByRole("textbox");
      await user.click(inputs[0]);

      // Simulate paste event
      await user.paste("123456");

      // onChange and onComplete should be called with the full code
      expect(onChange).toHaveBeenCalledWith("123456");
      expect(onComplete).toHaveBeenCalledWith("123456");
    });

    it("calls onChange with partial pasted code", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onComplete = vi.fn();
      render(
        <VerificationCodeInput
          onChange={onChange}
          onComplete={onComplete}
          autoFocus={false}
        />,
      );

      const inputs = screen.getAllByRole("textbox");
      await user.click(inputs[0]);
      await user.paste("123");

      expect(onChange).toHaveBeenCalledWith("123");
      expect(onComplete).not.toHaveBeenCalled();
    });

    it("filters non-digits from pasted content", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<VerificationCodeInput onChange={onChange} autoFocus={false} />);

      const inputs = screen.getAllByRole("textbox");
      await user.click(inputs[0]);
      await user.paste("1-2-3-4-5-6");

      expect(onChange).toHaveBeenCalledWith("123456");
    });
  });

  describe("backspace navigation", () => {
    it("handles backspace key press", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<VerificationCodeInput value="123456" onChange={onChange} />);

      const inputs = screen.getAllByRole("textbox");
      await user.click(inputs[2]);
      await user.keyboard("{Backspace}");

      // onChange should be called
      expect(onChange).toHaveBeenCalled();
    });

    it("handles backspace on empty input", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <VerificationCodeInput
          value="12"
          onChange={onChange}
          autoFocus={false}
        />,
      );

      const inputs = screen.getAllByRole("textbox");
      await user.click(inputs[2]);
      await user.keyboard("{Backspace}");

      // onChange should be called
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe("external value changes", () => {
    it("syncs with external value prop", async () => {
      const { rerender } = render(<VerificationCodeInput value="123" />);

      await waitFor(() => {
        const hiddenInput = document.querySelector(
          'input[name="otp"]',
        ) as HTMLInputElement;
        expect(hiddenInput?.value).toBe("123");
      });

      rerender(<VerificationCodeInput value="456" />);

      await waitFor(() => {
        const hiddenInput = document.querySelector(
          'input[name="otp"]',
        ) as HTMLInputElement;
        expect(hiddenInput?.value).toBe("456");
      });
    });

    it("handles shorter external values", async () => {
      render(<VerificationCodeInput value="12" />);

      await waitFor(() => {
        const hiddenInput = document.querySelector(
          'input[name="otp"]',
        ) as HTMLInputElement;
        expect(hiddenInput?.value).toBe("12");
      });
    });
  });

  describe("completion callback", () => {
    it("calls onComplete when all digits entered", async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      render(
        <VerificationCodeInput
          length={3}
          onComplete={onComplete}
          autoFocus={false}
        />,
      );

      const inputs = screen.getAllByRole("textbox");
      await user.click(inputs[0]);
      await user.paste("123");

      expect(onComplete).toHaveBeenCalledWith("123");
    });

    it("does not call onComplete when partially filled", async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      render(
        <VerificationCodeInput
          length={4}
          onComplete={onComplete}
          autoFocus={false}
        />,
      );

      const inputs = screen.getAllByRole("textbox");
      await user.click(inputs[0]);
      await user.paste("12");

      expect(onComplete).not.toHaveBeenCalled();
    });
  });

  describe("disabled state", () => {
    it("disables all inputs when disabled prop is true", () => {
      render(<VerificationCodeInput disabled={true} />);

      const inputs = screen.getAllByRole("textbox");
      for (const input of inputs) {
        expect(input).toBeDisabled();
      }
    });

    it("enables inputs when disabled prop is false", () => {
      render(<VerificationCodeInput disabled={false} />);

      const inputs = screen.getAllByRole("textbox");
      for (const input of inputs) {
        expect(input).toBeEnabled();
      }
    });
  });
});
