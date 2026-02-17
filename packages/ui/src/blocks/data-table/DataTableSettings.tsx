"use client";

import { Settings2 } from "lucide-react";
import * as React from "react";

import { Button } from "../../components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { cn } from "../../utils";

// ── Types ─────────────────────────────────────────────────────────────────────

/** A single configurable setting for the data table */
export interface DataTableSettingDef {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Setting type */
  type: "boolean";
  /** Default value */
  defaultValue: boolean;
}

export interface DataTableSettingsProps {
  /** Setting definitions */
  settings: DataTableSettingDef[];
  /** Current values (managed externally via useDataTableSettings) */
  values: Record<string, unknown>;
  /** Callback when a setting changes */
  onChange: (id: string, value: unknown) => void;
  /** Optional className */
  className?: string;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

const STORAGE_PREFIX = "dt-settings-";

/**
 * Hook that manages DataTable settings with localStorage persistence.
 *
 * @param tableId - Unique table identifier for storage key
 * @param settings - Array of setting definitions with defaults
 * @returns { values, onChange, getSetting } - Current values and change handler
 */
export function useDataTableSettings(
  tableId: string,
  settings: DataTableSettingDef[],
) {
  const [values, setValues] = React.useState<Record<string, unknown>>(() => {
    // Initialize from defaults
    const defaults: Record<string, unknown> = {};
    for (const s of settings) {
      defaults[s.id] = s.defaultValue;
    }

    // Overlay with persisted values
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(`${STORAGE_PREFIX}${tableId}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          return { ...defaults, ...parsed };
        }
      } catch {
        // Ignore parse errors
      }
    }

    return defaults;
  });

  const onChange = React.useCallback(
    (id: string, value: unknown) => {
      setValues((prev) => {
        const next = { ...prev, [id]: value };
        // Persist
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(
              `${STORAGE_PREFIX}${tableId}`,
              JSON.stringify(next),
            );
          } catch {
            // Ignore storage errors
          }
        }
        return next;
      });
    },
    [tableId],
  );

  const getSetting = React.useCallback(
    <T = unknown>(id: string): T => values[id] as T,
    [values],
  );

  return { values, onChange, getSetting };
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Settings button with popover for configurable DataTable settings.
 * Renders a gear icon that opens a popover with toggle switches.
 */
export function DataTableSettings({
  settings,
  values,
  onChange,
  className,
}: DataTableSettingsProps) {
  if (!settings.length) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("h-8 gap-1.5 text-xs", className)}
        >
          <Settings2 className="size-3.5" />
          <span className="sr-only sm:not-sr-only">Settings</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-2">
        <div className="space-y-1">
          <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
            Display Settings
          </p>
          {settings.map((setting) => {
            if (setting.type === "boolean") {
              const checked = values[setting.id] as boolean;
              return (
                <label
                  key={setting.id}
                  className="flex cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-xs hover:bg-accent"
                >
                  <span>{setting.label}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={checked}
                    onClick={() => onChange(setting.id, !checked)}
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                      checked ? "bg-primary" : "bg-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform",
                        checked ? "translate-x-4" : "translate-x-0",
                      )}
                    />
                  </button>
                </label>
              );
            }
            return null;
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
