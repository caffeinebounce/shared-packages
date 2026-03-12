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
      email: "Doug@TheFactoryHQ.com",
      secret: "top-secret",
    });

    expect(
      verifyUnsubscribeToken({
        email: "doug@thefactoryhq.com",
        token,
        secret: "top-secret",
      }),
    ).toBe(true);
  });

  it("fails verification for invalid token", () => {
    expect(
      verifyUnsubscribeToken({
        email: "doug@thefactoryhq.com",
        token: "invalid",
        secret: "top-secret",
      }),
    ).toBe(false);
  });

  it("generates and verifies fallback token without secret", () => {
    const token = generateUnsubscribeToken({
      email: "Doug@TheFactoryHQ.com",
    });

    expect(
      verifyUnsubscribeToken({
        email: "doug@thefactoryhq.com",
        token,
      }),
    ).toBe(true);
  });

  it("builds a complete unsubscribe url", () => {
    const url = buildUnsubscribeUrl({
      baseUrl: "https://partners.thefactoryhq.com/unsubscribe",
      email: "doug@thefactoryhq.com",
      token: "abc",
    });

    expect(url).toBe(
      "https://partners.thefactoryhq.com/unsubscribe?email=doug%40thefactoryhq.com&token=abc",
    );
  });

  it("creates and parses list-unsubscribe headers", () => {
    const headers = getUnsubscribeHeadersFromConfig(
      {
        siteUrl: "https://partners.thefactoryhq.com",
        unsubscribeSecret: "top-secret",
      },
      "doug@thefactoryhq.com",
    );

    expect(headers["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");

    const url = parseListUnsubscribeHeader(headers["List-Unsubscribe"]);
    expect(url).toContain("https://partners.thefactoryhq.com/unsubscribe?");
    expect(url).toContain("email=doug%40thefactoryhq.com");
  });
});
