import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CreateClientFn } from "../../types";
import { SignupForm } from "./SignupForm";

const routerPush = vi.hoisted(() => vi.fn());
const routerRefresh = vi.hoisted(() => vi.fn());
let warnSpy: ReturnType<typeof vi.spyOn>;

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: routerPush,
    refresh: routerRefresh,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

function createMockClient() {
  const signUp = vi.fn().mockResolvedValue({
    data: {
      session: { access_token: "session-token" },
      user: { id: "user-1" },
    },
    error: null,
  });
  const signInWithOAuth = vi.fn().mockResolvedValue({ error: null });
  const createClient = vi.fn(
    () =>
      ({
        auth: {
          signInWithOAuth,
          signUp,
        },
      }) as unknown as ReturnType<CreateClientFn>,
  );

  return { createClient, signInWithOAuth, signUp };
}

async function submitValidSignup() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Email Address"), "member@example.com");
  await user.type(screen.getByLabelText("Password"), "ValidPassword1!");
  await user.type(screen.getByLabelText("Confirm Password"), "ValidPassword1!");
  await user.click(screen.getByRole("button", { name: "Sign Up" }));
}

describe("SignupForm", () => {
  beforeEach(() => {
    routerPush.mockReset();
    routerRefresh.mockReset();
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it("preserves the app-name heading by default and accepts a title override", () => {
    const { createClient } = createMockClient();
    const { rerender } = render(
      <SignupForm
        appName="Factory Partners"
        createClient={createClient}
        oauthProviders={[]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Sign up for Factory Partners" }),
    ).toBeInTheDocument();

    rerender(
      <SignupForm
        appName="Factory Partners"
        createClient={createClient}
        oauthProviders={[]}
        title="Sign Up"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Sign Up" }),
    ).toBeInTheDocument();
  });

  it("uses an optional initial email without changing the empty default", () => {
    const { createClient } = createMockClient();
    const { unmount } = render(
      <SignupForm createClient={createClient} oauthProviders={[]} />,
    );

    expect(screen.getByLabelText("Email Address")).toHaveValue("");
    unmount();

    render(
      <SignupForm
        createClient={createClient}
        initialEmail="invited@example.com"
        oauthProviders={[]}
      />,
    );

    expect(screen.getByLabelText("Email Address")).toHaveValue(
      "invited@example.com",
    );
  });

  it("uses a safe internal default redirect for signup and confirmation", async () => {
    const { createClient, signUp } = createMockClient();
    render(
      <SignupForm
        createClient={createClient}
        links={{ defaultRedirect: "/club/membership?invite=invite-1" }}
        oauthProviders={[]}
      />,
    );

    await submitValidSignup();

    await waitFor(() => expect(signUp).toHaveBeenCalledTimes(1));
    expect(signUp).toHaveBeenCalledWith({
      email: "member@example.com",
      password: "ValidPassword1!",
      options: {
        data: {},
        emailRedirectTo:
          "http://localhost:3000/callback?next=%2Fclub%2Fmembership%3Finvite%3Dinvite-1",
      },
    });
    expect(routerPush).toHaveBeenCalledWith("/club/membership?invite=invite-1");
    expect(routerRefresh).toHaveBeenCalledTimes(1);
  });

  it("uses the safe redirect for OAuth signup", async () => {
    const user = userEvent.setup();
    const { createClient, signInWithOAuth } = createMockClient();
    render(
      <SignupForm
        createClient={createClient}
        links={{ defaultRedirect: "//evil.example/steal" }}
        oauthProviders={["azure"]}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /Continue with Microsoft/ }),
    );

    await waitFor(() => expect(signInWithOAuth).toHaveBeenCalledTimes(1));
    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider: "azure",
      options: {
        redirectTo: "http://localhost:3000/callback?next=%2Fdashboard",
        scopes: "email",
      },
    });
  });

  it.each([
    "https://evil.example/steal",
    "//evil.example/steal",
  ])("falls back when the default redirect is not internal: %s", async (unsafeRedirect) => {
    const { createClient, signUp } = createMockClient();
    render(
      <SignupForm
        createClient={createClient}
        links={{ defaultRedirect: unsafeRedirect }}
        oauthProviders={[]}
      />,
    );

    await submitValidSignup();

    await waitFor(() => expect(signUp).toHaveBeenCalledTimes(1));
    expect(signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          emailRedirectTo: "http://localhost:3000/callback?next=%2Fdashboard",
        }),
      }),
    );
    expect(routerPush).toHaveBeenCalledWith("/dashboard");
  });

  it("does not enter an update loop when consent items are omitted", async () => {
    const { createClient } = createMockClient();
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<SignupForm createClient={createClient} oauthProviders={[]} />);
    fireEvent.blur(screen.getByLabelText("Email Address"));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(
      errorSpy.mock.calls.some((call) =>
        call.some(
          (value) =>
            typeof value === "string" &&
            value.includes("Maximum update depth exceeded"),
        ),
      ),
    ).toBe(false);

    errorSpy.mockRestore();
  });
});
