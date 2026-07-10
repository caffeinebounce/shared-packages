const INTERNAL_REDIRECT_BASE = new URL("https://identity.invalid");
const ENCODED_PATH_SEPARATOR = /%(?:2f|5c)/i;

function hasControlCharacter(value: string) {
  return Array.from(value).some((character) => {
    const code = character.charCodeAt(0);
    return code <= 0x1f || code === 0x7f;
  });
}

function isStrictInternalRedirect(
  candidate: string | null | undefined,
): candidate is string {
  if (!candidate?.startsWith("/") || hasControlCharacter(candidate)) {
    return false;
  }

  const pathEnd = candidate.search(/[?#]/);
  const pathname = pathEnd === -1 ? candidate : candidate.slice(0, pathEnd);
  if (pathname.includes("\\") || ENCODED_PATH_SEPARATOR.test(pathname)) {
    return false;
  }

  try {
    const target = new URL(candidate, INTERNAL_REDIRECT_BASE);
    return target.origin === INTERNAL_REDIRECT_BASE.origin;
  } catch {
    return false;
  }
}

export function getSafeInternalRedirect(
  candidate: string | null | undefined,
  fallback: string,
): string;
export function getSafeInternalRedirect(
  candidate: string | null | undefined,
  fallback: null,
): string | null;
/** Keep post-auth redirects on the current origin with a safe fallback. */
export function getSafeInternalRedirect(
  candidate: string | null | undefined,
  fallback: string | null,
): string | null {
  if (isStrictInternalRedirect(candidate)) {
    return candidate;
  }

  if (fallback === null) {
    return null;
  }

  return isStrictInternalRedirect(fallback) ? fallback : "/";
}
