"use client";

import { ExternalLink } from "lucide-react";
import Image from "next/image";
import { cn } from "../../utils";

export interface MediaItem {
  title: string;
  publication: string;
  date: string; // ISO date string
  url: string; // archived URL (preferred)
  originalUrl?: string;
  excerpt?: string;
  imageUrl?: string; // publication logo
  highlight?: string; // specific mention/quote to highlight
}

export interface MediaCardProps {
  item: MediaItem;
  className?: string;
}

export function MediaCard({ item, className }: MediaCardProps) {
  const formattedDate = new Date(item.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group relative flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white/50 p-6 backdrop-blur transition-all duration-300",
        "hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg",
        "dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20 dark:hover:shadow-2xl dark:hover:shadow-indigo-500/5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {item.imageUrl ? (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg">
              <Image
                src={item.imageUrl}
                alt={item.publication}
                width={32}
                height={32}
                className="object-contain dark:brightness-150 dark:contrast-125"
              />
            </div>
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-zinc-500 dark:text-zinc-300">
              {item.publication.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-300">
              {item.publication}
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-400">
              {formattedDate}
            </p>
          </div>
        </div>
        <ExternalLink className="h-4 w-4 shrink-0 text-zinc-300 transition-colors group-hover:text-zinc-500 dark:text-zinc-600 dark:group-hover:text-zinc-300" />
      </div>

      <h3 className="text-lg font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
        {item.title}
      </h3>

      {item.excerpt ? (
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
          {item.excerpt}
        </p>
      ) : null}

      {item.highlight ? (
        <blockquote className="border-l-2 border-indigo-400/50 pl-3 text-sm italic text-zinc-500 dark:border-indigo-400/40 dark:text-zinc-300">
          {item.highlight}
        </blockquote>
      ) : null}
    </a>
  );
}
