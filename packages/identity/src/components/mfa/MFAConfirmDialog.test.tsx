import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const confirmAccessDialogSpy = vi.hoisted(() => vi.fn());

vi.mock("../security/ConfirmAccessDialog", () => ({
  ConfirmAccessDialog: (props: unknown) => {
    confirmAccessDialogSpy(props);
    return <div data-testid="confirm-access-dialog" />;
  },
}));

import type { CreateClientFn } from "../../types";
import { MFAConfirmDialog } from "./MFAConfirmDialog";

describe("MFAConfirmDialog", () => {
  beforeEach(() => {
    confirmAccessDialogSpy.mockClear();
  });

  it("delegates to ConfirmAccessDialog in MFA-only destructive mode", () => {
    const createClient = vi.fn(
      () => ({}) as unknown as ReturnType<CreateClientFn>,
    );
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();

    render(
      <MFAConfirmDialog
        createClient={createClient}
        open={true}
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
        factorId="factor-1"
        factorType="phone"
        title="Confirm removal"
        description="Verify before removing this method."
        confirmText="Remove"
        confirmLoading={true}
      />,
    );

    expect(screen.getByTestId("confirm-access-dialog")).toBeInTheDocument();
    expect(confirmAccessDialogSpy).toHaveBeenCalledTimes(1);
    expect(confirmAccessDialogSpy).toHaveBeenCalledWith({
      createClient,
      open: true,
      onOpenChange,
      onConfirm,
      verificationMethod: "mfa",
      mfaFactor: { id: "factor-1", type: "phone" },
      title: "Confirm removal",
      description: "Verify before removing this method.",
      confirmText: "Remove",
      confirmLoading: true,
      destructive: true,
    });
  });
});
