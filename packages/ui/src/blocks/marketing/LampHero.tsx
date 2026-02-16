"use client";

import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { LampContainer } from "../../components/ui/lamp";
import { TextGenerateEffect } from "../../components/ui/text-generate-effect";
import { cn } from "../../utils";

export interface LampHeroSocialLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface LampHeroProps {
  title: string;
  subtitle?: ReactNode;
  socialLinks?: LampHeroSocialLink[];
  className?: string;
  containerClassName?: string;
  contentClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  socialLinksClassName?: string;
  children?: ReactNode;
  socialAnimationDelay?: number;
}

export function LampHero({
  title,
  subtitle,
  socialLinks = [],
  className,
  containerClassName,
  contentClassName,
  titleClassName,
  subtitleClassName,
  socialLinksClassName,
  children,
  socialAnimationDelay = 1,
}: LampHeroProps) {
  return (
    <LampContainer className={containerClassName}>
      <section
        className={cn(
          "mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-6 text-center",
          className,
          contentClassName,
        )}
      >
        <TextGenerateEffect
          words={title}
          className={cn(
            "mx-auto max-w-4xl text-5xl leading-tight sm:text-6xl md:text-7xl",
            titleClassName,
          )}
          staggerDelay={0.1}
        />

        {subtitle ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className={cn(
              "mt-6 max-w-2xl text-balance text-lg text-zinc-600 dark:text-zinc-300",
              subtitleClassName,
            )}
          >
            {subtitle}
          </motion.div>
        ) : null}

        {socialLinks.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: socialAnimationDelay }}
            className={cn("mt-12 flex items-center gap-4", socialLinksClassName)}
          >
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target={social.href.startsWith("mailto") ? undefined : "_blank"}
                rel={
                  social.href.startsWith("mailto")
                    ? undefined
                    : "noopener noreferrer"
                }
                className="group flex h-11 w-11 items-center justify-center rounded-full border border-zinc-300 bg-zinc-100 text-zinc-500 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-500 hover:bg-indigo-100 hover:text-zinc-900 dark:border-white/20 dark:bg-white/5 dark:text-zinc-300 dark:hover:border-indigo-300/80 dark:hover:bg-indigo-400/10 dark:hover:text-white"
                aria-label={social.label}
              >
                <social.icon className="h-5 w-5" />
              </a>
            ))}
          </motion.div>
        ) : null}

        {children}
      </section>
    </LampContainer>
  );
}
