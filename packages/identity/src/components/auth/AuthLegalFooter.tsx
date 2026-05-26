export function AuthLegalFooter({
  termsUrl,
  privacyUrl,
}: {
  termsUrl?: string;
  privacyUrl?: string;
}) {
  if (!termsUrl && !privacyUrl) {
    return null;
  }

  return (
    <p className="text-xs text-muted-foreground text-center mt-4">
      By continuing, you agree to our{" "}
      {termsUrl && (
        <a
          href={termsUrl}
          className="underline underline-offset-4 hover:text-foreground"
        >
          Terms
        </a>
      )}
      {termsUrl && privacyUrl && " and "}
      {privacyUrl && (
        <a
          href={privacyUrl}
          className="underline underline-offset-4 hover:text-foreground"
        >
          Privacy Policy
        </a>
      )}
      .
    </p>
  );
}
