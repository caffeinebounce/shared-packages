import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ChangeEvent, MouseEventHandler, ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { CreateClientFn } from "../../types";
import { PhoneSection } from "./PhoneSection";

vi.mock("@caffeinebounce/ui", () => {
  return {
    Button: ({
      children,
      disabled,
      onClick,
      type = "button",
      variant,
    }: {
      children: ReactNode;
      disabled?: boolean;
      onClick?: MouseEventHandler<HTMLButtonElement>;
      type?: "button" | "submit" | "reset";
      variant?: string;
    }) => (
      <button
        type={type}
        disabled={disabled}
        data-variant={variant}
        onClick={onClick}
      >
        {children}
      </button>
    ),
    Dialog: ({ children, open }: { children: ReactNode; open: boolean }) =>
      open ? <div role="dialog">{children}</div> : null,
    DialogContent: ({
      children,
      className,
    }: {
      children: ReactNode;
      className?: string;
    }) => <div data-class-name={className}>{children}</div>,
    DialogDescription: ({ children }: { children: ReactNode }) => (
      <p>{children}</p>
    ),
    DialogFooter: ({ children }: { children: ReactNode }) => (
      <div>{children}</div>
    ),
    DialogHeader: ({ children }: { children: ReactNode }) => (
      <div>{children}</div>
    ),
    DialogTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
    Input: ({
      disabled,
      id,
      onChange,
      placeholder,
      type = "text",
      value,
    }: {
      disabled?: boolean;
      id?: string;
      onChange: (event: ChangeEvent<HTMLInputElement>) => void;
      placeholder?: string;
      type?: string;
      value: string;
    }) => (
      <input
        disabled={disabled}
        id={id}
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={onChange}
      />
    ),
    Label: ({
      children,
      htmlFor,
    }: {
      children: ReactNode;
      htmlFor?: string;
    }) => <label htmlFor={htmlFor}>{children}</label>,
    VerificationCodeInput: ({
      disabled,
      onChange,
      onComplete,
      value,
    }: {
      disabled?: boolean;
      onChange: (value: string) => void;
      onComplete?: (value: string) => void;
      value: string;
    }) => (
      <input
        aria-label="Verification code"
        disabled={disabled}
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value;
          onChange(nextValue);
          if (nextValue.length === 6) {
            onComplete?.(nextValue);
          }
        }}
      />
    ),
  };
});

const logError = vi.fn();
const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock("@caffeinebounce/logger/client", () => ({
  useErrorLoggerSafe: () => ({
    logError,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

function createMockSupabase() {
  return {
    auth: {
      updateUser: vi.fn(),
    },
  };
}

describe("PhoneSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reuses the shared verification flow for existing phone verification and cooldown handling", async () => {
    const user = userEvent.setup();
    const onPhoneChanged = vi.fn();
    const supabase = createMockSupabase();
    const createClient = vi.fn(
      () => supabase as unknown as ReturnType<CreateClientFn>,
    );

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);
    supabase.auth.updateUser.mockResolvedValue({ error: null });

    render(
      <PhoneSection
        createClient={createClient}
        userId="user-1"
        phone="+15551234567"
        isVerified={false}
        onPhoneChanged={onPhoneChanged}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Verify" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/phone/verify", {
        body: JSON.stringify({
          phone: "+15551234567",
          action: "send",
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
    });

    expect(screen.getByText("Enter Verification Code")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Resend (30s)" })).toBeDisabled();

    await user.type(screen.getByLabelText("Verification code"), "123456");

    await waitFor(() => {
      expect(fetch).toHaveBeenLastCalledWith("/api/phone/verify", {
        body: JSON.stringify({
          phone: "+15551234567",
          action: "verify",
          code: "123456",
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
    });
    await waitFor(() => {
      expect(onPhoneChanged).toHaveBeenCalledWith("+15551234567");
    });

    expect(supabase.auth.updateUser).toHaveBeenCalledWith({
      phone: "+15551234567",
    });
    expect(logError).not.toHaveBeenCalled();
    expect(toastSuccess).toHaveBeenCalledWith(
      "Phone number verified successfully!",
    );

    await waitFor(
      () => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      },
      { timeout: 2500 },
    );
  });
});
