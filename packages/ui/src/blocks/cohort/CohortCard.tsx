"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn } from "../../utils/cn";

const cohortCardVariants = cva(
  "group relative w-full cursor-pointer overflow-hidden rounded-xl shadow-lg border transition-all duration-500",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700/50 hover:border-slate-600 hover:shadow-xl hover:shadow-slate-900/20",
        accent:
          "bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 border-indigo-500/30 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-900/20",
        success:
          "bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-900 border-emerald-500/30 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-900/20",
        warning:
          "bg-gradient-to-br from-amber-950 via-slate-900 to-slate-900 border-amber-500/30 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-900/20",
      },
      size: {
        default: "h-64",
        sm: "h-48",
        lg: "h-80",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type CohortEligibility =
  | "eligible"
  | "not-eligible"
  | "pending"
  | "applied";

export interface CohortCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cohortCardVariants> {
  /** Name of the cohort */
  name: string;
  /** Type/category of the cohort */
  type: string;
  /** Optional tagline (short summary, max 150 chars) */
  tagline?: string;
  /** Eligibility status */
  eligibility?: CohortEligibility;
  /** Optional background image URL */
  backgroundImage?: string;
  /** Optional background gradient overlay */
  showGradientOverlay?: boolean;
  /** Application deadline */
  deadline?: string;
  /** Number of spots available */
  spotsAvailable?: number;
}

const eligibilityConfig: Record<
  CohortEligibility,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  eligible: {
    label: "Eligible",
    icon: CheckCircle2,
    className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  "not-eligible": {
    label: "Not Eligible",
    icon: XCircle,
    className: "bg-red-500/20 text-red-400 border-red-500/30",
  },
  pending: {
    label: "Review Pending",
    icon: Clock,
    className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  applied: {
    label: "Applied",
    icon: CheckCircle2,
    className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
};

/**
 * CohortCard - Aesthetic card component for displaying cohort information
 *
 * Features:
 * - Gradient backgrounds with hover effects
 * - Optional background images
 * - Eligibility status badge
 * - Cohort type badge
 * - Deadline and spots available info
 *
 * @example
 * ```tsx
 * <CohortCard
 *   name="Accelerator Cohort 2024"
 *   type="Accelerator"
 *   eligibility="eligible"
 *   tagline="Join our flagship accelerator program"
 *   deadline="March 15, 2024"
 *   spotsAvailable={20}
 * />
 * ```
 */
export function CohortCard({
  name,
  type,
  tagline,
  eligibility = "pending",
  backgroundImage,
  showGradientOverlay = true,
  deadline,
  spotsAvailable,
  variant,
  size,
  className,
  ...props
}: CohortCardProps) {
  const eligibilityInfo = eligibilityConfig[eligibility];
  const EligibilityIcon = eligibilityInfo.icon;

  return (
    <div
      className={cn(cohortCardVariants({ variant, size }), className)}
      {...props}
    >
      {/* Background image layer */}
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}

      {/* Gradient overlay */}
      {showGradientOverlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
      )}

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/5 to-transparent rounded-tr-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-between p-5">
        {/* Top section - badges */}
        <div className="flex items-start justify-between gap-2">
          {/* Cohort type badge */}
          <span className="inline-flex items-center rounded-full bg-white/10 backdrop-blur-sm px-3 py-1 text-xs font-medium text-white/90 border border-white/10">
            {type}
          </span>

          {/* Eligibility badge */}
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border backdrop-blur-sm",
              eligibilityInfo.className,
            )}
          >
            <EligibilityIcon className="size-3.5" />
            {eligibilityInfo.label}
          </span>
        </div>

        {/* Bottom section - info */}
        <div className="space-y-3">
          {/* Metadata row */}
          {(deadline || spotsAvailable !== undefined) && (
            <div className="flex items-center gap-4 text-xs text-white/60">
              {deadline && (
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5" />
                  {deadline}
                </span>
              )}
              {spotsAvailable !== undefined && (
                <span>{spotsAvailable} spots available</span>
              )}
            </div>
          )}

          {/* Title */}
          <h3 className="text-xl font-bold text-white group-hover:text-white/90 transition-colors line-clamp-2">
            {name}
          </h3>

          {/* Tagline */}
          {tagline && (
            <p className="text-sm text-white/70 line-clamp-2 group-hover:text-white/80 transition-colors">
              {tagline}
            </p>
          )}
        </div>
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>
    </div>
  );
}
