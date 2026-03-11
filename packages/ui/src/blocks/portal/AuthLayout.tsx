import type { CSSProperties, ReactNode } from "react";

export interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

const wrapperStyle: CSSProperties = {
  position: "relative",
  minHeight: "100vh",
  backgroundColor: "#1B1B1B",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "Inter, sans-serif",
  overflow: "hidden",
};

const lineStyle: CSSProperties = {
  position: "absolute",
  top: "15%",
  left: 0,
  right: 0,
  height: 2,
  backgroundColor: "#FF4628",
};

const dotStyle: CSSProperties = {
  position: "absolute",
  top: "calc(15% - 6px)",
  right: 40,
  width: 12,
  height: 12,
  borderRadius: "50%",
  backgroundColor: "#FF4628",
};

const circleStyle: CSSProperties = {
  position: "absolute",
  bottom: -120,
  right: -120,
  width: 340,
  height: 340,
  borderRadius: "50%",
  backgroundColor: "#D9563F",
  opacity: 0.15,
};

const contentStyle: CSSProperties = {
  position: "relative",
  zIndex: 1,
  maxWidth: 440,
  width: "100%",
  padding: "0 24px",
};

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div style={wrapperStyle}>
      <div style={lineStyle} />
      <div style={dotStyle} />
      <div style={circleStyle} />
      <div style={contentStyle}>
        {title && (
          <h1
            style={{
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "1.75em",
              margin: "0 0 0.25em",
            }}
          >
            {title}
          </h1>
        )}
        {subtitle && (
          <p
            style={{
              color: "#B9C8D7",
              fontWeight: 400,
              fontSize: "1em",
              margin: "0 0 2em",
            }}
          >
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
