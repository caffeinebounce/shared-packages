"use client";

import { Minus, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useEffect, useId, useMemo, useState } from "react";
import { cx } from "./aceternity/shared";
import { useMotionEnabled } from "./aceternity/useMotionEnabled";

export type FrequentlyAskedQuestionsAccordionItem = {
  question: ReactNode;
  answer: ReactNode;
};

export interface FrequentlyAskedQuestionsAccordionProps {
  heading: ReactNode;
  items: readonly FrequentlyAskedQuestionsAccordionItem[];
  eyebrow?: ReactNode;
  description?: ReactNode;
  defaultOpenIndex?: number;
  className?: string;
  itemClassName?: string;
}

function getInitialOpenIndex(itemCount: number, defaultOpenIndex?: number) {
  if (itemCount === 0) {
    return null;
  }

  if (
    typeof defaultOpenIndex === "number" &&
    Number.isInteger(defaultOpenIndex) &&
    defaultOpenIndex >= 0 &&
    defaultOpenIndex < itemCount
  ) {
    return defaultOpenIndex;
  }

  return 0;
}

export function FrequentlyAskedQuestionsAccordion({
  heading,
  items,
  eyebrow,
  description,
  defaultOpenIndex,
  className,
  itemClassName,
}: FrequentlyAskedQuestionsAccordionProps) {
  const baseId = useId().replace(/:/g, "");
  const motionEnabled = useMotionEnabled();
  const initialOpenIndex = useMemo(
    () => getInitialOpenIndex(items.length, defaultOpenIndex),
    [defaultOpenIndex, items.length],
  );
  const [openIndex, setOpenIndex] = useState<number | null>(initialOpenIndex);

  useEffect(() => {
    setOpenIndex((currentOpenIndex) => {
      if (
        currentOpenIndex !== null &&
        currentOpenIndex >= 0 &&
        currentOpenIndex < items.length
      ) {
        return currentOpenIndex;
      }

      return initialOpenIndex;
    });
  }, [initialOpenIndex, items.length]);

  return (
    <section
      className={cx(
        "grid gap-10 md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] md:gap-14 lg:gap-20",
        className,
      )}
      data-slot="frequently-asked-questions-accordion"
    >
      <div className="max-w-xl">
        {eyebrow ? (
          <p
            className="text-xs font-semibold uppercase tracking-[0.22em] text-primary"
            data-slot="faq-accordion-eyebrow"
          >
            {eyebrow}
          </p>
        ) : null}
        <h2
          className="font-display mt-6 text-4xl font-light leading-tight text-foreground sm:text-5xl"
          data-slot="faq-accordion-heading"
        >
          {heading}
        </h2>
        {description ? (
          <p
            className="mt-5 text-base leading-7 text-muted-foreground"
            data-slot="faq-accordion-description"
          >
            {description}
          </p>
        ) : null}
      </div>

      <div
        className="border-t border-border/70"
        data-slot="faq-accordion-items"
      >
        {items.map((item, index) => {
          const isOpen = openIndex === index;
          const triggerId = `${baseId}-faq-trigger-${index}`;
          const contentId = `${baseId}-faq-content-${index}`;

          return (
            <div
              className={cx(
                "border-b border-border/70 transition-colors",
                isOpen && "bg-foreground/[0.025]",
                itemClassName,
              )}
              data-open={isOpen || undefined}
              data-slot="faq-accordion-item"
              key={index}
            >
              <button
                aria-controls={contentId}
                aria-expanded={isOpen}
                className="group flex w-full items-center justify-between gap-6 px-0 py-6 text-left text-foreground outline-none transition-colors hover:text-primary focus-visible:text-primary"
                data-slot="faq-accordion-trigger"
                id={triggerId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                type="button"
              >
                <span className="text-base font-semibold leading-7 sm:text-lg">
                  {item.question}
                </span>
                <span
                  aria-hidden="true"
                  className="relative grid size-6 shrink-0 place-items-center text-primary"
                  data-slot="faq-accordion-icon"
                >
                  <Plus
                    className={cx(
                      "absolute size-4 transition-all duration-200",
                      isOpen
                        ? "rotate-90 scale-0 opacity-0"
                        : "rotate-0 scale-100 opacity-100",
                    )}
                  />
                  <Minus
                    className={cx(
                      "absolute size-4 transition-all duration-200",
                      isOpen
                        ? "rotate-0 scale-100 opacity-100"
                        : "-rotate-90 scale-0 opacity-0",
                    )}
                  />
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    animate={
                      motionEnabled
                        ? { height: "auto", opacity: 1 }
                        : { opacity: 1 }
                    }
                    aria-labelledby={triggerId}
                    className="overflow-hidden"
                    data-slot="faq-accordion-content"
                    exit={
                      motionEnabled ? { height: 0, opacity: 0 } : { opacity: 0 }
                    }
                    id={contentId}
                    initial={
                      motionEnabled ? { height: 0, opacity: 0 } : { opacity: 1 }
                    }
                    role="region"
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <div className="pb-6 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                      {item.answer}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
