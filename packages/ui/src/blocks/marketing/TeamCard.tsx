"use client";

import type { ReactNode } from "react";

import { Card, CardContent, CardHeader } from "../../components/ui/card";

export interface TeamCardLink {
  href: string;
  label: string;
}

export interface TeamCardProps {
  name: string;
  title: ReactNode;
  bio?: ReactNode;
  image?: string;
  links?: TeamCardLink[];
}

export function TeamCard({
  name,
  title,
  bio,
  image,
  links = [],
}: TeamCardProps) {
  return (
    <Card className="h-full border-border/60 bg-background">
      {image ? (
        <img
          src={image}
          alt={name}
          className="aspect-[4/3] w-full rounded-t-box object-cover"
        />
      ) : null}
      <CardHeader className="gap-2">
        <h3 className="text-2xl font-semibold leading-none text-foreground">
          {name}
        </h3>
        <p className="text-sm font-medium text-primary">{title}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {bio ? (
          <p className="text-sm leading-relaxed text-muted-foreground">{bio}</p>
        ) : null}
        {links.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {links.map((link) => (
              <a
                key={`${name}-${link.href}`}
                href={link.href}
                className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
              >
                {link.label}
              </a>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
