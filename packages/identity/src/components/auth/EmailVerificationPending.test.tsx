import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CreateClientFn } from "../../types";
import { EmailVerificationPending } from "./EmailVerificationPending";

const routerPush = vi.hoisted(() => vi.fn());
const routerRefresh = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: routerPush,
    refresh: routerRefresh,
  }),
}));

function TestImage({
  alt,
  ...props
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}) {
  return <img alt={alt} {...props} />;
}

function createMockClient() {
  const getSession = vi.fn().mockResolvedValue({ data: { session: null } });
  const resend = vi.fn().mockResolvedValue({ error: null });
  const unsubscribe = vi.fn();
  const createClient = vi.fn(
    () =>
      ({
        auth: {
          getSession,
          resend,
          onAuthStateChange: vi.fn(() => ({
            data: { subscription: { unsubscribe } },
          })),
        },
      }) as unknown as ReturnType<CreateClientFn>,
  );

  return { createClient, getSession, resend };
}

describe("EmailVerificationPending", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    routerPush.mockReset();
    routerRefresh.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("preserves the signup callback redirect when resending without a session", async () => {
    const { createClient, getSession, resend } = createMockClient();
    render(
      <EmailVerificationPending
        email="member@example.com"
        ImageComponent={TestImage}
        createClient={createClient}
        redirectTo="/club/membership?invite=invite-1#payment"
      />,
    );

    for (let second = 0; second < 30; second += 1) {
      await act(async () => {
        vi.advanceTimersByTime(1_000);
      });
    }
    fireEvent.click(screen.getByRole("button", { name: "Resend" }));
    await act(async () => {
      await Promise.resolve();
    });

    expect(getSession).toHaveBeenCalled();
    expect(resend).toHaveBeenCalledWith({
      type: "signup",
      email: "member@example.com",
      options: {
        emailRedirectTo:
          "http://localhost:3000/callback?next=%2Fclub%2Fmembership%3Finvite%3Dinvite-1%23payment",
      },
    });
  });
});
