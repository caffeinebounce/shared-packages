import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CreateClientFn } from "../../types";
import { SigninForm } from "./SigninForm";

const hardRedirect = vi.hoisted(() => vi.fn());
const redirectParam = vi.hoisted(() => ({ value: null as string | null }));
const routerReplace = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    replace: routerReplace,
  }),
  useSearchParams: () => ({
    get: (name: string) => (name === "redirect" ? redirectParam.value : null),
  }),
}));

vi.mock("@caffeinebounce/logger/client", () => ({
  useErrorLoggerSafe: () => ({ logError: vi.fn() }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("./utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./utils")>();
  return { ...actual, hardRedirect };
});

function createMockClient() {
  const signInWithPassword = vi.fn().mockResolvedValue({ error: null });
  const createClient = vi.fn(
    () =>
      ({
        auth: {
          signInWithPassword,
          getSession: vi.fn().mockResolvedValue({
            data: { session: { user: { id: "user-1" } } },
          }),
          mfa: {
            getAuthenticatorAssuranceLevel: vi.fn().mockResolvedValue({
              data: { currentLevel: "aal1", nextLevel: "aal1" },
            }),
          },
        },
      }) as unknown as ReturnType<CreateClientFn>,
  );

  return { createClient, signInWithPassword };
}

async function submitPasswordSignIn() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Email Address"), "user@example.com");
  await user.click(screen.getByRole("button", { name: "Continue" }));
  await user.type(screen.getByLabelText("Password"), "ValidPassword1!");
  await user.click(screen.getByRole("button", { name: "Sign in" }));
}

describe("SigninForm redirect handling", () => {
  beforeEach(() => {
    hardRedirect.mockReset();
    routerReplace.mockReset();
    redirectParam.value = null;
  });

  it.each([
    "https://evil.example/settings",
    "//evil.example/settings",
    "javascript:alert(1)",
    "/\\evil.example/settings",
    "/\\\\evil.example/settings",
    "/%2F%2Fevil.example/settings",
    "/%5Cevil.example/settings",
  ])("falls back after password auth for an unsafe redirect: %s", async (redirect) => {
    redirectParam.value = redirect;
    const { createClient } = createMockClient();
    render(<SigninForm createClient={createClient} oauthProviders={[]} />);

    await submitPasswordSignIn();

    await waitFor(() =>
      expect(hardRedirect).toHaveBeenCalledWith("/dashboard"),
    );
  });

  it("preserves a valid internal path, query string, and hash", async () => {
    redirectParam.value = "/club/settings?tab=profile#security";
    const { createClient } = createMockClient();
    render(<SigninForm createClient={createClient} oauthProviders={[]} />);

    await submitPasswordSignIn();

    await waitFor(() =>
      expect(hardRedirect).toHaveBeenCalledWith(
        "/club/settings?tab=profile#security",
      ),
    );
  });
});
