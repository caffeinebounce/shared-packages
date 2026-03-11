import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export interface PostLink {
  slug: string;
  title: string;
}

export interface BlogPostFooterProps {
  prevPost?: PostLink;
  nextPost?: PostLink;
  basePath?: string;
}

export function BlogPostFooter({
  prevPost,
  nextPost,
  basePath = "/blog",
}: BlogPostFooterProps) {
  if (!prevPost && !nextPost) return null;

  return (
    <footer className="mt-16 pt-8 border-t border-border/50">
      <nav className="flex items-center justify-between gap-4">
        {prevPost ? (
          <Link
            href={`${basePath}/${prevPost.slug}`}
            className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            <div className="text-right">
              <div className="text-xs uppercase tracking-wide mb-0.5">
                Previous
              </div>
              <div className="font-medium text-foreground">
                {prevPost.title}
              </div>
            </div>
          </Link>
        ) : (
          <div />
        )}

        {nextPost ? (
          <Link
            href={`${basePath}/${nextPost.slug}`}
            className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors text-right"
          >
            <div>
              <div className="text-xs uppercase tracking-wide mb-0.5">Next</div>
              <div className="font-medium text-foreground">
                {nextPost.title}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : (
          <div />
        )}
      </nav>
    </footer>
  );
}
