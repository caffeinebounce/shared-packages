import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ChangeEvent, MouseEventHandler, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CreateClientFn } from "../../types";
import { EmailSection } from "./EmailSection";

vi.mock("@caffeinebounce/ui/primitives", () => {
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
  };
});

const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

vi.mock("./useVerificationFlow", async () => {
  const actual = await vi.importActual<typeof import("./useVerificationFlow")>(
    "./useVerificationFlow",
  );

  return {
    ...actual,
    useVerificationFlow: (
      options: Parameters<typeof actual.useVerificationFlow>[0],
    ) =>
      actual.useVerificationFlow({
        ...options,
        successCloseDelayMs: 0,
      }),
  };
});

function createMockSupabase() {
  return {
    auth: {
      refreshSession: vi.fn(),
      updateUser: vi.fn(),
    },
  };
}

async function flushAsyncWork() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe("EmailSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shares the verification flow state while preserving email-link verification", async () => {
    const user = userEvent.setup();
    const onEmailChanged = vi.fn();
    const supabase = createMockSupabase();
    const createClient = vi.fn(
      () => supabase as unknown as ReturnType<CreateClientFn>,
    );

    supabase.auth.updateUser.mockResolvedValue({ error: null });
    supabase.auth.refreshSession.mockResolvedValue({
      data: { user: { email: "updated@example.com" } },
      error: null,
    });

    render(
      <EmailSection
        createClient={createClient}
        userId="user-1"
        email="person@example.com"
        isVerified={true}
        onEmailChanged={onEmailChanged}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Change" }));
    await user.type(
      screen.getByLabelText("New Email Address"),
      "updated@example.com",
    );
    await user.click(screen.getByRole("button", { name: "Send Verification" }));
    await flushAsyncWork();

    expect(supabase.auth.updateUser).toHaveBeenCalledWith({
      email: "updated@example.com",
    });
    expect(toastSuccess).toHaveBeenCalledWith(
      "Verification email sent! Check your inbox.",
    );
    expect(screen.getByText("Check Your Email")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "I've Verified" }));
    await flushAsyncWork();

    expect(onEmailChanged).toHaveBeenCalledWith("updated@example.com");
    expect(supabase.auth.refreshSession).toHaveBeenCalledTimes(1);
    expect(toastSuccess).toHaveBeenCalledWith("Email updated successfully!");

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
