import { Button, Link, Section, Text } from "@react-email/components";
import type { CSSProperties } from "react";
import type { ColorPalette } from "../types/brand";
import { defaultColors } from "../types/brand";

// =============================================================================
// EMAIL BUTTON
// =============================================================================

export interface EmailButtonProps {
  /** Link URL */
  href: string;
  /** Button text */
  children: React.ReactNode;
  /** Color palette overrides */
  colors?: Partial<ColorPalette>;
  /** Additional styles */
  style?: CSSProperties;
}

/**
 * Styled CTA button for emails.
 * Uses a class name for dark mode support via media query in BaseEmailLayout.
 */
export function EmailButton({
  href,
  children,
  colors = {},
  style,
}: EmailButtonProps) {
  const palette = { ...defaultColors, ...colors };

  return (
    <Section style={buttonContainer}>
      <Button
        className="email-button"
        style={{
          ...button,
          backgroundColor: palette.buttonBg,
          color: palette.buttonText,
          ...style,
        }}
        href={href}
      >
        {children}
      </Button>
    </Section>
  );
}

// =============================================================================
// EMAIL TEXT
// =============================================================================

export interface EmailTextProps {
  /** Text content */
  children: React.ReactNode;
  /** Variant styling */
  variant?: "default" | "muted" | "small" | "center" | "expiry";
  /** Color palette overrides */
  colors?: Partial<ColorPalette>;
  /** Additional styles */
  style?: CSSProperties;
}

/**
 * Styled text paragraph for emails.
 */
export function EmailText({
  children,
  variant = "default",
  colors = {},
  style,
}: EmailTextProps) {
  const palette = { ...defaultColors, ...colors };

  const variantStyles: Record<string, CSSProperties> = {
    default: {
      color: palette.text,
      fontSize: "16px",
      lineHeight: "24px",
      margin: "16px 0",
    },
    muted: {
      color: palette.textMuted,
      fontSize: "14px",
      lineHeight: "22px",
      margin: "16px 0",
    },
    small: {
      color: palette.textLight,
      fontSize: "12px",
      lineHeight: "18px",
      margin: "8px 0",
    },
    center: {
      color: palette.text,
      fontSize: "16px",
      lineHeight: "24px",
      margin: "16px 0",
      textAlign: "center" as const,
    },
    expiry: {
      color: palette.textMuted,
      fontSize: "12px",
      lineHeight: "18px",
      margin: "8px 0 0 0",
      textAlign: "center" as const,
    },
  };

  return (
    <Text style={{ ...variantStyles[variant], ...style }}>{children}</Text>
  );
}

// =============================================================================
// EMAIL HEADING
// =============================================================================

export interface EmailHeadingProps {
  /** Heading text */
  children: React.ReactNode;
  /** Heading level styling */
  as?: "h1" | "h2" | "h3";
  /** Additional styles */
  style?: CSSProperties;
}

/**
 * Styled heading for emails.
 */
export function EmailHeading({
  children,
  as = "h1",
  style,
}: EmailHeadingProps) {
  const headingStyles: Record<string, CSSProperties> = {
    h1: {
      color: "#18181b",
      fontSize: "24px",
      fontWeight: "600",
      textAlign: "center" as const,
      margin: "24px 0 16px 0",
    },
    h2: {
      color: "#18181b",
      fontSize: "20px",
      fontWeight: "600",
      margin: "20px 0 12px 0",
    },
    h3: {
      color: "#27272a",
      fontSize: "16px",
      fontWeight: "600",
      margin: "16px 0 8px 0",
    },
  };

  return <Text style={{ ...headingStyles[as], ...style }}>{children}</Text>;
}

// =============================================================================
// EMAIL CONTENT
// =============================================================================

export interface EmailContentProps {
  /** Content children */
  children: React.ReactNode;
  /** Padding */
  padding?: string;
}

/**
 * Content section wrapper.
 */
export function EmailContent({
  children,
  padding = "0 20px",
}: EmailContentProps) {
  return <Section style={{ padding }}>{children}</Section>;
}

// =============================================================================
// EMAIL LINK TEXT
// =============================================================================

export interface EmailLinkTextProps {
  /** The URL to display */
  href: string;
  /** Color palette overrides */
  colors?: Partial<ColorPalette>;
  /** Optional label text before the link */
  label?: string;
}

/**
 * Fallback link text for when buttons don't work.
 */
export function EmailLinkText({
  href,
  colors = {},
  label = "If the button doesn't work, copy and paste this link:",
}: EmailLinkTextProps) {
  const palette = { ...defaultColors, ...colors };

  return (
    <>
      <Text
        style={{
          color: palette.textMuted,
          fontSize: "12px",
          margin: "24px 0 4px 0",
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: palette.link,
          fontSize: "12px",
          wordBreak: "break-all",
          margin: "0 0 16px 0",
        }}
      >
        <Link href={href} style={{ color: palette.link }}>
          {href}
        </Link>
      </Text>
    </>
  );
}

// =============================================================================
// EMAIL DIVIDER
// =============================================================================

export interface EmailDividerProps {
  /** Color palette overrides */
  colors?: Partial<ColorPalette>;
}

/**
 * Horizontal divider for emails.
 */
export function EmailDivider({ colors = {} }: EmailDividerProps) {
  const palette = { ...defaultColors, ...colors };

  return (
    <Section
      style={{
        borderTop: `1px solid ${palette.border}`,
        margin: "24px 0",
      }}
    />
  );
}

// =============================================================================
// STYLES
// =============================================================================

const buttonContainer = {
  textAlign: "center" as const,
  margin: "24px 0 8px 0",
};

const button = {
  borderRadius: "6px",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 32px",
};
