import Image from "next/image";
import { Card, CardContent } from "../../components/ui/card";

export interface AuthorLink {
  label: string;
  url: string;
}

export interface BlogAuthorCardProps {
  name: string;
  avatar?: string;
  bio?: string;
  links?: AuthorLink[];
}

export function BlogAuthorCard({
  name,
  avatar,
  bio,
  links,
}: BlogAuthorCardProps) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="flex items-start gap-4 p-6">
        {avatar ? (
          <Image
            src={avatar}
            alt={name}
            width={56}
            height={56}
            className="rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-lg font-semibold text-primary shrink-0">
            {name.charAt(0)}
          </div>
        )}

        <div className="min-w-0">
          <div className="font-semibold text-sm">{name}</div>
          {bio && <p className="text-sm text-muted-foreground mt-1">{bio}</p>}
          {links && links.length > 0 && (
            <div className="flex gap-3 mt-2">
              {links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
