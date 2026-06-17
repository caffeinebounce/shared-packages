"use client";

import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

export interface MetricStoryProps {
  metric: ReactNode;
  label: ReactNode;
  description?: ReactNode;
  sourceNote?: ReactNode;
  highlightQuote?: ReactNode;
}

export function MetricStory({
  metric,
  label,
  description,
  sourceNote,
  highlightQuote,
}: MetricStoryProps) {
  return (
    <Card className="border-border/60 bg-muted/20">
      <CardHeader className="gap-3">
        <div className="text-5xl font-semibold tracking-tight text-foreground">
          {metric}
        </div>
        <CardTitle className="text-xl leading-snug">{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {description ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
        {highlightQuote ? (
          <blockquote className="border-l-2 border-primary pl-4 text-sm italic text-foreground/90">
            {highlightQuote}
          </blockquote>
        ) : null}
        {sourceNote ? (
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
            {sourceNote}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
