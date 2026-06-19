import { describe, expect, it } from "vitest";
import {
  buildUnsubscribeUrl,
  generateUnsubscribeToken,
  getUnsubscribeHeadersFromConfig,
  parseListUnsubscribeHeader,
  verifyUnsubscribeToken,
} from "./unsubscribe";

describe("unsubscribe helpers", () => {
  it("generates and verifies hmac token when secret is provided", () => {
    const token = generateUnsubscribeToken({
      email: "User@Example.com",
      secret: "top-secret",
    });

    expect(
      verifyUnsubscribeToken({
        email: "user@example.com",
        token,
        secret: "top-secret",
      }),
    ).toBe(true);
  });

  it("fails verification for invalid token", () => {
    expect(
      verifyUnsubscribeToken({
        email: "user@example.com",
        token: "invalid",
        secret: "top-secret",
      }),
    ).toBe(false);
  });

  it("throws when generating a token without a secret", () => {
    expect(() =>
      // @ts-expect-error Runtime guard still protects JavaScript callers.
      generateUnsubscribeToken({
        email: "user@example.com",
      }),
    ).toThrow("unsubscribeSecret is required");
  });

  it("throws when generating a token with a blank secret", () => {
    expect(() =>
      generateUnsubscribeToken({
        email: "user@example.com",
        secret: "   ",
      }),
    ).toThrow("unsubscribeSecret is required");
  });

  it("fails verification without a secret", () => {
    expect(
      verifyUnsubscribeToken({
        email: "user@example.com",
        token: "token",
      }),
    ).toBe(false);
  });

  it("fails verification with a blank secret", () => {
    expect(
      verifyUnsubscribeToken({
        email: "user@example.com",
        token: "token",
        secret: "   ",
      }),
    ).toBe(false);
  });

  it("builds a complete unsubscribe url", () => {
    const url = buildUnsubscribeUrl({
      baseUrl: "https://partners.thefactoryhq.com/unsubscribe",
      email: "user@example.com",
      token: "abc",
    });

    expect(url).toBe(
      "https://partners.thefactoryhq.com/unsubscribe?email=user%40example.com&token=abc",
    );
  });

  it("creates and parses list-unsubscribe headers", () => {
    const headers = getUnsubscribeHeadersFromConfig(
      {
        siteUrl: "https://partners.thefactoryhq.com",
        unsubscribeSecret: "top-secret",
      },
      "user@example.com",
    );

    expect(headers["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");

    const url = parseListUnsubscribeHeader(headers["List-Unsubscribe"]);
    expect(url).toContain("https://partners.thefactoryhq.com/unsubscribe?");
    expect(url).toContain("email=user%40example.com");
  });

  it("throws when creating unsubscribe headers without a secret", () => {
    expect(() =>
      getUnsubscribeHeadersFromConfig(
        // @ts-expect-error Runtime guard still protects JavaScript callers.
        {
          siteUrl: "https://partners.thefactoryhq.com",
        },
        "user@example.com",
      ),
    ).toThrow("unsubscribeSecret is required");
  });
});
