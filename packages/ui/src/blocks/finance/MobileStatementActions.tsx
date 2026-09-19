"use client";

import { MoreHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Switch } from "../../components/ui/switch";

export interface MobileStatementActionExport {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
}

export interface MobileStatementActionSetting {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  ariaLabel?: string;
}

export interface MobileStatementActionsProps {
  exports: MobileStatementActionExport[];
  settings: MobileStatementActionSetting[];
}

export function MobileStatementActions({
  exports,
  settings,
}: MobileStatementActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border text-muted-foreground"
        >
          <MoreHorizontal className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        {exports.map((item) => (
          <DropdownMenuItem key={item.label} onClick={item.onClick}>
            {item.icon ? <span className="mr-2">{item.icon}</span> : null}
            {item.label}
          </DropdownMenuItem>
        ))}
        {settings.length > 0 && <DropdownMenuSeparator />}
        {settings.map((setting) => (
          <DropdownMenuItem
            key={setting.label}
            onSelect={(e) => e.preventDefault()}
            className="gap-3"
          >
            <span className="flex-1">{setting.label}</span>
            <Switch
              checked={setting.checked}
              onCheckedChange={setting.onCheckedChange}
              aria-label={setting.ariaLabel ?? setting.label}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
