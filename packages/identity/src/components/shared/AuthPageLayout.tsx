import { BackgroundRippleEffect, RollingBackground } from "@caffeinebounce/ui";
import type { ComponentType, CSSProperties, ReactNode } from "react";

const externalLogoSizeMap = {
  sm: 120,
  md: 180,
  lg: 280,
  xl: 400,
} as const;

export type AuthPageVariant = "gradient" | "plain" | "ripple" | "rolling";

export interface AuthColorScheme {
  /** Page background color */
  background?: string;
  /** Secondary background for gradients */
  backgroundAlt?: string;
  /** Card background color */
  cardBg?: string;
  /** Card border color */
  cardBorder?: string;
  /** Primary accent color */
  accent?: string;
  /** Text on accent backgrounds */
  accentForeground?: string;
  /** Primary text color */
  text?: string;
  /** Muted text color */
  textMuted?: string;
}

const defaultSchemes: Record<AuthPageVariant, AuthColorScheme> = {
  gradient: {},
  plain: { background: "#0a0a0a" },
  ripple: {},
  rolling: {
    background: "#1B1B1B",
    accent: "#FF4628",
    text: "#FFFFFF",
    textMuted: "#B9C8D7",
  },
};

export interface AuthPageLayoutProps {
  /** Page content */
  children: ReactNode;
  /** Background variant. Default: "gradient" */
  variant?: AuthPageVariant;
  /** Color scheme override (merged with variant defaults) */
  colorScheme?: Partial<AuthColorScheme>;
  /** Logo to display above the sign-in card (external positioning) */
  externalLogo?: {
    src: string;
    alt: string;
  };
  /** Size preset for the external logo. Default: "md" */
  externalLogoSize?: "sm" | "md" | "lg" | "xl";
  /** Image component for external logo rendering */
  ExternalLogoImageComponent?: ComponentType<{
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
  }>;
  /** Logo element for rolling variant background watermark */
  rollingLogo?: ReactNode;
  /**
   * Show the interactive ripple effect.
   * @deprecated Use variant="ripple" instead.
   */
  showRippleEffect?: boolean;
}

/**
 * AuthPageLayout - Full-page layout for auth pages with configurable background variant.
 *
 * @example Basic usage (gradient, backward compat)
 * ```tsx
 * <AuthPageLayout showRippleEffect>
 *   <SigninForm ... />
 * </AuthPageLayout>
 * ```
 *
 * @example Rolling variant
 * ```tsx
 * <AuthPageLayout variant="rolling" rollingLogo={<MyLogo />}>
 *   <SigninForm ... />
 * </AuthPageLayout>
 * ```
 */
export function AuthPageLayout({
  children,
  variant: variantProp,
  colorScheme,
  showRippleEffect = false,
  externalLogo,
  externalLogoSize = "md",
  ExternalLogoImageComponent,
  rollingLogo,
}: AuthPageLayoutProps) {
  // Backward compat: showRippleEffect maps to ripple variant
  const variant: AuthPageVariant =
    variantProp ?? (showRippleEffect ? "ripple" : "gradient");

  const scheme: AuthColorScheme = {
    ...defaultSchemes[variant],
    ...colorScheme,
  };

  const ExternalImage =
    ExternalLogoImageComponent ??
    ("img" as unknown as ComponentType<{
      src: string;
      alt: string;
      width: number;
      height: number;
      className?: string;
    }>);
  const logoMaxWidth = externalLogoSizeMap[externalLogoSize];

  // Build inline style for variants that use custom colors
  const wrapperStyle: CSSProperties =
    variant === "plain" || variant === "rolling"
      ? ({
          "--auth-bg": scheme.background,
          "--auth-bg-alt": scheme.backgroundAlt,
          "--auth-card-bg": scheme.cardBg,
          "--auth-card-border": scheme.cardBorder,
          "--auth-accent": scheme.accent,
          "--auth-accent-fg": scheme.accentForeground,
          "--auth-text": scheme.text,
          "--auth-text-muted": scheme.textMuted,
        } as CSSProperties)
      : {};

  const bgColor =
    variant === "plain" || variant === "rolling"
      ? scheme.background
      : undefined;

  return (
    <div className="relative min-h-svh w-full" style={wrapperStyle}>
      {/* Full-page background */}
      {(variant === "gradient" || variant === "ripple") && (
        <div className="fixed inset-0 bg-zinc-100 dark:bg-zinc-950 pointer-events-none">
          <div className="absolute inset-0 bg-linear-to-br from-zinc-50 via-zinc-100 to-zinc-200 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
        </div>
      )}

      {(variant === "plain" || variant === "rolling") && bgColor && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{ backgroundColor: bgColor }}
        />
      )}

      {/* Rolling variant animated background */}
      {variant === "rolling" && (
        <div className="fixed inset-0 z-0">
          <RollingBackground
            accentColor={scheme.accent ?? "#FF4628"}
            mutedAccentColor="#D9563F"
            logo={rollingLogo}
          />
        </div>
      )}

      {/* Ripple effect */}
      {variant === "ripple" && (
        <div className="fixed inset-0 z-10">
          <BackgroundRippleEffect rows={20} cols={40} cellSize={56} />
        </div>
      )}

      {/* Content */}
      <div className="relative z-20 pointer-events-none">{children}</div>
    </div>
  );
}
