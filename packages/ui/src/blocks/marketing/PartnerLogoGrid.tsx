"use client";

import { cn } from "../../utils";
import { LogoGrid, type LogoGridItem } from "./LogoGrid";

export interface PartnerLogoGridGroup {
  title: string;
  items: LogoGridItem[];
}

export interface PartnerLogoGridProps {
  groups: PartnerLogoGridGroup[];
  className?: string;
}

export function PartnerLogoGrid({ groups, className }: PartnerLogoGridProps) {
  return (
    <div className={cn("space-y-8", className)} data-slot="partner-logo-grid">
      {groups.map((group) => (
        <section key={group.title} className="space-y-4">
          <h3 className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {group.title}
          </h3>
          <LogoGrid items={group.items} columns={4} className="gap-4" />
        </section>
      ))}
    </div>
  );
}
