import type { CSSProperties } from "react";
import { type DealStatus, StatusBadge } from "./StatusBadge";

export interface DealCardProps {
  title: string;
  subtitle: string;
  status: DealStatus;
  logoUrl?: string;
  summary: string;
  href: string;
}

const cardStyle: CSSProperties = {
  position: "relative",
  backgroundColor: "#F8F8F8",
  borderLeft: "3px solid #FF4628",
  borderRadius: 8,
  padding: "1.25em 1.5em",
  fontFamily: "Inter, sans-serif",
  textDecoration: "none",
  color: "#1B1B1B",
  display: "block",
  cursor: "pointer",
};

export function DealCard({
  title,
  subtitle,
  status,
  logoUrl,
  summary,
  href,
}: DealCardProps) {
  return (
    <a href={href} style={cardStyle}>
      <div style={{ position: "absolute", top: "1em", right: "1em" }}>
        <StatusBadge status={status} />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75em",
          marginBottom: "0.5em",
        }}
      >
        {logoUrl && (
          <img
            src={logoUrl}
            alt=""
            style={{
              width: 32,
              height: 32,
              borderRadius: 4,
              objectFit: "contain",
            }}
          />
        )}
        <div>
          <div style={{ fontWeight: 700, fontSize: "1.1em" }}>{title}</div>
          <div style={{ fontSize: "0.85em", color: "#555" }}>{subtitle}</div>
        </div>
      </div>
      <p
        style={{
          margin: 0,
          fontSize: "0.9em",
          fontWeight: 400,
          color: "#333",
          lineHeight: 1.5,
        }}
      >
        {summary}
      </p>
    </a>
  );
}
