import type { CSSProperties } from "react";

export type DealStatus = "active" | "closed" | "coming-soon";

export interface StatusBadgeProps {
  status: DealStatus;
}

const statusStyles: Record<DealStatus, CSSProperties> = {
  active: { backgroundColor: "#FF4628", color: "#FFFFFF" },
  closed: { backgroundColor: "#B9C8D7", color: "#1B1B1B" },
  "coming-soon": { backgroundColor: "#D9563F", color: "#FFFFFF" },
};

const statusLabels: Record<DealStatus, string> = {
  active: "Active",
  closed: "Closed",
  "coming-soon": "Coming Soon",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "0.2em 0.75em",
        borderRadius: "999px",
        fontSize: "0.75em",
        fontFamily: "Inter, sans-serif",
        fontWeight: 700,
        lineHeight: 1.6,
        ...statusStyles[status],
      }}
    >
      {statusLabels[status]}
    </span>
  );
}
