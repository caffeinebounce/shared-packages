import { Check } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "../../utils";

export type PricingMinimalTier = {
  id?: string;
  name: ReactNode;
  eyebrow?: ReactNode;
  price: ReactNode;
  priceDetail?: ReactNode;
  description?: ReactNode;
  features: ReactNode[];
  action?: ReactNode;
  featured?: boolean;
  note?: ReactNode;
  className?: string;
};

export interface PricingMinimalProps
  extends Omit<ComponentProps<"section">, "title"> {
  eyebrow?: ReactNode;
  heading?: ReactNode;
  description?: ReactNode;
  tiers: PricingMinimalTier[];
  gridClassName?: string;
  cardClassName?: string;
}

export function PricingMinimal({
  className,
  eyebrow,
  heading,
  description,
  tiers,
  gridClassName,
  cardClassName,
  ...props
}: PricingMinimalProps) {
  return (
    <section
      className={cn("py-16 sm:py-20 lg:py-24", className)}
      data-slot="pricing-minimal"
      {...props}
    >
      {eyebrow || heading || description ? (
        <div className="mx-auto mb-10 flex max-w-7xl flex-col gap-5 px-4 sm:px-6 lg:px-8">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              {eyebrow}
            </p>
          ) : null}
          {heading ? (
            <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
              {heading}
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
        <div
          className={cn(
            "grid grid-cols-1 gap-3 md:grid-cols-3 md:[grid-template-rows:auto_auto_1fr_auto_auto]",
            gridClassName,
          )}
          data-slot="pricing-minimal-grid"
        >
          {tiers.map((tier, index) => (
            <article
              className={cn(
                "relative flex min-h-full flex-col overflow-hidden rounded-box border border-border bg-card p-6 shadow-sm md:row-span-5 md:grid md:grid-rows-subgrid",
                tier.featured &&
                  "border-primary/50 bg-primary/[0.06] shadow-primary/10",
                cardClassName,
                tier.className,
              )}
              data-featured={tier.featured ? "true" : undefined}
              data-slot="pricing-minimal-card"
              key={tier.id ?? index}
            >
              <div className="flex flex-col gap-4">
                {tier.eyebrow ? (
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    {tier.eyebrow}
                  </p>
                ) : null}
                <div className="flex flex-col gap-3">
                  <h3 className="font-sans text-2xl font-semibold leading-tight tracking-normal text-foreground">
                    {tier.name}
                  </h3>
                  {tier.description ? (
                    <p className="text-sm leading-6 text-muted-foreground">
                      {tier.description}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-2 border-y border-border/70 py-5 md:mt-0">
                <p className="text-3xl font-semibold leading-none text-foreground">
                  {tier.price}
                </p>
                {tier.priceDetail ? (
                  <p className="text-sm leading-6 text-muted-foreground">
                    {tier.priceDetail}
                  </p>
                ) : null}
              </div>

              <ul className="mt-6 flex flex-col gap-3 md:mt-0">
                {tier.features.map((feature, featureIndex) => (
                  <li
                    className="flex gap-3 text-sm leading-6 text-muted-foreground"
                    key={featureIndex}
                  >
                    <Check
                      aria-hidden="true"
                      className="mt-1 size-4 shrink-0 text-primary"
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div
                className={cn(
                  "mt-6 border-t border-border/70 pt-4 md:mt-0",
                  !tier.note && "hidden md:block md:border-t-0 md:pt-0",
                )}
                data-slot="pricing-minimal-note"
              >
                {tier.note ? (
                  <p className="text-xs leading-5 text-muted-foreground">
                    {tier.note}
                  </p>
                ) : null}
              </div>

              {tier.action ? (
                <div
                  className="mt-auto flex justify-start px-1 pt-8 md:mt-0"
                  data-slot="pricing-minimal-action"
                >
                  {tier.action}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
