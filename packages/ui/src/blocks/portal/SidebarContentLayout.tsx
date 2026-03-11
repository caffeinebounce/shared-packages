import type { CSSProperties, ReactNode } from "react";

export interface SidebarContentLayoutProps {
  sidebarTitle: string;
  sidebarSubsection?: string;
  pageNumber?: number;
  children: ReactNode;
}

export function SidebarContentLayout({
  sidebarTitle,
  sidebarSubsection,
  pageNumber,
  children,
}: SidebarContentLayoutProps) {
  return (
    <>
      <style>{`
        .portal-sidebar-layout {
          display: grid;
          grid-template-columns: clamp(200px, 20vw, 400px) 1fr;
          min-height: 100vh;
          font-family: Inter, sans-serif;
        }
        .portal-sidebar-layout__sidebar {
          display: flex;
          flex-direction: column;
          padding: 40px 32px;
          border-right: 1px solid #E5E5E5;
        }
        .portal-sidebar-layout__content {
          background: #FFFFFF;
          padding: 40px 80px 40px 60px;
          overflow-y: auto;
        }
        @media (max-width: 899px) {
          .portal-sidebar-layout {
            grid-template-columns: 1fr;
          }
          .portal-sidebar-layout__sidebar {
            flex-direction: row;
            align-items: center;
            gap: 1em;
            padding: 16px 20px;
            border-right: none;
            border-bottom: 1px solid #E5E5E5;
          }
          .portal-sidebar-layout__content {
            padding: 24px 20px;
          }
        }
      `}</style>
      <div className="portal-sidebar-layout">
        <div className="portal-sidebar-layout__sidebar">
          <div style={{ fontWeight: 700, fontSize: "1.5em", color: "#FF4628" }}>
            {sidebarTitle}
          </div>
          {sidebarSubsection && (
            <div
              style={{
                fontSize: "0.8em",
                color: "#FF4628",
                marginTop: "0.5em",
              }}
            >
              {sidebarSubsection}
            </div>
          )}
          <hr
            style={{
              border: "none",
              borderTop: "1px solid #E5E5E5",
              width: "100%",
              margin: "1em 0",
            }}
          />
          <div style={{ flex: 1 }} />
          {pageNumber != null && (
            <div style={{ color: "#B9C8D7", fontSize: "0.85em" }}>
              Page {pageNumber}
            </div>
          )}
        </div>
        <div className="portal-sidebar-layout__content">{children}</div>
      </div>
    </>
  );
}
