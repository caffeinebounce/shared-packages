import {
  AlertCircle,
  AlertTriangle,
  Database,
  LoaderCircle,
  RefreshCcw,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type CanonicalDataState =
  | "loading"
  | "empty"
  | "stale"
  | "partial"
  | "error"
  | "unauthorized"
  | "misconfigured";

export interface DataStateMetadata {
  isLoading?: boolean;
  isFetching?: boolean;
  isStale?: boolean;
  isPartial?: boolean;
  hasData?: boolean;
  isMisconfigured?: boolean;
  isUnauthorized?: boolean;
  isEmpty?: boolean;
}

export interface ResolveDataStateInput<TData = unknown> {
  error?: unknown;
  data?: TData;
  metadata?: DataStateMetadata;
  hasData?: (data: TData | undefined) => boolean;
}

export interface DataStateCopy {
  title: string;
  description: string;
}

export interface ResolvedDataState {
  state: CanonicalDataState | null;
  retryable: boolean;
  copy?: DataStateCopy;
}

export const DATA_STATE_COPY: Record<CanonicalDataState, DataStateCopy> = {
  loading: {
    title: "Loading data",
    description: "Please wait while we prepare your finance data.",
  },
  empty: {
    title: "No data yet",
    description: "There’s no data for this selection yet.",
  },
  stale: {
    title: "Showing older data",
    description: "This view may be out of date. Refresh to see the latest values.",
  },
  partial: {
    title: "Some data is missing",
    description: "We loaded what we could, but part of this view is unavailable.",
  },
  error: {
    title: "Something went wrong",
    description: "We couldn’t load this data right now. Please try again.",
  },
  unauthorized: {
    title: "Access needed",
    description: "You don’t currently have permission to view this data.",
  },
  misconfigured: {
    title: "Setup required",
    description: "This view needs additional setup before data can be shown.",
  },
};

export function resolveDataState<TData = unknown>({
  error,
  data,
  metadata,
  hasData,
}: ResolveDataStateInput<TData>): ResolvedDataState {
  const normalizedError = error as
    | { status?: number; code?: string; message?: string }
    | undefined;

  const isUnauthorized =
    metadata?.isUnauthorized ||
    normalizedError?.status === 401 ||
    normalizedError?.status === 403 ||
    normalizedError?.code === "unauthorized";

  const isMisconfigured =
    metadata?.isMisconfigured ||
    normalizedError?.status === 501 ||
    normalizedError?.code === "misconfigured";

  const computedHasData = hasData
    ? hasData(data)
    : metadata?.hasData ??
      (Array.isArray(data)
        ? data.length > 0
        : data != null &&
          (typeof data !== "object" || Object.keys(data as object).length > 0));

  if (metadata?.isLoading || metadata?.isFetching) {
    return { state: "loading", retryable: false, copy: DATA_STATE_COPY.loading };
  }

  if (isUnauthorized) {
    return {
      state: "unauthorized",
      retryable: false,
      copy: DATA_STATE_COPY.unauthorized,
    };
  }

  if (isMisconfigured) {
    return {
      state: "misconfigured",
      retryable: false,
      copy: DATA_STATE_COPY.misconfigured,
    };
  }

  if (error) {
    return { state: "error", retryable: true, copy: DATA_STATE_COPY.error };
  }

  if (metadata?.isPartial) {
    return { state: "partial", retryable: true, copy: DATA_STATE_COPY.partial };
  }

  if (metadata?.isStale) {
    return { state: "stale", retryable: true, copy: DATA_STATE_COPY.stale };
  }

  if (metadata?.isEmpty || !computedHasData) {
    return { state: "empty", retryable: false, copy: DATA_STATE_COPY.empty };
  }

  return { state: null, retryable: false };
}

export function getDataStateIcon(state: CanonicalDataState): LucideIcon {
  switch (state) {
    case "loading":
      return LoaderCircle;
    case "empty":
      return Database;
    case "error":
    case "unauthorized":
    case "misconfigured":
      return AlertCircle;
    case "partial":
      return AlertTriangle;
    default:
      return RefreshCcw;
  }
}

export function getDataStateIconClassName(state: CanonicalDataState): string {
  switch (state) {
    case "loading":
      return "animate-spin";
    case "empty":
      return "animate-pulse";
    default:
      return "";
  }
}
