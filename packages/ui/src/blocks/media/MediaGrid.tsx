import { cn } from "../../utils";
import { MediaCard, type MediaItem } from "./MediaCard";

export interface MediaGridProps {
  items: MediaItem[];
  className?: string;
  cardClassName?: string;
}

export function MediaGrid({ items, className, cardClassName }: MediaGridProps) {
  return (
    <div className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {items.map((item, i) => {
        const spanClass =
          item.span === 2
            ? "sm:col-span-2"
            : item.span === 3
              ? "sm:col-span-2 lg:col-span-3"
              : undefined;
        return (
          <MediaCard
            key={item.url || `item-${i}`}
            item={item}
            className={cn(spanClass, cardClassName)}
          />
        );
      })}
    </div>
  );
}
