import type { ComponentProps, ReactNode } from "react";

import { cn } from "../../utils";

export type ConnectedCardsSectionItem = {
  id?: string;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  href?: string;
  className?: string;
};

export interface ConnectedCardsSectionProps
  extends Omit<ComponentProps<"section">, "title"> {
  eyebrow?: ReactNode;
  heading: ReactNode;
  description?: ReactNode;
  items: ConnectedCardsSectionItem[];
  action?: ReactNode;
  visualLabel?: string;
  contentClassName?: string;
  visualClassName?: string;
  cardClassName?: string;
}

const CARD_LAYOUTS: Record<number, readonly string[]> = {
  1: ["sm:left-[32%] sm:top-[30%]"],
  2: ["sm:left-[8%] sm:top-[30%]", "sm:right-[8%] sm:top-[30%]"],
  3: [
    "sm:left-[32%] sm:top-0",
    "sm:left-[8%] sm:bottom-0",
    "sm:right-[8%] sm:bottom-0",
  ],
  4: [
    "sm:left-[8%] sm:top-[8%]",
    "sm:right-[8%] sm:top-[8%]",
    "sm:left-[8%] sm:bottom-[8%]",
    "sm:right-[8%] sm:bottom-[8%]",
  ],
  5: [
    "sm:left-[32%] sm:top-0",
    "sm:left-0 sm:top-[28%]",
    "sm:right-0 sm:top-[28%]",
    "sm:left-[14%] sm:bottom-0",
    "sm:right-[14%] sm:bottom-0",
  ],
  6: [
    "sm:left-0 sm:top-[12%]",
    "sm:left-[32%] sm:top-0",
    "sm:right-0 sm:top-[12%]",
    "sm:left-0 sm:bottom-[6%]",
    "sm:left-[32%] sm:bottom-0",
    "sm:right-0 sm:bottom-[6%]",
  ],
  7: [
    "sm:left-[32%] sm:top-0",
    "sm:left-0 sm:top-[20%]",
    "sm:right-0 sm:top-[20%]",
    "sm:left-[32%] sm:top-[38%]",
    "sm:left-0 sm:bottom-[5%]",
    "sm:right-0 sm:bottom-[5%]",
    "sm:left-[32%] sm:bottom-0",
  ],
} as const;

function getCardPosition(index: number, count: number) {
  const layout =
    CARD_LAYOUTS[Math.min(Math.max(count, 1), 7)] ?? CARD_LAYOUTS[7];

  return layout[index % layout.length];
}

function getFallbackSymbol(title: ReactNode) {
  if (typeof title === "string" && title.trim()) {
    return title.trim().slice(0, 1).toUpperCase();
  }

  if (typeof title === "number") {
    return String(title).slice(0, 1);
  }

  return "•";
}

export function ConnectedCardsSection({
  className,
  eyebrow,
  heading,
  description,
  items,
  action,
  visualLabel = "Connected cards",
  contentClassName,
  visualClassName,
  cardClassName,
  ...props
}: ConnectedCardsSectionProps) {
  return (
    <section
      className={cn("py-16 sm:py-20 lg:py-24", className)}
      data-slot="connected-cards-section"
      {...props}
    >
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.46fr)_minmax(0,0.54fr)] lg:items-center lg:px-8">
        <ConnectedCardsVisual
          cardClassName={cardClassName}
          className={visualClassName}
          items={items}
          visualLabel={visualLabel}
        />

        <div
          className={cn(
            "flex max-w-3xl flex-col items-start",
            contentClassName,
          )}
          data-slot="connected-cards-content"
        >
          {eyebrow ? (
            <p className="inline-flex rounded-box border border-border bg-background px-4 py-2 text-sm leading-none text-foreground shadow-sm">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-8 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {heading}
          </h2>
          {description ? (
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              {description}
            </p>
          ) : null}
          {action ? (
            <div className="mt-8" data-slot="connected-cards-action">
              {action}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function ConnectedCardsVisual({
  className,
  items,
  visualLabel,
  cardClassName,
}: {
  className?: string;
  items: ConnectedCardsSectionItem[];
  visualLabel: string;
  cardClassName?: string;
}) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-xl py-2 sm:h-[36rem] sm:max-w-none sm:py-0",
        className,
      )}
      data-slot="connected-cards-visual"
      data-visual-label={visualLabel}
    >
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[72%] w-[84%] rounded-full bg-muted/55 shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--foreground)_8%,transparent)] sm:block"
        data-slot="connected-cards-oval"
        style={{ transform: "translate(-50%, -50%)" }}
      />
      <div className="grid gap-3 sm:block">
        {items.map((item, index) => (
          <ConnectedCardsVisualCard
            className={cn(getCardPosition(index, items.length), cardClassName)}
            item={item}
            key={item.id ?? index}
          />
        ))}
      </div>
    </div>
  );
}

function ConnectedCardsVisualCard({
  item,
  className,
}: {
  item: ConnectedCardsSectionItem;
  className?: string;
}) {
  const content = (
    <>
      <div
        className="grid size-14 place-items-center text-primary [&_svg]:size-9"
        data-slot="connected-cards-card-icon"
      >
        {item.icon ?? (
          <span className="text-2xl font-semibold">
            {getFallbackSymbol(item.title)}
          </span>
        )}
      </div>
      <div className="space-y-2">
        <h3 className="font-sans text-xl font-semibold leading-6 tracking-normal text-card-foreground">
          {item.title}
        </h3>
        {item.description ? (
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {item.description}
          </p>
        ) : null}
      </div>
    </>
  );

  const classes = cn(
    "relative z-10 flex min-h-32 flex-col items-center justify-center gap-4 rounded-box border border-border bg-card p-5 text-center text-card-foreground shadow-[8px_8px_0_0_rgba(0,0,0,0.92)] transition duration-200 hover:-translate-y-1 hover:border-primary/70 sm:absolute sm:h-48 sm:w-44 lg:w-48",
    item.href &&
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    item.className,
    className,
  );

  if (item.href) {
    return (
      <a className={classes} data-slot="connected-cards-card" href={item.href}>
        {content}
      </a>
    );
  }

  return (
    <div className={classes} data-slot="connected-cards-card">
      {content}
    </div>
  );
}
