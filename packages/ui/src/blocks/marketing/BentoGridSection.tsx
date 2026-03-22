import type { ReactNode } from "react";
import { Button } from "../../components/ui/button";
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
    label: string;
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
}

export function BentoGridSection({
  heading,
  subheading,
  items,
  tone = "muted",
  padding = "lg",
  className,
  containerClassName,
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
            <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              {heading}
            </h2>
            {subheading ? (
              <p className="mt-3 text-muted-foreground">{subheading}</p>
            ) : null}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 auto-rows-[minmax(11rem,auto)]">
          {items.map((item) => (
            <article
              key={item.id}
              className={cx(
                "overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 dark:bg-neutral-900 shadow-sm transition-colors flex flex-col",
                item.colSpan === 2 && "md:col-span-2",
                item.rowSpan === 2 && "md:row-span-2",
              )}
            >
              {item.illustration ? (
                <div
                  className={cx("w-full overflow-hidden", item.headerClassName)}
                  aria-hidden="true"
                >
                  {item.illustration}
                </div>
              ) : null}
              <div className="flex flex-1 flex-col p-5">
                {item.icon ? (
                  <div className="mb-3 text-neutral-300" aria-hidden="true">
                    {item.icon}
                  </div>
                ) : null}
                <h3 className="text-lg font-medium text-neutral-100">
                  {item.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-neutral-400">
                  {item.description}
                </p>
                {item.cta ? (
                  <div className="mt-4">
                    <Button asChild variant="outline" size="sm">
                      <a href={item.cta.href}>{item.cta.label}</a>
                    </Button>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
