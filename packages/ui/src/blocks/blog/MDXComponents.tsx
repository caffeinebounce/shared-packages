import { AlertTriangleIcon, InfoIcon, LightbulbIcon } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";

/* ── Callout ── */

const calloutConfig = {
  tip: {
    icon: LightbulbIcon,
    className:
      "border-emerald-500/30 bg-emerald-500/5 [&>svg]:text-emerald-500",
  },
  warning: {
    icon: AlertTriangleIcon,
    className: "border-amber-500/30 bg-amber-500/5 [&>svg]:text-amber-500",
  },
  note: {
    icon: InfoIcon,
    className: "border-blue-500/30 bg-blue-500/5 [&>svg]:text-blue-500",
  },
} as const;

export interface CalloutProps {
  type?: keyof typeof calloutConfig;
  title?: string;
  children: ReactNode;
}

export function Callout({ type = "note", title, children }: CalloutProps) {
  const config = calloutConfig[type];
  const Icon = config.icon;

  return (
    <Alert className={`my-6 ${config.className}`}>
      <Icon className="h-4 w-4" />
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}

/* ── Enhanced blockquote ── */

function Blockquote(props: ComponentPropsWithoutRef<"blockquote">) {
  return (
    <blockquote
      className="border-l-2 border-primary/30 pl-6 my-6 text-muted-foreground italic"
      {...props}
    />
  );
}

/* ── Responsive image with caption ── */

function MdxImage(
  props: ComponentPropsWithoutRef<"img"> & { caption?: string },
) {
  const { caption, alt, ...rest } = props;
  return (
    <figure className="my-8">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={alt ?? ""}
        className="rounded-lg w-full"
        loading="lazy"
        {...rest}
      />
      {(caption ?? alt) && (
        <figcaption className="mt-2 text-center text-xs text-muted-foreground">
          {caption ?? alt}
        </figcaption>
      )}
    </figure>
  );
}

/* ── Headings with anchor IDs ── */

function createHeading(level: 1 | 2 | 3 | 4 | 5 | 6) {
  const Tag = `h${level}` as const;
  return function Heading(props: ComponentPropsWithoutRef<typeof Tag>) {
    return <Tag {...props} />;
  };
}

/* ── Export map ── */

export const mdxComponents = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  blockquote: Blockquote,
  img: MdxImage,
  Callout,
};
