"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { cn } from "../../utils";
import { useDataTableContext } from "../data-table";
import { useEditableCellSave } from "./useEditableCellSave";

interface CompanyNameEditableCellProps {
  name: string;
  dbaName: string | null | undefined;
  rowId: string;
  endpoint: string;
  onSuccess?: (name: string, dbaName: string | null) => void;
}

export function CompanyNameEditableCell({
  name: initialName,
  dbaName: initialDbaName,
  rowId,
  endpoint,
  onSuccess,
}: CompanyNameEditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName || "");
  const [dbaName, setDbaName] = useState(initialDbaName || "");
  const firstInputRef = useRef<HTMLInputElement>(null);
  const context = useDataTableContext();
  const isCompact = context?.density === "compact";
  const { isLoading, save } = useEditableCellSave();

  useEffect(() => {
    if (isEditing && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (name === (initialName || "") && dbaName === (initialDbaName || "")) {
      setIsEditing(false);
      return;
    }

    if (!name.trim()) {
      toast.error("Company name is required");
      return;
    }

    await save({
      component: "CompanyNameEditableCell",
      endpoint,
      rowId,
      payload: { name, dbaName: dbaName || null },
      onError: () => {
        setName(initialName || "");
        setDbaName(initialDbaName || "");
      },
      onSuccess: () => {
        setIsEditing(false);
        onSuccess?.(name, dbaName || null);
      },
    });
  };

  const handleCancel = () => {
    setName(initialName || "");
    setDbaName(initialDbaName || "");
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2 min-w-[250px] p-2 bg-background border rounded-md shadow-sm z-10 absolute">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="company-name-input"
            className="text-xs font-medium text-muted-foreground"
          >
            Company Name
          </label>
          <Input
            id="company-name-input"
            ref={firstInputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Company Name"
            disabled={isLoading}
            className={cn(
              "h-8 text-sm shadow-none focus-visible:ring-0 focus-visible:border-primary",
            )}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="dba-name-input"
            className="text-xs font-medium text-muted-foreground"
          >
            DBA (Optional)
          </label>
          <Input
            id="dba-name-input"
            value={dbaName}
            onChange={(e) => setDbaName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="DBA Name"
            disabled={isLoading}
            className={cn(
              "h-8 text-sm shadow-none focus-visible:ring-0 focus-visible:border-primary",
            )}
          />
        </div>
        <div className="flex justify-end gap-2 mt-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
            onClick={() => void handleSave()}
            disabled={isLoading}
          >
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={cn(
        "group flex w-full text-left cursor-pointer hover:bg-muted/50 px-2 -mx-2 rounded transition-colors",
        isCompact ? "items-center" : "flex-col py-1",
      )}
      onClick={() => setIsEditing(true)}
      title="Click to edit company details"
    >
      <span className="font-medium truncate">{name}</span>
      {!isCompact && dbaName && (
        <span className="text-xs text-muted-foreground truncate">
          DBA: {dbaName}
        </span>
      )}
    </button>
  );
}
