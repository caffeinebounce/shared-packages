import type { ReactNode } from "react";

export interface ThesisCalloutProps {
  title: string;
  children: ReactNode;
}

export function ThesisCallout({ title, children }: ThesisCalloutProps) {
  return (
    <div
      style={{
        backgroundColor: "#1B1B1B",
        color: "#FFFFFF",
        borderLeft: "4px solid #FF4628",
        borderRadius: 6,
        padding: "1em 1.2em",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          color: "#FF4628",
          fontSize: "0.85em",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 700,
          marginBottom: "0.5em",
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: "0.95em", lineHeight: 1.6, fontWeight: 400 }}>
        {children}
      </div>
    </div>
  );
}
