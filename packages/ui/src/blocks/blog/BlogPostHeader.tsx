import Image from "next/image";
import { formatDate } from "@caffeinebounce/shared-utils";
import { Badge } from "../../components/ui/badge";

export interface BlogPostHeaderProps {
  title: string;
  date: string;
  author?: string;
  cover?: string;
  readingTime?: string;
  tags?: string[];
}

export function BlogPostHeader({
  title,
  date,
  author,
  cover,
  readingTime,
  tags,
}: BlogPostHeaderProps) {
  return (
    <header className="mb-12">
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-xs font-normal"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
        {title}
      </h1>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {author && (
          <>
            <span>{author}</span>
            <span>·</span>
          </>
        )}
        <time>
          {formatDate(date, {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </time>
        {readingTime && (
          <>
            <span>·</span>
            <span>{readingTime}</span>
          </>
        )}
      </div>

      {cover && (
        <div className="relative mt-8 aspect-[2/1] w-full overflow-hidden rounded-lg">
          <Image
            src={cover}
            alt={title}
            fill
            priority
            className="object-cover"
          />
        </div>
      )}
    </header>
  );
}
