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
      {items.map((item) => (
        <MediaCard key={item.url} item={item} className={cardClassName} />
      ))}
    </div>
  );
}
