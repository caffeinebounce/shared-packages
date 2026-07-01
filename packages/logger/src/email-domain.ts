export function extractAccountDomain(email: string): string | undefined {
  const trimmedEmail = email.trim();
  const separatorIndex = trimmedEmail.lastIndexOf("@");

  if (separatorIndex <= 0 || separatorIndex === trimmedEmail.length - 1) {
    return undefined;
  }

  const accountDomain = trimmedEmail.slice(separatorIndex + 1).trim();

  return accountDomain ? accountDomain.toLowerCase() : undefined;
}
