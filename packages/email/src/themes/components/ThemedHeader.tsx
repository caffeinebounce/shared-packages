import { Img, Section } from "@react-email/components";
import type { EmailThemeConfig } from "../index";
import type { EmailThemeTokens } from "../tokens";

interface ThemedHeaderProps {
  tokens: EmailThemeTokens;
  config: EmailThemeConfig;
  logoMode?: "square" | "full";
  logoAlign?: "left" | "center" | "right";
}

export function ThemedHeader({
  tokens,
  config,
  logoMode,
  logoAlign,
}: ThemedHeaderProps) {
  const mode = logoMode || config.logoMode || "square";
  const align = logoAlign || config.logoAlign || "center";

  const sectionStyle: React.CSSProperties = {
    textAlign: align,
    marginBottom: "24px",
  };

  // Full/wide logo
  if (mode === "full" && config.logoUrl) {
    return (
      <Section style={sectionStyle}>
        <Img
          src={config.logoUrl}
          width={200}
          alt={config.appName}
          style={{
            maxWidth: "200px",
            height: "auto",
            ...(align === "center" ? { margin: "0 auto" } : {}),
            ...(align === "right"
              ? { marginLeft: "auto", marginRight: "0" }
              : {}),
          }}
        />
      </Section>
    );
  }

  // Square logo/icon
  if (mode === "square" && config.logoSquareUrl) {
    return (
      <Section style={sectionStyle}>
        <Img
          src={config.logoSquareUrl}
          width={56}
          height={56}
          alt={config.appName}
          style={{
            borderRadius: tokens.iconRadius,
            ...(align === "center" ? { margin: "0 auto" } : {}),
            ...(align === "right"
              ? { marginLeft: "auto", marginRight: "0" }
              : {}),
          }}
        />
      </Section>
    );
  }

  // Fallback: accent dot in rounded square
  return (
    <Section style={sectionStyle}>
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
