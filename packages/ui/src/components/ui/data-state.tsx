import type * as React from "react";
import { cn } from "../../utils";
import {
  type CanonicalDataState,
  DATA_STATE_COPY,
  getDataStateIcon,
  getDataStateIconClassName,
} from "../../utils/data-state";
import { Button } from "./button";

interface DataStateBaseProps {
  state: CanonicalDataState;
  title?: string;
  description?: string;
  className?: string;
  retryable?: boolean;
  onRetry?: () => void;
  retryLabel?: string;
  action?: React.ReactNode;
}

export function DataStateBanner({
  state,
  title,
  description,
  className,
  retryable,
  onRetry,
  retryLabel = "Try again",
  action,
}: DataStateBaseProps) {
  const Icon = getDataStateIcon(state);
  const copy = DATA_STATE_COPY[state];
  const iconClassName = getDataStateIconClassName(state);
  const showRetry = retryable && onRetry;

  return (
    <div
      className={cn(
        "rounded-box border bg-muted/20 px-4 py-3",
        state === "error" ||
          state === "unauthorized" ||
          state === "misconfigured"
          ? "border-destructive/30 bg-destructive/5"
          : "",
        className,
      )}
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <Icon
          className={cn("mt-0.5 h-5 w-5 text-muted-foreground", iconClassName)}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{title ?? copy.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {description ?? copy.description}
          </p>
          {(showRetry || action) && (
            <div className="mt-3 flex items-center gap-2">
              {showRetry ? (
                <Button size="sm" variant="outline" onClick={onRetry}>
                  {retryLabel}
                </Button>
              ) : null}
              {action}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function DataStateInline({
  state,
  title,
  description,
  className,
  retryable,
  onRetry,
  retryLabel = "Try again",
  action,
}: DataStateBaseProps) {
  const Icon = getDataStateIcon(state);
  const copy = DATA_STATE_COPY[state];
  const iconClassName = getDataStateIconClassName(state);
  const showRetry = retryable && onRetry;

  return (
    <div
      className={cn(
        "rounded-box border bg-muted/20 px-3 py-2",
        "flex items-center gap-2 text-sm",
        className,
      )}
      aria-live="polite"
    >
      <Icon className={cn("h-4 w-4 text-muted-foreground", iconClassName)} />
      <div className="min-w-0 flex-1">
        <span className="font-medium">{title ?? copy.title}</span>
        <span className="ml-2 text-muted-foreground">
          {description ?? copy.description}
        </span>
      </div>
      {showRetry ? (
        <Button size="sm" variant="ghost" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
      {action}
    </div>
  );
}
