"use client";

import { MoreHorizontal } from "lucide-react";
import type * as React from "react";

import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

export interface DataTableRowAction {
  /** Label for the action */
  label: string;
  /** Icon component to display */
  icon?: React.ReactNode;
  /** Callback when action is clicked */
  onClick: () => void;
  /** Whether the action is destructive (shows in red) */
  destructive?: boolean;
  /** Whether to show separator before this action */
  separatorBefore?: boolean;
  /** Whether the action is disabled */
  disabled?: boolean;
}

export interface DataTableRowActionsProps {
  /** Array of actions to display */
  actions: DataTableRowAction[];
}

/**
 * Row actions dropdown menu.
 * Displays a kebab menu with actions for a specific row.
 */
export function DataTableRowActions({ actions }: DataTableRowActionsProps) {
  if (actions.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex size-8 p-0 data-[state=open]:bg-muted"
        >
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {actions.map((action, index) => (
          <div key={action.label}>
            {action.separatorBefore && index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={action.onClick}
              disabled={action.disabled}
              className={action.destructive ? "text-destructive" : undefined}
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
