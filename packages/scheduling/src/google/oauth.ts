/**
 * Google OAuth (delegated, read-only) for advisor calendar connection.
 * Plain `fetch` against Google's OAuth endpoints — no `googleapis` dependency.
 * We request only free/busy scope; we never read event details or write.
 */
import type { Clock, FetchLike, SchedulingConfig } from "../ports";
import { systemClock } from "../ports";

export interface GoogleOAuthDeps {
  fetch?: FetchLike;
  clock?: Clock;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken: string | null;
  /** Access-token expiry, epoch ms. */
  expiresAt: number;
}

const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const FREEBUSY_SCOPE = "https://www.googleapis.com/auth/calendar.freebusy";
const EMAIL_SCOPE = "https://www.googleapis.com/auth/userinfo.email";

function requireGoogle(config: SchedulingConfig) {
  if (!config.google)
    throw new Error("SchedulingConfig.google is not configured");
  return config.google;
}

/** Build the consent URL. `state` should be a CSRF token tied to the session. */
export function buildGoogleAuthUrl(
  config: SchedulingConfig,
  opts: { redirectUri: string; state: string },
): string {
  const { clientId } = requireGoogle(config);
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: opts.redirectUri,
    response_type: "code",
    scope: `${FREEBUSY_SCOPE} ${EMAIL_SCOPE}`,
    access_type: "offline",
    prompt: "consent",
    state: opts.state,
  });
  return `${AUTH_ENDPOINT}?${params.toString()}`;
}

async function tokenRequest(
  config: SchedulingConfig,
  deps: GoogleOAuthDeps,
  params: Record<string, string>,
): Promise<OAuthTokens> {
  const { clientId, clientSecret } = requireGoogle(config);
  const fetchImpl = deps.fetch ?? ((i, init) => fetch(i, init));
  const clock = deps.clock ?? systemClock;
  const res = await fetchImpl(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      ...params,
    }).toString(),
  });
  if (!res.ok)
    throw new Error(
      `Google token request failed (${res.status}): ${await res.text()}`,
    );
  const json = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token ?? null,
    expiresAt: clock.now() + (json.expires_in - 60) * 1000,
  };
}

/** Exchange an authorization code for tokens. */
export function exchangeGoogleCode(
  config: SchedulingConfig,
  deps: GoogleOAuthDeps,
  opts: { code: string; redirectUri: string },
): Promise<OAuthTokens> {
  return tokenRequest(config, deps, {
    grant_type: "authorization_code",
    code: opts.code,
    redirect_uri: opts.redirectUri,
  });
}

/** Refresh an access token. Google omits a new refresh token, so the caller keeps the old one. */
export function refreshGoogleToken(
  config: SchedulingConfig,
  deps: GoogleOAuthDeps,
  refreshToken: string,
): Promise<OAuthTokens> {
  return tokenRequest(config, deps, {
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
}
