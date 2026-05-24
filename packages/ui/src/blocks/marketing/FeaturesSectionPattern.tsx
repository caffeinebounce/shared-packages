import { type ComponentProps, type ReactNode, useId } from "react";

import { cn } from "../../utils";

export type FeaturesSectionPatternItem = {
  id?: string;
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  pattern?: number[][];
  className?: string;
  contentClassName?: string;
};

export interface FeaturesSectionPatternProps
  extends Omit<ComponentProps<"section">, "title"> {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  items: FeaturesSectionPatternItem[];
  gridClassName?: string;
  cardClassName?: string;
  patternSize?: number;
}

export interface FeaturePatternGridProps extends ComponentProps<"div"> {
  items: FeaturesSectionPatternItem[];
  cardClassName?: string;
  patternSize?: number;
}

function createPattern(index: number): number[][] {
  const row = index % 3;
  const offset = Math.floor(index / 3) % 3;

  return [
    [7 + row, 1 + offset],
    [9 + offset, 2 + row],
    [8 + row, 4 + offset],
    [11 + offset, 5 + row],
  ];
}

export function FeaturesSectionPattern({
  className,
  eyebrow,
  title,
  description,
  items,
  gridClassName,
  cardClassName,
  patternSize,
  ...props
}: FeaturesSectionPatternProps) {
  return (
    <section
      className={cn("py-16 sm:py-20 lg:py-24", className)}
      data-slot="features-section-pattern"
      {...props}
    >
      {eyebrow || title || description ? (
        <div className="mx-auto mb-10 flex max-w-7xl flex-col gap-5 px-4 sm:px-6 lg:px-8">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      ) : null}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FeaturePatternGrid
          cardClassName={cardClassName}
          className={gridClassName}
          items={items}
          patternSize={patternSize}
        />
      </div>
    </section>
  );
}

export function FeaturePatternGrid({
  className,
  items,
  cardClassName,
  patternSize,
  ...props
}: FeaturePatternGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
      data-slot="feature-pattern-grid"
      {...props}
    >
      {items.map((item, index) => (
        <FeaturePatternCard
          className={cn(cardClassName, item.className)}
          description={item.description}
          eyebrow={item.eyebrow}
          key={item.id ?? index}
          pattern={item.pattern ?? createPattern(index)}
          patternSize={patternSize}
          title={item.title}
          contentClassName={item.contentClassName}
        />
      ))}
    </div>
  );
}

export interface FeaturePatternCardProps
  extends Omit<ComponentProps<"div">, "title"> {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  pattern?: number[][];
  patternSize?: number;
  contentClassName?: string;
}

export function FeaturePatternCard({
  className,
  title,
  description,
  eyebrow,
  pattern,
  patternSize = 20,
  contentClassName,
  ...props
}: FeaturePatternCardProps) {
  return (
    <div
      className={cn(
        "relative min-h-44 overflow-hidden rounded-box border border-border bg-gradient-to-b from-muted/55 to-background p-6",
        className,
      )}
      data-slot="feature-pattern-card"
      {...props}
    >
      <FeaturePatternBackground pattern={pattern} size={patternSize} />
      <div
        className={cn("relative z-10 flex h-full flex-col", contentClassName)}
        data-slot="feature-pattern-card-content"
      >
        {eyebrow ? (
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h3 className="text-base font-semibold leading-6 text-foreground">
          {title}
        </h3>
        {description ? (
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function FeaturePatternBackground({
  pattern,
  size = 20,
}: {
  pattern?: number[][];
  size?: number;
}) {
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-0 -ml-20 -mt-2 h-full w-full [mask-image:linear-gradient(white,transparent)]"
      data-slot="feature-pattern-background"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-muted/30 to-muted/10 opacity-100 [mask-image:radial-gradient(farthest-side_at_top,white,transparent)]">
        <GridPattern
          className="absolute inset-0 h-full w-full fill-foreground/[0.04] stroke-foreground/[0.08] mix-blend-overlay"
          height={size}
          squares={pattern}
          width={size}
          x="-12"
          y="4"
        />
      </div>
    </div>
  );
}

export interface GridPatternProps extends ComponentProps<"svg"> {
  width: number;
  height: number;
  x: string;
  y: string;
  squares?: number[][];
}

export function GridPattern({
  width,
  height,
  x,
  y,
  squares,
  ...props
}: GridPatternProps) {
  const patternId = useId();

  return (
    <svg aria-hidden="true" {...props}>
      <defs>
        <pattern
          height={height}
          id={patternId}
          patternUnits="userSpaceOnUse"
          width={width}
          x={x}
          y={y}
        >
          <path d={`M.5 ${height}V.5H${width}`} fill="none" />
        </pattern>
      </defs>
      <rect
        fill={`url(#${patternId})`}
        height="100%"
        strokeWidth={0}
        width="100%"
      />
      {squares ? (
        <svg aria-hidden="true" className="overflow-visible" x={x} y={y}>
          {squares.map(([squareX, squareY]) => (
            <rect
              height={height + 1}
              key={`${squareX}-${squareY}`}
              strokeWidth="0"
              width={width + 1}
              x={squareX * width}
              y={squareY * height}
            />
          ))}
        </svg>
      ) : null}
    </svg>
  );
}
