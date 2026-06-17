"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { cn } from "../../utils";

export interface FaqAccordionItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqAccordionProps {
  items: FaqAccordionItem[];
  className?: string;
}

export function FaqAccordion({ items, className }: FaqAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className={cn("space-y-3", className)} data-slot="faq-accordion">
      {items.map((item) => {
        const open = item.id === openId;

        return (
          <div
            key={item.id}
            className="rounded-box border border-border/60 bg-background"
          >
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={open}
              onClick={() => setOpenId(open ? null : item.id)}
            >
              <span className="font-medium text-foreground">
                {item.question}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                  open && "rotate-180",
                )}
              />
            </button>
            {open ? (
              <div className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
