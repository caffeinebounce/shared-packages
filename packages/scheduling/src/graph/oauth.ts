/**
 * Microsoft *delegated* OAuth for advisors connecting their own (possibly
 * external/personal) Microsoft calendar. Distinct from the app-only client
 * credentials in `GraphClient` — this uses the advisor's own consent against
 * the `common` tenant, with read-only calendar scope.
 */

import type { OAuthTokens } from "../google/oauth";
import type { Clock, FetchLike, SchedulingConfig } from "../ports";
import { systemClock } from "../ports";

const AUTH_ENDPOINT =
  "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
const TOKEN_ENDPOINT =
  "https://login.microsoftonline.com/common/oauth2/v2.0/token";
// Read-only: we only read busy times and never write to the advisor's calendar.
const SCOPES =
  "openid profile email offline_access https://graph.microsoft.com/Calendars.Read";

export interface MicrosoftOAuthDeps {
  fetch?: FetchLike;
  clock?: Clock;
}

export function buildMicrosoftAuthUrl(
  config: SchedulingConfig,
  opts: { redirectUri: string; state: string },
): string {
  const params = new URLSearchParams({
    client_id: config.microsoft.clientId,
    response_type: "code",
    redirect_uri: opts.redirectUri,
    response_mode: "query",
    scope: SCOPES,
    state: opts.state,
  });
  return `${AUTH_ENDPOINT}?${params.toString()}`;
}

async function tokenRequest(
  config: SchedulingConfig,
  deps: MicrosoftOAuthDeps,
  params: Record<string, string>,
): Promise<OAuthTokens> {
  const fetchImpl = deps.fetch ?? ((i, init) => fetch(i, init));
  const clock = deps.clock ?? systemClock;
  const res = await fetchImpl(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.microsoft.clientId,
      client_secret: config.microsoft.clientSecret,
      scope: SCOPES,
      ...params,
    }).toString(),
  });
  if (!res.ok)
    throw new Error(
      `Microsoft token request failed (${res.status}): ${await res.text()}`,
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

export function exchangeMicrosoftCode(
  config: SchedulingConfig,
  deps: MicrosoftOAuthDeps,
  opts: { code: string; redirectUri: string },
): Promise<OAuthTokens> {
  return tokenRequest(config, deps, {
    grant_type: "authorization_code",
    code: opts.code,
    redirect_uri: opts.redirectUri,
  });
}

export function refreshMicrosoftToken(
  config: SchedulingConfig,
  deps: MicrosoftOAuthDeps,
  refreshToken: string,
): Promise<OAuthTokens> {
  return tokenRequest(config, deps, {
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
}
