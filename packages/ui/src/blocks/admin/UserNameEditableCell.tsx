"use client";

import { Check, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { cn } from "../../utils";

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
  const [isLoading, setIsLoading] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (firstName === (initialFirstName || "") && lastName === (initialLastName || "")) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${endpoint}/${rowId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update");
      }

      toast.success("Updated successfully");
      setIsEditing(false);
      onSuccess?.(firstName, lastName);
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update");
      // Revert on error
      setFirstName(initialFirstName || "");
      setLastName(initialLastName || "");
    } finally {
      setIsLoading(false);
    }
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
          className={cn("h-8 text-sm w-24 shadow-none focus-visible:ring-0 focus-visible:border-primary")}
        />
        <Input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Last"
          disabled={isLoading}
          className={cn("h-8 text-sm w-24 shadow-none focus-visible:ring-0 focus-visible:border-primary")}
        />
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
          onClick={handleSave}
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

  const fullName = [initialFirstName, initialLastName].filter(Boolean).join(" ");

  return (
    <div
      className="group flex items-center gap-2 min-h-[32px] cursor-pointer hover:bg-muted/50 px-2 -mx-2 rounded transition-colors"
      onClick={() => setIsEditing(true)}
      title="Click to edit name"
    >
      <span className="truncate font-medium">
        {fullName || <span className="text-muted-foreground italic">No Name</span>}
      </span>
    </div>
  );
}
