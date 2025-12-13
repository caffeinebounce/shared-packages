"use client";

import {
  type DeviceInfo,
  MFARecovery as MFARecoveryUI,
} from "@caffeinebounce/ui";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { CreateClientFn } from "../../types";
import { generateDeviceFingerprint } from "../../utils";

export interface MFARecoveryProps {
  /** Supabase client factory */
  createClient: CreateClientFn;
  /** Callback when recovery succeeds */
  onSuccess?: () => void;
  /** Callback when user wants to go back to MFA challenge */
  onBack?: () => void;
  /** Callback when user cancels recovery */
  onCancel?: () => void;
  /** Where to redirect after successful recovery (if onSuccess not provided) */
  redirectTo?: string;
  /** MFA challenge URL to redirect back to (if onBack not provided) */
  mfaChallengeUrl?: string;
  /** Sign-in URL to redirect to on cancel (if onCancel not provided) */
  signInUrl?: string;
}

/**
 * MFARecovery - Supabase MFA recovery component
 *
 * Wraps the generic @caffeinebounce/ui MFARecovery component with Supabase recovery API.
 *
 * @example
 * ```tsx
 * <MFARecovery
 *   createClient={createClient}
 *   redirectTo="/profile#security"
 *   onBack={() => router.push("/mfa-challenge")}
 * />
 * ```
 */
export function MFARecovery({
  createClient,
  onSuccess,
  onBack,
  onCancel,
  redirectTo = "/profile#security",
  mfaChallengeUrl = "/mfa-challenge",
  signInUrl = "/signin",
}: MFARecoveryProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({});
  const [hasRecoveryEmail, setHasRecoveryEmail] = useState<boolean | null>(
    null,
  );

  useEffect(() => {
    // Get device info for display
    const fingerprint = generateDeviceFingerprint();
    setDeviceInfo({
      browser: fingerprint.browserName,
      os: fingerprint.osName,
    });

    // Fetch geolocation from API
    const controller = new AbortController();
    const apiUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/api/mfa/recovery/device-info`
        : "/api/mfa/recovery/device-info";

    fetch(apiUrl, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.city || data.country || data.latitude) {
          setDeviceInfo((prev) => ({
            ...prev,
            city: data.city,
            region: data.region,
            country: data.country,
            latitude: data.latitude,
            longitude: data.longitude,
          }));
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Failed to fetch device info:", err);
        }
      });

    // Check if user has recovery email
    fetch("/api/profile/recovery-email")
      .then((res) => res.json())
      .then((data) => {
        setHasRecoveryEmail(!!data.recoveryEmail);
      })
      .catch(() => {
        setHasRecoveryEmail(false);
      });

    return () => controller.abort();
  }, []);

  const handleVerifyBackupCode = useCallback(
    async (code: string) => {
      setError("");
      setLoading(true);

      try {
        const fingerprint = generateDeviceFingerprint();

        const response = await fetch("/api/mfa/recovery/verify-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            deviceFingerprint: JSON.stringify(fingerprint),
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to verify backup code");
        }

        // Success - recovery code verified, now need to re-enroll
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(redirectTo);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Invalid backup code. Please try again.";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [onSuccess, redirectTo, router],
  );

  const handleRequestMagicLink = useCallback(async () => {
    setError("");

    try {
      const fingerprint = generateDeviceFingerprint();

      const response = await fetch("/api/mfa/recovery/send-magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceFingerprint: JSON.stringify(fingerprint),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send recovery link");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to send recovery link. Please try again.";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const handleBack = async () => {
    if (onBack) {
      onBack();
    } else {
      router.push(mfaChallengeUrl);
    }
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

  // Still loading recovery email status
  const isLoadingRecoveryStatus = hasRecoveryEmail === null;

  return (
    <MFARecoveryUI
      onVerifyBackupCode={handleVerifyBackupCode}
      onRequestMagicLink={hasRecoveryEmail ? handleRequestMagicLink : undefined}
      onBack={handleBack}
      onCancel={handleCancel}
      deviceInfo={deviceInfo}
      loading={loading || isLoadingRecoveryStatus}
      error={error}
    />
  );
}
