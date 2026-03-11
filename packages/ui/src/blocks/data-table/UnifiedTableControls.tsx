"use client";

import { SlidersHorizontal } from "lucide-react";
import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../../components/ui/sheet";
import { Switch } from "../../components/ui/switch";
import { cn } from "../../utils";
import { DataTableSettings } from "./DataTableSettings";
import {
  normalizeUnifiedTableControls,
  type UnifiedTableControl,
} from "./UnifiedTableControls.schema";

export interface UnifiedTableControlsProps extends React.ComponentProps<"div"> {
  controls: UnifiedTableControl[];
  mobileLabel?: string;
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = React.useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < breakpoint;
  });

  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);

  return isMobile;
}

export function UnifiedTableControls({
  controls,
  mobileLabel = "Filters & Settings",
  className,
  ...props
}: UnifiedTableControlsProps) {
  const normalized = React.useMemo(
    () => normalizeUnifiedTableControls(controls),
    [controls],
  );
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  if (!normalized.length) return null;

  if (!isMobile) {
    return (
      <div
        role="toolbar"
        aria-orientation="horizontal"
        className={cn("flex w-full items-center gap-2", className)}
        {...props}
      >
        {(() => {
          const rightKinds = new Set([
            "search",
            "export",
            "settings",
            "columns",
          ]);
          const leftControls = normalized.filter(
            (c) => !rightKinds.has(c.kind),
          );
          const rightControls = normalized.filter((c) =>
            rightKinds.has(c.kind),
          );

          return (
            <>
              <div className="flex items-center gap-2 flex-nowrap [&>*]:shrink-0">
                {leftControls.map((control, index) => (
                  <div key={control.id ?? `${control.kind}-${index}`}>
                    {"desktop" in control ? control.desktop : null}
                  </div>
                ))}
              </div>

              {rightControls.length > 0 ? (
                <div className="ml-auto flex items-center gap-2 flex-nowrap [&>*]:shrink-0">
                  {rightControls.map((control, index) => {
                    if (control.kind === "settings") {
                      return (
                        <DataTableSettings
                          key={control.id ?? `settings-${index}`}
                          settings={control.items.map((item) => ({
                            id: item.id,
                            label: item.label,
                            type: "boolean" as const,
                            defaultValue: item.defaultValue,
                          }))}
                          values={control.values}
                          onChange={control.onChange}
                        />
                      );
                    }

                    return (
                      <div key={control.id ?? `${control.kind}-${index}`}>
                        {"desktop" in control ? control.desktop : null}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </>
          );
        })()}
      </div>
    );
  }

  return (
    <>
      <div className={cn("flex w-full items-center justify-end", className)}>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex h-8 items-center gap-1 rounded-md border px-2.5 text-xs font-medium"
        >
          <SlidersHorizontal className="size-3.5" />
          {mobileLabel}
        </button>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="bottom" className="max-h-[88vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{mobileLabel}</SheetTitle>
            <SheetDescription>
              Update table controls and display settings.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 px-4 pb-4 pt-2">
            {normalized.map((control, index) => {
              if (control.kind === "settings") {
                return (
                  <div
                    key={control.id ?? `settings-${index}`}
                    className="space-y-1"
                  >
                    <p className="px-1 py-1 text-xs font-medium text-muted-foreground">
                      Settings
                    </p>
                    {control.items.map((item) => {
                      const checked = Boolean(control.values[item.id]);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => control.onChange(item.id, !checked)}
                          className="flex w-full cursor-pointer items-center gap-3 rounded-sm px-2 py-1.5 text-xs hover:bg-accent"
                        >
                          <Switch
                            checked={checked}
                            onCheckedChange={(next) =>
                              control.onChange(item.id, next)
                            }
                            aria-label={item.label}
                          />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                );
              }

              return (
                <div key={control.id ?? `${control.kind}-${index}`}>
                  {control.mobile ?? control.desktop}
                </div>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
