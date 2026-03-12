import { Img, Section } from "@react-email/components";
import type { EmailThemeConfig } from "../index";
import type { EmailThemeTokens } from "../tokens";

interface ThemedHeaderProps {
  tokens: EmailThemeTokens;
  config: EmailThemeConfig;
  /** Override the default logo mode for this specific email */
  logoMode?: "square" | "full";
}

export function ThemedHeader({ tokens, config, logoMode }: ThemedHeaderProps) {
  const mode = logoMode || config.logoMode || "square";

  // Full/wide logo
  if (mode === "full" && config.logoUrl) {
    return (
      <Section style={{ textAlign: "center", marginBottom: "24px" }}>
        <Img
          src={config.logoUrl}
          width={200}
          alt={config.appName}
          style={{ margin: "0 auto", maxWidth: "200px", height: "auto" }}
        />
      </Section>
    );
  }

  // Square logo/icon
  if (mode === "square" && config.logoSquareUrl) {
    return (
      <Section style={{ textAlign: "center", marginBottom: "24px" }}>
        <Img
          src={config.logoSquareUrl}
          width={56}
          height={56}
          alt={config.appName}
          style={{ margin: "0 auto", borderRadius: tokens.iconRadius }}
        />
      </Section>
    );
  }

  // Fallback: accent dot in rounded square
  return (
    <Section style={{ textAlign: "center", marginBottom: "24px" }}>
      <div
        style={{
          display: "inline-block",
          width: "56px",
          height: "56px",
          borderRadius: tokens.iconRadius,
          backgroundColor: tokens.iconBg,
          lineHeight: "56px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-block",
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            backgroundColor: tokens.accentColor,
            verticalAlign: "middle",
          }}
        />
      </div>
    </Section>
  );
}
