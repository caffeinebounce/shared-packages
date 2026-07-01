"use client";

import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../../components/ui/card";

export interface ProgramCardProps {
  name: string;
  audience?: ReactNode;
  commitment?: ReactNode;
  description?: ReactNode;
  outcomes?: ReactNode[];
  badge?: ReactNode;
  cta?: {
    href: string;
    label: string;
  };
}

export function ProgramCard({
  name,
  audience,
  commitment,
  description,
  outcomes = [],
  badge,
  cta,
}: ProgramCardProps) {
  return (
    <Card className="h-full justify-between border-border/60 bg-background">
      <div>
        <CardHeader className="gap-3">
          {badge ? (
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
              {badge}
            </div>
          ) : null}
          <h3 className="text-2xl font-semibold leading-none text-foreground">
            {name}
          </h3>
          {audience ? (
            <p className="text-sm font-medium text-foreground/80">{audience}</p>
          ) : null}
          {commitment ? (
            <p className="text-sm text-muted-foreground">{commitment}</p>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4">
          {description ? (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
          {outcomes.length > 0 ? (
            <ul className="space-y-2">
              {outcomes.map((outcome, index) => (
                <li
                  key={`${name}-outcome-${index}`}
                  className="text-sm text-foreground"
                >
                  {outcome}
                </li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </div>
      {cta ? (
        <CardFooter>
          <Button asChild className="w-full justify-between">
            <a href={cta.href}>
              {cta.label}
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
}
