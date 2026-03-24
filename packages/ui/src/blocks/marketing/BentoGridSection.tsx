import type { ReactNode } from "react";
import { Button } from "../../components/ui/button";
import { CardSpotlight } from "../../components/ui/card-spotlight";
import {
  cx,
  type MarketingSectionPadding,
  type MarketingSectionTone,
  sectionPaddingClasses,
  sectionToneClasses,
} from "./aceternity/shared";

export interface BentoGridItem {
  id: string;
  title: ReactNode;
  description: ReactNode;
  icon?: ReactNode;
  illustration?: ReactNode;
  headerClassName?: string;
  cta?: {
    href: string;
    label: ReactNode;
  };
  colSpan?: 1 | 2;
  rowSpan?: 1 | 2;
}

export interface BentoGridSectionProps {
  heading?: ReactNode;
  subheading?: ReactNode;
  items: BentoGridItem[];
  tone?: MarketingSectionTone;
  padding?: MarketingSectionPadding;
  className?: string;
  containerClassName?: string;
  spotlight?: boolean;
}

export function BentoGridSection({
  heading,
  subheading,
  items,
  tone = "muted",
  padding = "lg",
  className,
  containerClassName,
  spotlight = false,
}: BentoGridSectionProps) {
  return (
    <section
      className={cx(
        sectionToneClasses[tone],
        sectionPaddingClasses[padding],
        className,
      )}
      data-slot="bento-grid-section"
    >
      <div className={cx("mx-auto max-w-6xl px-6", containerClassName)}>
        {heading ? (
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2
              className="text-3xl font-semibold tracking-tight md:text-4xl"
              style={{
                color: "var(--color-foreground, hsl(var(--foreground)))",
              }}
            >
              {heading}
            </h2>
            {subheading ? (
              <p
                className="mt-3"
                style={{
                  color: "var(--color-foreground, hsl(var(--foreground)))",
                }}
              >
                {subheading}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 auto-rows-[minmax(11rem,auto)]">
          {items.map((item) =>
            spotlight ? (
              <CardSpotlight
                key={item.id}
                className={cx(
                  "rounded-xl p-0 flex flex-col",
                  item.colSpan === 2 && "md:col-span-2",
                  item.rowSpan === 2 && "md:row-span-2",
                )}
              >
                <div className="relative z-20 flex flex-col flex-1">
                  {item.illustration ? (
                    <div
                      className={cx(
                        "w-full overflow-hidden",
                        item.headerClassName,
                      )}
                      aria-hidden="true"
                    >
                      {item.illustration}
                    </div>
                  ) : null}
                  <div className="flex flex-1 flex-col p-5">
                    {item.icon ? (
                      <div
                        className="mb-3"
                        style={{
                          color:
                            "var(--color-foreground, hsl(var(--foreground)))",
                        }}
                        aria-hidden="true"
                      >
                        {item.icon}
                      </div>
                    ) : null}
                    <h3
                      className="text-lg font-medium"
                      style={{
                        color:
                          "var(--color-foreground, hsl(var(--foreground)))",
                      }}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="mt-2 flex-1 text-sm leading-6"
                      style={{
                        color:
                          "var(--color-foreground, hsl(var(--foreground)))",
                        opacity: 0.75,
                      }}
                    >
                      {item.description}
                    </p>
                    {item.cta ? (
                      <div className="mt-4">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          
                        >
                          <a href={item.cta.href}>{item.cta.label}</a>
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </CardSpotlight>
            ) : (
              <article
                key={item.id}
                className={cx(
                  "overflow-hidden rounded-xl shadow-sm transition-colors flex flex-col",
                  item.colSpan === 2 && "md:col-span-2",
                  item.rowSpan === 2 && "md:row-span-2",
                )}
                style={{
                  backgroundColor: "var(--color-card, hsl(var(--card)))",
                  borderWidth: "1px",
                  borderStyle: "solid",
                  borderColor: "var(--color-border, hsl(var(--border)))",
                }}
              >
                {item.illustration ? (
                  <div
                    className={cx(
                      "w-full overflow-hidden",
                      item.headerClassName,
                    )}
                    aria-hidden="true"
                  >
                    {item.illustration}
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col p-5">
                  {item.icon ? (
                    <div
                      className="mb-3"
                      style={{
                        color:
                          "var(--color-foreground, hsl(var(--foreground)))",
                      }}
                      aria-hidden="true"
                    >
                      {item.icon}
                    </div>
                  ) : null}
                  <h3
                    className="text-lg font-medium"
                    style={{
                      color: "var(--color-foreground, hsl(var(--foreground)))",
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="mt-2 flex-1 text-sm leading-6"
                    style={{
                      color: "var(--color-foreground, hsl(var(--foreground)))",
                      opacity: 0.75,
                    }}
                  >
                    {item.description}
                  </p>
                  {item.cta ? (
                    <div className="mt-4">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        
                      >
                        <a href={item.cta.href}>{item.cta.label}</a>
                      </Button>
                    </div>
                  ) : null}
                </div>
              </article>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
