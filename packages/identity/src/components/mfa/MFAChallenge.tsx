"use client";

import { MFAChallenge as MFAChallengeUI, type MFAFactor } from "@caffeinebounce/ui";
import type { Factor } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import type { CreateClientFn } from "../../types";

type SupabaseMFAFactor = Factor & { phone?: string };

/**
 * MFA event logging callbacks
 */
export interface MFAEventCallbacks {
  onMFASuccess?: (userId: string, email: string) => void;
  onMFAFailure?: (userId: string, email: string, reason: string) => void;
}

export interface MFAChallengeProps {
  /** Supabase client factory */
  createClient: CreateClientFn;
  /** Callback when MFA verification succeeds */
  onSuccess?: () => void;
  /** Callback when user cancels MFA */
  onCancel?: () => void;
  /** Callback when user clicks recovery link */
  onRecovery?: () => void;
  /** Where to redirect after successful MFA (if onSuccess not provided) */
  redirectTo?: string;
  /** Sign-in URL to redirect to on cancel (if onCancel not provided) */
  signInUrl?: string;
  /** Recovery URL to redirect to on recovery (if onRecovery not provided) */
  recoveryUrl?: string;
  /** Optional callbacks for logging MFA events */
  onAuthEvent?: MFAEventCallbacks;
}

/**
 * MFAChallenge - Supabase MFA verification component
 *
 * Wraps the generic @caffeinebounce/ui MFAChallenge component with Supabase MFA API.
 *
 * @example
 * ```tsx
 * <MFAChallenge
 *   createClient={createClient}
 *   redirectTo="/dashboard"
 *   onCancel={() => router.push("/signin")}
 * />
 * ```
 */
export function MFAChallenge({
  createClient,
  onSuccess,
  onCancel,
  onRecovery,
  redirectTo = "/",
  signInUrl = "/signin",
  recoveryUrl = "/mfa-recovery",
  onAuthEvent,
}: MFAChallengeProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [factors, setFactors] = useState<MFAFactor[]>([]);
  const [challengeId, setChallengeId] = useState<string>("");

  const createChallenge = useCallback(
    async (factorId: string) => {
      try {
        const supabase = createClient();
        const { data, error: challengeError } =
          await supabase.auth.mfa.challenge({
            factorId,
          });

        if (challengeError) throw challengeError;

        setChallengeId(data.id);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create challenge",
        );
        throw err;
      }
    },
    [createClient],
  );

  const loadFactors = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: listError } = await supabase.auth.mfa.listFactors();

      if (listError) throw listError;

      // Get verified factors only
      const verifiedFactors: SupabaseMFAFactor[] = [
        ...(data.totp?.filter((f) => f.status === "verified") || []),
        ...(data.phone?.filter((f) => f.status === "verified") || []),
      ];

      // Convert to MFAFactor format
      const convertedFactors: MFAFactor[] = verifiedFactors.map((factor) => ({
        id: factor.id,
        type: factor.factor_type === "totp" ? "totp" : "phone",
        friendlyName: factor.friendly_name,
        phone: (factor as SupabaseMFAFactor).phone,
      }));

      setFactors(convertedFactors);

      // Auto-create challenge for single TOTP factor
      if (
        convertedFactors.length === 1 &&
        convertedFactors[0].type === "totp"
      ) {
        await createChallenge(convertedFactors[0].id);
      }
    } catch {
      setError("Failed to load authentication methods");
    } finally {
      setLoading(false);
    }
  }, [createClient, createChallenge]);

  useEffect(() => {
    loadFactors();
  }, [loadFactors]);

  const handleVerify = async (factorId: string, code: string) => {
    setError("");

    // Get user info upfront for logging (available in both success and error paths)
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userId = user?.id || "";
    const email = user?.email || "";

    try {
      // Create challenge if not already created
      let currentChallengeId = challengeId;
      if (!currentChallengeId) {
        const { data, error: challengeError } =
          await supabase.auth.mfa.challenge({
            factorId,
          });
        if (challengeError) throw challengeError;
        currentChallengeId = data.id;
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: currentChallengeId,
        code,
      });

      if (verifyError) throw verifyError;

      // Log MFA success
      onAuthEvent?.onMFASuccess?.(userId, email);

      // Success!
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(redirectTo);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Invalid code. Please try again.";
      setError(errorMessage);

      // Log MFA failure (user info already captured above)
      onAuthEvent?.onMFAFailure?.(userId, email, errorMessage);

      throw new Error(errorMessage);
    }
  };

  const handleResend = async (factorId: string) => {
    setError("");
    await createChallenge(factorId);
  };

  const handleCancel = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();

    if (onCancel) {
      onCancel();
    } else {
      router.push(signInUrl);
    }
  };

  const handleRecovery = () => {
    if (onRecovery) {
      onRecovery();
    } else {
      router.push(recoveryUrl);
    }
  };

  return (
    <MFAChallengeUI
      factors={factors}
      onVerify={handleVerify}
      onResend={handleResend}
      onCancel={handleCancel}
      onRecovery={handleRecovery}
      loading={loading}
      error={error}
    />
  );
}
