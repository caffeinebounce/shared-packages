"use client";

import type {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  Check,
  ChevronDown,
  LayoutGrid,
  Plus,
  Save,
  Star,
  Trash2,
} from "lucide-react";
import * as React from "react";

import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { cn } from "../../utils";

/** Represents a saved table view configuration */
export interface DataTableView {
  /** Unique identifier */
  id: string;
  /** Display name for the view */
  name: string;
  /** Column visibility state */
  columnVisibility?: VisibilityState;
  /** Column order (array of column IDs) */
  columnOrder?: string[];
  /** Active filters */
  filters?: ColumnFiltersState;
  /** Sorting state */
  sorting?: SortingState;
  /** Whether this is the default view */
  isDefault?: boolean;
  /** When the view was created */
  createdAt?: string;
  /** When the view was last updated */
  updatedAt?: string;
}

/** Current table state that can be compared to a view */
export interface DataTableViewState {
  columnVisibility?: VisibilityState;
  columnOrder?: string[];
  filters?: ColumnFiltersState;
  sorting?: SortingState;
}

export interface DataTableViewsProps {
  /** List of saved views */
  views: DataTableView[];
  /** Currently active view ID */
  activeViewId?: string;
  /** Current table state */
  currentState: DataTableViewState;
  /** Callback when a view is selected */
  onSelectView: (view: DataTableView) => void;
  /** Callback to save a new view */
  onSaveView: (
    view: Omit<DataTableView, "id" | "createdAt" | "updatedAt">,
  ) => void;
  /** Callback to update an existing view */
  onUpdateView: (id: string, updates: Partial<DataTableView>) => void;
  /** Callback to delete a view */
  onDeleteView: (id: string) => void;
  /** Callback to set default view */
  onSetDefaultView: (id: string) => void;
  /** Optional class name */
  className?: string;
}

/** Check if current state differs from the active view */
function hasUnsavedChanges(
  currentState: DataTableViewState,
  activeView?: DataTableView,
): boolean {
  if (!activeView) return false;

  // Compare visibility
  const visA = JSON.stringify(currentState.columnVisibility ?? {});
  const visB = JSON.stringify(activeView.columnVisibility ?? {});
  if (visA !== visB) return true;

  // Compare filters
  const filtA = JSON.stringify(currentState.filters ?? []);
  const filtB = JSON.stringify(activeView.filters ?? []);
  if (filtA !== filtB) return true;

  // Compare sorting
  const sortA = JSON.stringify(currentState.sorting ?? []);
  const sortB = JSON.stringify(activeView.sorting ?? []);
  if (sortA !== sortB) return true;

  // Compare column order
  const orderA = JSON.stringify(currentState.columnOrder ?? []);
  const orderB = JSON.stringify(activeView.columnOrder ?? []);
  if (orderA !== orderB) return true;

  return false;
}

/**
 * DataTable Views component for saving and loading table configurations.
 *
 * Features:
 * - Save current view with a custom name
 * - Load saved views
 * - Set a default view
 * - Delete views
 * - Shows "Save" button when view has unsaved changes
 */
export function DataTableViews({
  views,
  activeViewId,
  currentState,
  onSelectView,
  onSaveView,
  onUpdateView,
  onDeleteView,
  onSetDefaultView,
  className,
}: DataTableViewsProps) {
  const [saveDialogOpen, setSaveDialogOpen] = React.useState(false);
  const [newViewName, setNewViewName] = React.useState("");
  const [setAsDefault, setSetAsDefault] = React.useState(false);
  const [nameError, setNameError] = React.useState<string | null>(null);

  const activeView = views.find((v) => v.id === activeViewId);
  const _defaultView = views.find((v) => v.isDefault);
  const hasChanges = hasUnsavedChanges(currentState, activeView);

  // Check for duplicate name as user types
  const checkDuplicateName = (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError(null);
      return;
    }
    const isDuplicate = views.some(
      (v) => v.name.toLowerCase() === trimmedName.toLowerCase(),
    );
    setNameError(isDuplicate ? "A view with this name already exists" : null);
  };

  const handleSaveNewView = () => {
    if (!newViewName.trim()) return;

    // Check for duplicate name
    const trimmedName = newViewName.trim();
    const isDuplicate = views.some(
      (v) => v.name.toLowerCase() === trimmedName.toLowerCase(),
    );
    if (isDuplicate) {
      setNameError("A view with this name already exists");
      return;
    }

    onSaveView({
      name: trimmedName,
      columnVisibility: currentState.columnVisibility,
      columnOrder: currentState.columnOrder,
      filters: currentState.filters,
      sorting: currentState.sorting,
      isDefault: setAsDefault,
    });

    setNewViewName("");
    setSetAsDefault(false);
    setNameError(null);
    setSaveDialogOpen(false);
  };

  const handleUpdateCurrentView = () => {
    if (!activeViewId) return;

    onUpdateView(activeViewId, {
      columnVisibility: currentState.columnVisibility,
      columnOrder: currentState.columnOrder,
      filters: currentState.filters,
      sorting: currentState.sorting,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <>
      <div className={cn("flex items-center gap-1", className)}>
        {/* Views dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs font-normal"
            >
              <LayoutGrid className="size-3.5" />
              <span className="hidden sm:inline">
                {activeView?.name ?? "Default View"}
              </span>
              <ChevronDown className="size-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {/* Saved views */}
            {views.length > 0 ? (
              <>
                {views.map((view) => (
                  <div
                    key={view.id}
                    className="group relative flex items-center"
                  >
                    <DropdownMenuItem
                      onClick={() => onSelectView(view)}
                      className="flex-1 flex items-center justify-between pr-16"
                    >
                      <span className="flex items-center gap-2">
                        {view.isDefault && (
                          <Star className="size-3 fill-yellow-400 text-yellow-400" />
                        )}
                        <span>{view.name}</span>
                      </span>
                      {activeViewId === view.id && (
                        <Check className="size-3.5 text-primary" />
                      )}
                    </DropdownMenuItem>
                    {/* Hover actions */}
                    <div className="absolute right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!view.isDefault && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSetDefaultView(view.id);
                          }}
                          className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                          title="Set as default"
                        >
                          <Star className="size-3" />
                        </button>
                      )}
                      {views.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteView(view.id);
                          }}
                          className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-destructive"
                          title="Delete view"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <DropdownMenuSeparator />
              </>
            ) : null}

            {/* Save as new view */}
            <DropdownMenuItem onClick={() => setSaveDialogOpen(true)}>
              <Plus className="mr-2 size-3.5" />
              Save as new view
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Save changes button (appears when there are unsaved changes) */}
        {hasChanges && activeView && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUpdateCurrentView}
            className="h-7 gap-1 px-2 text-xs font-normal text-primary hover:text-primary"
          >
            <Save className="size-3.5" />
            <span className="hidden sm:inline">Save</span>
          </Button>
        )}
      </div>

      {/* Save new view dialog */}
      <Dialog
        open={saveDialogOpen}
        onOpenChange={(open) => {
          setSaveDialogOpen(open);
          if (!open) {
            setNewViewName("");
            setSetAsDefault(false);
            setNameError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save View</DialogTitle>
            <DialogDescription>
              Save your current table configuration as a reusable view.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="view-name">View name</Label>
              <Input
                id="view-name"
                placeholder="e.g., Active Users, Recent Signups"
                value={newViewName}
                onChange={(e) => {
                  setNewViewName(e.target.value);
                  checkDuplicateName(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveNewView();
                }}
                className={nameError ? "border-destructive" : ""}
                autoFocus
              />
              {nameError && (
                <p className="text-xs text-destructive">{nameError}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="set-default"
                checked={setAsDefault}
                onChange={(e) => setSetAsDefault(e.target.checked)}
                className="size-4 rounded border-muted-foreground/30"
              />
              <Label
                htmlFor="set-default"
                className="text-sm font-normal cursor-pointer"
              >
                Set as default view
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveNewView}
              disabled={!newViewName.trim() || !!nameError}
            >
              Save View
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
