import { Button, Section } from "@react-email/components";
import type { EmailThemeTokens } from "../tokens";

interface ThemedButtonProps {
  url: string;
  text: string;
  tokens: EmailThemeTokens;
}

export function ThemedButton({ url, text, tokens }: ThemedButtonProps) {
  return (
    <Section style={{ textAlign: "center", margin: "32px 0" }}>
      <Button
        href={url}
        style={{
          backgroundColor: tokens.buttonBg,
          color: tokens.buttonColor,
          borderRadius: tokens.buttonRadius,
          padding: tokens.buttonPadding,
          fontFamily: tokens.fontFamily,
          fontSize: "13px",
          fontWeight: "700",
          letterSpacing: "0.5px",
          textTransform: "uppercase",
          textDecoration: "none",
          display: "inline-block",
        }}
      >
        {text}
      </Button>
    </Section>
  );
}
