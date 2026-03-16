"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

import { cn } from "../../utils";

export interface BlurLogoCloudItem {
  name: string;
  logo?: ReactNode;
}

export interface BlurLogoCloudProps {
  items: BlurLogoCloudItem[];
  columns?: 2 | 3 | 4 | 5 | 6;
  className?: string;
  itemClassName?: string;
}

const columnClassMap: Record<
  NonNullable<BlurLogoCloudProps["columns"]>,
  string
> = {
  2: "grid-cols-2",
  3: "grid-cols-2 md:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-4",
  5: "grid-cols-2 md:grid-cols-5",
  6: "grid-cols-2 md:grid-cols-6",
};

export function BlurLogoCloud({
  items,
  columns = 4,
  className,
  itemClassName,
}: BlurLogoCloudProps) {
  return (
    <div
      className={cn("grid gap-4", columnClassMap[columns], className)}
      data-slot="blur-logo-cloud"
    >
      {items.map((item, index) => (
        <motion.div
          key={`${item.name}-${index}`}
          className={cn(
            "flex min-h-24 items-center justify-center rounded-box border border-white/8 bg-white/[0.02] px-5 py-4 backdrop-blur-sm",
            itemClassName,
          )}
          data-slot="blur-logo-cloud-item"
          initial={{
            filter: "blur(10px)",
            opacity: 0,
            y: -10,
          }}
          transition={{
            delay: index * 0.08,
            duration: 0.45,
            ease: [0.16, 1, 0.3, 1],
          }}
          viewport={{ amount: 0.35, once: true }}
          whileInView={{
            filter: "blur(0px)",
            opacity: 1,
            y: 0,
          }}
        >
          {item.logo ? (
            item.logo
          ) : (
            <span className="text-sm font-medium text-white/80">
              {item.name}
            </span>
          )}
        </motion.div>
      ))}
    </div>
  );
}
