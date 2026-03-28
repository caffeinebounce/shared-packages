import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useVerificationFlow } from "./useVerificationFlow";

describe("useVerificationFlow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("resets shared flow state when the dialog closes", () => {
    const onReset = vi.fn();
    const { result } = renderHook(() =>
      useVerificationFlow({
        entryStep: "enter-email",
        onReset,
      }),
    );

    act(() => {
      result.current.openEntryStep();
      result.current.setError("Something went wrong");
      result.current.startResendCooldown(30);
      result.current.handleOpenChange(false);
    });

    expect(result.current.dialogOpen).toBe(false);
    expect(result.current.step).toBe("idle");
    expect(result.current.error).toBe("");
    expect(result.current.resendTimer).toBe(0);
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("handles verification cooldowns and delayed success close", () => {
    const onReset = vi.fn();
    const { result } = renderHook(() =>
      useVerificationFlow({
        entryStep: "enter-phone",
        onReset,
      }),
    );

    act(() => {
      result.current.openEntryStep();
      result.current.goToVerification({
        openDialog: true,
        resendCooldownSeconds: 3,
      });
    });

    expect(result.current.dialogOpen).toBe(true);
    expect(result.current.step).toBe("verify-code");
    expect(result.current.resendTimer).toBe(3);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.resendTimer).toBe(2);

    act(() => {
      result.current.completeSuccess();
    });
    expect(result.current.step).toBe("success");

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(result.current.dialogOpen).toBe(false);
    expect(result.current.step).toBe("idle");
    expect(result.current.resendTimer).toBe(0);
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
