"use client";

import { useEffect, useRef, useState } from "react";

export type VerificationFlowStep<EntryStep extends string> =
  | "idle"
  | EntryStep
  | "verify-code"
  | "success";

interface UseVerificationFlowOptions<EntryStep extends string> {
  entryStep: EntryStep;
  onReset?: () => void;
  successCloseDelayMs?: number;
}

interface RunActionOptions {
  clearError?: boolean;
}

export function useVerificationFlow<EntryStep extends string>({
  entryStep,
  onReset,
  successCloseDelayMs = 1500,
}: UseVerificationFlowOptions<EntryStep>) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [step, setStep] = useState<VerificationFlowStep<EntryStep>>("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const resendIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (resendTimer <= 0 || resendIntervalRef.current) {
      return;
    }

    resendIntervalRef.current = setInterval(() => {
      setResendTimer((current) => {
        if (current <= 1) {
          if (resendIntervalRef.current) {
            clearInterval(resendIntervalRef.current);
            resendIntervalRef.current = null;
          }

          return 0;
        }

        return current - 1;
      });
    }, 1000);
  }, [resendTimer]);

  useEffect(() => {
    return () => {
      if (resendIntervalRef.current) {
        clearInterval(resendIntervalRef.current);
      }
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  const clearSuccessTimeout = () => {
    if (!successTimeoutRef.current) {
      return;
    }

    clearTimeout(successTimeoutRef.current);
    successTimeoutRef.current = null;
  };

  const resetState = () => {
    clearSuccessTimeout();
    if (resendIntervalRef.current) {
      clearInterval(resendIntervalRef.current);
      resendIntervalRef.current = null;
    }
    setStep("idle");
    setLoading(false);
    setError("");
    setResendTimer(0);
    onReset?.();
  };

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);

    if (!open) {
      resetState();
    }
  };

  const openEntryStep = () => {
    clearSuccessTimeout();
    setError("");
    setStep(entryStep);
    setDialogOpen(true);
  };

  const goToVerification = (options?: {
    openDialog?: boolean;
    resendCooldownSeconds?: number;
  }) => {
    clearSuccessTimeout();
    setError("");
    setStep("verify-code");

    if (options?.openDialog) {
      setDialogOpen(true);
    }

    if (typeof options?.resendCooldownSeconds === "number") {
      setResendTimer(options.resendCooldownSeconds);
    }
  };

  const startResendCooldown = (seconds: number) => {
    setResendTimer(seconds);
  };

  const completeSuccess = () => {
    clearSuccessTimeout();
    setError("");
    setStep("success");
    successTimeoutRef.current = setTimeout(() => {
      handleOpenChange(false);
    }, successCloseDelayMs);
  };

  const runAction = async <T>(
    action: () => Promise<T>,
    options: RunActionOptions = {},
  ) => {
    setLoading(true);
    if (options.clearError !== false) {
      setError("");
    }

    try {
      return await action();
    } finally {
      setLoading(false);
    }
  };

  return {
    dialogOpen,
    error,
    handleOpenChange,
    loading,
    openEntryStep,
    completeSuccess,
    goToVerification,
    resendTimer,
    runAction,
    setError,
    setStep,
    startResendCooldown,
    step,
  };
}
