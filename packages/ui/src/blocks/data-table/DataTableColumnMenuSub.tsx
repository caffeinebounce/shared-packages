"use client";

import { ListOrdered } from "lucide-react";
import type { ReactNode } from "react";
import {
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "../../components/ui/dropdown-menu";

export interface DataTableColumnMenuSubProps {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
}

export function DataTableColumnMenuSub({
  label,
  icon,
  children,
}: DataTableColumnMenuSubProps) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="flex items-center gap-2">
        {icon ?? <ListOrdered className="size-4 text-muted-foreground" />}
        {label}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent alignOffset={-5} sideOffset={5}>
        {children}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
