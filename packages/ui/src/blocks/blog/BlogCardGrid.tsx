"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../../components/ui/card";

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
  cover?: string;
  author?: string;
  tags?: string[];
  readingTime?: string;
}

export interface BlogCardGridProps {
  posts: BlogPost[];
  basePath?: string;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function BlogCardGrid({ posts, basePath = "/blog" }: BlogCardGridProps) {
  if (posts.length === 0) {
    return (
      <p className="text-muted-foreground">No posts yet. Check back soon.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {posts.map((post) => (
        <Link
          key={post.slug}
          href={`${basePath}/${post.slug}`}
          className="group block"
        >
          <Card className="h-full overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-primary/5 group-hover:border-border">
            {/* Cover image or gradient fallback */}
            <div className="relative h-48 w-full overflow-hidden">
              {post.cover ? (
                <Image
                  src={post.cover}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
              )}
            </div>

            <CardHeader className="pb-2">
              <h3 className="text-lg font-semibold tracking-tight leading-snug group-hover:text-primary transition-colors">
                {post.title}
              </h3>
            </CardHeader>

            <CardContent className="pb-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <time>{formatDate(post.date)}</time>
                {post.readingTime && (
                  <>
                    <span>·</span>
                    <span>{post.readingTime}</span>
                  </>
                )}
              </div>
              {post.excerpt && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {post.excerpt}
                </p>
              )}
            </CardContent>

            {post.tags && post.tags.length > 0 && (
              <CardFooter className="pt-0">
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs font-normal"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardFooter>
            )}
          </Card>
        </Link>
      ))}
    </div>
  );
}
