import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type {
  ChangeEvent,
  KeyboardEvent,
  MouseEventHandler,
  ReactNode,
} from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CreateClientFn } from "../../types";
import { ConfirmAccessDialog } from "./ConfirmAccessDialog";

vi.mock("@caffeinebounce/ui/primitives", async () => {
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
    DialogContent: ({ children }: { children: ReactNode }) => (
      <div>{children}</div>
    ),
    DialogDescription: ({ children }: { children: ReactNode }) => (
      <p>{children}</p>
    ),
    DialogHeader: ({ children }: { children: ReactNode }) => (
      <div>{children}</div>
    ),
    DialogTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
    InputOTP: ({
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
    InputOTPGroup: ({ children }: { children: ReactNode }) => <>{children}</>,
    InputOTPSeparator: () => <span>-</span>,
    InputOTPSlot: ({ index }: { index: number }) => <span data-index={index} />,
    Label: ({
      children,
      htmlFor,
    }: {
      children: ReactNode;
      htmlFor?: string;
    }) => <label htmlFor={htmlFor}>{children}</label>,
    PasswordInput: ({
      disabled,
      id,
      onChange,
      onKeyDown,
      value,
    }: {
      disabled?: boolean;
      id?: string;
      onChange: (event: ChangeEvent<HTMLInputElement>) => void;
      onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
      value: string;
    }) => (
      <input
        disabled={disabled}
        id={id}
        type="password"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
    ),
    Tabs: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    TabsContent: ({ children }: { children: ReactNode }) => (
      <div>{children}</div>
    ),
    TabsList: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    TabsTrigger: ({ children }: { children: ReactNode }) => (
      <button type="button">{children}</button>
    ),
  };
});

function createMockSupabase() {
  return {
    auth: {
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      mfa: {
        challenge: vi.fn(),
        verify: vi.fn(),
      },
    },
  };
}

describe("ConfirmAccessDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("verifies a TOTP factor with the shared MFA helper flow", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const supabase = createMockSupabase();
    const createClient = vi.fn(
      () => supabase as unknown as ReturnType<CreateClientFn>,
    );
    supabase.auth.mfa.challenge.mockResolvedValue({
      data: { id: "challenge-1" },
      error: null,
    });
    supabase.auth.mfa.verify.mockResolvedValue({ error: null });

    render(
      <ConfirmAccessDialog
        createClient={createClient}
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={onConfirm}
        verificationMethod="mfa"
        mfaFactor={{ id: "factor-1", type: "totp" }}
      />,
    );

    await user.type(
      await screen.findByLabelText("Verification code"),
      "123456",
    );

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
    expect(supabase.auth.mfa.challenge).toHaveBeenCalledWith({
      factorId: "factor-1",
    });
    expect(supabase.auth.mfa.verify).toHaveBeenCalledWith({
      factorId: "factor-1",
      challengeId: "challenge-1",
      code: "123456",
    });
  });

  it("sends and verifies a phone MFA code without creating a second challenge", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const supabase = createMockSupabase();
    const createClient = vi.fn(
      () => supabase as unknown as ReturnType<CreateClientFn>,
    );
    supabase.auth.mfa.challenge.mockResolvedValue({
      data: { id: "challenge-2" },
      error: null,
    });
    supabase.auth.mfa.verify.mockResolvedValue({ error: null });

    render(
      <ConfirmAccessDialog
        createClient={createClient}
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={onConfirm}
        verificationMethod="mfa"
        mfaFactor={{ id: "factor-2", type: "phone" }}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Send Verification Code" }),
    );
    await user.type(
      await screen.findByLabelText("Verification code"),
      "654321",
    );

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
    expect(supabase.auth.mfa.challenge).toHaveBeenCalledTimes(1);
    expect(supabase.auth.mfa.verify).toHaveBeenCalledWith({
      factorId: "factor-2",
      challengeId: "challenge-2",
      code: "654321",
    });
  });

  it("keeps password verification working unchanged", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const supabase = createMockSupabase();
    const createClient = vi.fn(
      () => supabase as unknown as ReturnType<CreateClientFn>,
    );
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { email: "person@example.com" } },
    });
    supabase.auth.signInWithPassword.mockResolvedValue({ error: null });

    render(
      <ConfirmAccessDialog
        createClient={createClient}
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={onConfirm}
        verificationMethod="password"
      />,
    );

    await user.type(screen.getByLabelText("Enter your password"), "supersafe");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
    expect(supabase.auth.getUser).toHaveBeenCalledTimes(1);
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "person@example.com",
      password: "supersafe",
    });
  });
});
