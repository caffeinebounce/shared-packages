import type { ReactNode } from "react";

export interface HighlightCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function HighlightCard({
  icon,
  title,
  description,
}: HighlightCardProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "1em",
        alignItems: "flex-start",
        backgroundColor: "#F8F8F8",
        borderLeft: "3px solid #FF4628",
        borderRadius: 8,
        padding: "1em",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "2.4em",
          height: "2.4em",
          minWidth: "2.4em",
          backgroundColor: "#FF4628",
          color: "#FFFFFF",
          borderRadius: 8,
          fontSize: "1em",
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{ fontWeight: 700, color: "#1B1B1B", marginBottom: "0.25em" }}
        >
          {title}
        </div>
        <div
          style={{
            color: "#555",
            fontWeight: 400,
            fontSize: "0.9em",
            lineHeight: 1.5,
          }}
        >
          {description}
        </div>
      </div>
    </div>
  );
}
