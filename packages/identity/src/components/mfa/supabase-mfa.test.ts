import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createMfaChallenge,
  ensureMfaChallenge,
  verifyMfaChallenge,
} from "./supabase-mfa";

function createMockSupabaseMfaClient() {
  return {
    auth: {
      mfa: {
        challenge: vi.fn(),
        verify: vi.fn(),
      },
    },
  };
}

describe("supabase-mfa", () => {
  const mockChallengeError = new Error("Challenge failed");
  const mockVerifyError = new Error("Invalid code");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates an MFA challenge and returns the challenge id", async () => {
    const supabase = createMockSupabaseMfaClient();
    supabase.auth.mfa.challenge.mockResolvedValue({
      data: { id: "challenge-1" },
      error: null,
    });

    await expect(createMfaChallenge(supabase, "factor-1")).resolves.toBe(
      "challenge-1",
    );
    expect(supabase.auth.mfa.challenge).toHaveBeenCalledWith({
      factorId: "factor-1",
    });
  });

  it("throws when challenge creation fails", async () => {
    const supabase = createMockSupabaseMfaClient();
    supabase.auth.mfa.challenge.mockResolvedValue({
      data: null,
      error: mockChallengeError,
    });

    await expect(createMfaChallenge(supabase, "factor-1")).rejects.toBe(
      mockChallengeError,
    );
  });

  it("reuses an existing challenge id without creating a new challenge", async () => {
    const supabase = createMockSupabaseMfaClient();

    await expect(
      ensureMfaChallenge(supabase, "factor-1", "existing-challenge"),
    ).resolves.toBe("existing-challenge");
    expect(supabase.auth.mfa.challenge).not.toHaveBeenCalled();
  });

  it("creates a challenge before verifying when one is not provided", async () => {
    const supabase = createMockSupabaseMfaClient();
    supabase.auth.mfa.challenge.mockResolvedValue({
      data: { id: "challenge-2" },
      error: null,
    });
    supabase.auth.mfa.verify.mockResolvedValue({ error: null });

    await expect(
      verifyMfaChallenge(supabase, {
        factorId: "factor-1",
        code: "123456",
      }),
    ).resolves.toBe("challenge-2");

    expect(supabase.auth.mfa.challenge).toHaveBeenCalledWith({
      factorId: "factor-1",
    });
    expect(supabase.auth.mfa.verify).toHaveBeenCalledWith({
      factorId: "factor-1",
      challengeId: "challenge-2",
      code: "123456",
    });
  });

  it("throws when MFA verification fails", async () => {
    const supabase = createMockSupabaseMfaClient();
    supabase.auth.mfa.verify.mockResolvedValue({ error: mockVerifyError });

    await expect(
      verifyMfaChallenge(supabase, {
        factorId: "factor-1",
        code: "123456",
        challengeId: "challenge-3",
      }),
    ).rejects.toBe(mockVerifyError);

    expect(supabase.auth.mfa.challenge).not.toHaveBeenCalled();
    expect(supabase.auth.mfa.verify).toHaveBeenCalledWith({
      factorId: "factor-1",
      challengeId: "challenge-3",
      code: "123456",
    });
  });
});
