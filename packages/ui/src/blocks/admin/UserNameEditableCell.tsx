"use client";

import { Check, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { cn } from "../../utils";
import { useEditableCellSave } from "./useEditableCellSave";

interface UserNameEditableCellProps {
  firstName: string | null | undefined;
  lastName: string | null | undefined;
  rowId: string;
  endpoint: string;
  onSuccess?: (firstName: string, lastName: string) => void;
}

export function UserNameEditableCell({
  firstName: initialFirstName,
  lastName: initialLastName,
  rowId,
  endpoint,
  onSuccess,
}: UserNameEditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(initialFirstName || "");
  const [lastName, setLastName] = useState(initialLastName || "");
  const firstInputRef = useRef<HTMLInputElement>(null);
  const { isLoading, save } = useEditableCellSave();

  useEffect(() => {
    if (isEditing && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (
      firstName === (initialFirstName || "") &&
      lastName === (initialLastName || "")
    ) {
      setIsEditing(false);
      return;
    }

    await save({
      component: "UserNameEditableCell",
      endpoint,
      rowId,
      payload: { firstName, lastName },
      onError: () => {
        setFirstName(initialFirstName || "");
        setLastName(initialLastName || "");
      },
      onSuccess: () => {
        setIsEditing(false);
        onSuccess?.(firstName, lastName);
      },
    });
  };

  const handleCancel = () => {
    setFirstName(initialFirstName || "");
    setLastName(initialLastName || "");
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
      <div className="flex items-center gap-1 min-w-[200px]">
        <Input
          ref={firstInputRef}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="First"
          disabled={isLoading}
          className={cn(
            "h-8 text-sm w-24 shadow-none focus-visible:ring-0 focus-visible:border-primary",
          )}
        />
        <Input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Last"
          disabled={isLoading}
          className={cn(
            "h-8 text-sm w-24 shadow-none focus-visible:ring-0 focus-visible:border-primary",
          )}
        />
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
          onClick={() => void handleSave()}
          disabled={isLoading}
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleCancel}
          disabled={isLoading}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  const fullName = [initialFirstName, initialLastName]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className="group flex items-center w-full text-left gap-2 min-h-[32px] cursor-pointer hover:bg-muted/50 px-2 -mx-2 rounded transition-colors"
      onClick={() => setIsEditing(true)}
      title="Click to edit name"
    >
      <span className="truncate font-medium">
        {fullName || (
          <span className="text-muted-foreground italic">No Name</span>
        )}
      </span>
    </button>
  );
}
