import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CreateClientFn } from "../../types";
import { MFAChallenge } from "./MFAChallenge";

const routerPush = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: routerPush,
  }),
}));

vi.mock("@caffeinebounce/ui", () => ({
  MFAChallenge: ({
    error,
    factors,
    loading,
    onResend,
    onVerify,
  }: {
    error?: string;
    factors: Array<{ id: string; friendlyName?: string; type: string }>;
    loading?: boolean;
    onResend?: (factorId: string) => Promise<void>;
    onVerify: (factorId: string, code: string) => Promise<void>;
  }) => (
    <div>
      <div data-testid="loading">{loading ? "true" : "false"}</div>
      <div data-testid="error">{error}</div>
      <div data-testid="factor-name">{factors[0]?.friendlyName ?? ""}</div>
      <button
        type="button"
        onClick={() => void onResend?.(factors[0]?.id ?? "missing")}
      >
        Resend first factor
      </button>
      <button
        type="button"
        onClick={() => void onVerify(factors[0]?.id ?? "missing", "123456")}
      >
        Verify first factor
      </button>
    </div>
  ),
}));

function createMockSupabase() {
  return {
    auth: {
      getUser: vi.fn(),
      signOut: vi.fn(),
      mfa: {
        challenge: vi.fn(),
        listFactors: vi.fn(),
        verify: vi.fn(),
      },
    },
  };
}

describe("MFAChallenge", () => {
  beforeEach(() => {
    routerPush.mockReset();
    vi.clearAllMocks();
  });

  it("auto-challenges a single verified TOTP factor when the wrapper loads", async () => {
    const supabase = createMockSupabase();
    const createClient = vi.fn(
      () => supabase as unknown as ReturnType<CreateClientFn>,
    );

    supabase.auth.mfa.listFactors.mockResolvedValue({
      data: {
        totp: [
          {
            id: "factor-1",
            factor_type: "totp",
            friendly_name: "Authenticator App",
            status: "verified",
          },
        ],
        phone: [],
      },
      error: null,
    });
    supabase.auth.mfa.challenge.mockResolvedValue({
      data: { id: "challenge-1" },
      error: null,
    });

    render(<MFAChallenge createClient={createClient} />);

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });
    expect(screen.getByTestId("factor-name")).toHaveTextContent(
      "Authenticator App",
    );
    expect(supabase.auth.mfa.challenge).toHaveBeenCalledWith({
      factorId: "factor-1",
    });
  });

  it("reuses the shared helper flow for resend and verify", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const onMFASuccess = vi.fn();
    const supabase = createMockSupabase();
    const createClient = vi.fn(
      () => supabase as unknown as ReturnType<CreateClientFn>,
    );

    supabase.auth.mfa.listFactors.mockResolvedValue({
      data: {
        totp: [
          {
            id: "factor-1",
            factor_type: "totp",
            friendly_name: "Authenticator App",
            status: "verified",
          },
        ],
        phone: [],
      },
      error: null,
    });
    supabase.auth.mfa.challenge
      .mockResolvedValueOnce({
        data: { id: "challenge-1" },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { id: "challenge-2" },
        error: null,
      });
    supabase.auth.mfa.verify.mockResolvedValue({ error: null });
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "person@example.com" } },
    });

    render(
      <MFAChallenge
        createClient={createClient}
        onSuccess={onSuccess}
        onAuthEvent={{ onMFASuccess }}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    await user.click(
      screen.getByRole("button", { name: "Resend first factor" }),
    );

    await waitFor(() => {
      expect(supabase.auth.mfa.challenge).toHaveBeenCalledTimes(2);
    });

    await user.click(
      screen.getByRole("button", { name: "Verify first factor" }),
    );

    await waitFor(() => {
      expect(supabase.auth.mfa.verify).toHaveBeenCalledWith({
        factorId: "factor-1",
        challengeId: "challenge-2",
        code: "123456",
      });
    });
    expect(onMFASuccess).toHaveBeenCalledWith("user-1", "person@example.com");
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });
});
