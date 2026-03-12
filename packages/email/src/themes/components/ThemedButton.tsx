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
          fontSize: "14px",
          fontWeight: "600",
          textDecoration: "none",
          display: "inline-block",
        }}
      >
        {text}
      </Button>
    </Section>
  );
}
