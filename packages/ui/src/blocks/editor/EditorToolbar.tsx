/**
 * EditorToolbar - Toolbar component for the GrapesJS editor.
 *
 * Provides save, export, preview, undo/redo, and clear actions.
 */

"use client";

import { Download, Eye, Redo2, RotateCcw, Save, Undo2 } from "lucide-react";

import { Button } from "../../components/button";
import { cn } from "../../lib/utils";

/**
 * Props for EditorToolbar component.
 */
export interface EditorToolbarProps {
  /** Callback when save is clicked */
  onSave?: () => void;
  /** Callback when export is clicked */
  onExport?: () => void;
  /** Callback when preview is clicked */
  onPreview?: () => void;
  /** Callback when undo is clicked */
  onUndo?: () => void;
  /** Callback when redo is clicked */
  onRedo?: () => void;
  /** Callback when clear is clicked */
  onClear?: () => void;
  /** Whether undo is available */
  canUndo?: boolean;
  /** Whether redo is available */
  canRedo?: boolean;
  /** Whether editor is ready */
  isReady?: boolean;
  /** Name of the current preset (for display) */
  presetName?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * EditorToolbar component - Provides editor action buttons.
 */
export function EditorToolbar({
  onSave,
  onExport,
  onPreview,
  onUndo,
  onRedo,
  onClear,
  canUndo = false,
  canRedo = false,
  isReady = false,
  presetName = "Editor",
  className,
}: EditorToolbarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-border bg-background px-4 py-2",
        className,
      )}
    >
      {/* Left section - Title */}
      <div className="flex items-center gap-2">
        <h2 className="font-semibold text-sm text-foreground">{presetName}</h2>
        {!isReady && (
          <span className="text-xs text-muted-foreground">Loading...</span>
        )}
      </div>

      {/* Center section - History actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          disabled={!isReady || !canUndo}
          title="Undo"
          className="h-8 w-8 p-0"
        >
          <Undo2 className="h-4 w-4" />
          <span className="sr-only">Undo</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRedo}
          disabled={!isReady || !canRedo}
          title="Redo"
          className="h-8 w-8 p-0"
        >
          <Redo2 className="h-4 w-4" />
          <span className="sr-only">Redo</span>
        </Button>
        <div className="mx-2 h-4 w-px bg-border" />
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          disabled={!isReady}
          title="Clear canvas"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="sr-only">Clear canvas</span>
        </Button>
      </div>

      {/* Right section - Primary actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPreview}
          disabled={!isReady}
          className="h-8"
        >
          <Eye className="mr-1.5 h-4 w-4" />
          Preview
        </Button>
        {onExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            disabled={!isReady}
            className="h-8"
          >
            <Download className="mr-1.5 h-4 w-4" />
            Export
          </Button>
        )}
        {onSave && (
          <Button
            size="sm"
            onClick={onSave}
            disabled={!isReady}
            className="h-8"
          >
            <Save className="mr-1.5 h-4 w-4" />
            Save
          </Button>
        )}
      </div>
    </div>
  );
}
