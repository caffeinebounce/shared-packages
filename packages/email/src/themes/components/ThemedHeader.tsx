import { Img, Section } from "@react-email/components";
import type { EmailThemeConfig } from "../index";
import type { EmailThemeTokens } from "../tokens";

interface ThemedHeaderProps {
  tokens: EmailThemeTokens;
  config: EmailThemeConfig;
}

export function ThemedHeader({ tokens, config }: ThemedHeaderProps) {
  return (
    <Section style={{ textAlign: "center", marginBottom: "24px" }}>
      {config.logoUrl ? (
        <Img
          src={config.logoUrl}
          width={56}
          height={56}
          alt={config.appName}
          style={{ margin: "0 auto", borderRadius: tokens.iconRadius }}
        />
      ) : (
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
      )}
    </Section>
  );
}
