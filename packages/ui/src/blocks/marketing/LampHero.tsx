"use client";

import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";

import { type LampColorTheme, LampContainer } from "../../components/ui/lamp";
import { TextGenerateEffect } from "../../components/ui/text-generate-effect";
import { cn } from "../../utils";

export interface LampHeroSocialLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface LampHeroProps {
  title?: string;
  subtitle?: ReactNode;
  socialLinks?: LampHeroSocialLink[];
  /** HTML heading level for the title – defaults to h1 */
  headingLevel?: "h1" | "h2" | "h3";
  className?: string;
  containerClassName?: string;
  contentClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  socialLinksClassName?: string;
  socialLinkClassName?: string;
  children?: ReactNode;
  socialAnimationDelay?: number;
  colorTheme?: LampColorTheme;
}

export function LampHero({
  title,
  subtitle,
  socialLinks = [],
  headingLevel = "h1",
  className,
  containerClassName,
  contentClassName,
  titleClassName,
  subtitleClassName,
  socialLinksClassName,
  children,
  socialAnimationDelay = 1,
  colorTheme,
  socialLinkClassName,
}: LampHeroProps) {
  return (
    <LampContainer className={containerClassName} colorTheme={colorTheme}>
      <section
        className={cn(
          "mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-6 text-center",
          className,
          contentClassName,
        )}
      >
        {title ? (
          <TextGenerateEffect
            words={title}
            as={headingLevel}
            className={cn(
              "mx-auto max-w-4xl text-5xl leading-tight sm:text-6xl md:text-7xl",
              titleClassName,
            )}
            staggerDelay={0.1}
          />
        ) : null}

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
            className={cn(
              "mt-12 flex items-center gap-4",
              socialLinksClassName,
            )}
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
                className={cn(
                  "group flex h-11 w-11 items-center justify-center rounded-full border border-zinc-300 bg-zinc-100 text-zinc-500 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:text-zinc-900 dark:border-white/20 dark:bg-white/5 dark:text-zinc-300 dark:hover:text-white",
                  "hover:border-indigo-500 hover:bg-indigo-100 dark:hover:border-indigo-300/80 dark:hover:bg-indigo-400/10",
                  socialLinkClassName,
                )}
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
