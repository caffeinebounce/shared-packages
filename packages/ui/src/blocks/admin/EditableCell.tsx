"use client";

import { Check, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { cn } from "../../utils";

interface EditableCellProps {
  value: string | number | null | undefined;
  rowId: string;
  columnId: string;
  endpoint: string;
  schema?: z.ZodType<unknown>;
  onSuccess?: (newValue: string | number) => void;
  type?: "text" | "number" | "email" | "url" | "textarea";
}

export function EditableCell({
  value: initialValue,
  rowId,
  columnId,
  endpoint,
  schema,
  onSuccess,
  type = "text",
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState<string | number>(initialValue || "");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing) {
      if (type === "textarea" && textareaRef.current) {
        textareaRef.current.focus();
      } else if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [isEditing, type]);

  const handleSave = async () => {
    if (value === (initialValue || "")) {
      setIsEditing(false);
      return;
    }

    if (schema) {
      const result = schema.safeParse(value);
      if (!result.success) {
        // @ts-expect-error - Zod error handling
        toast.error(result.error.errors?.[0]?.message || result.error.message);
        return;
      }
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${endpoint}/${rowId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [columnId]: value }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update");
      }

      toast.success("Updated successfully");
      setIsEditing(false);
      onSuccess?.(value);
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update");
      setValue(initialValue || ""); // Revert on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setValue(initialValue || "");
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
      <div
        className={cn(
          "flex items-center gap-1 min-w-[150px] relative z-10",
          type === "textarea" ? "min-w-[300px] items-start" : "",
        )}
      >
        {type === "textarea" ? (
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSave();
              } else if (e.key === "Escape") {
                handleCancel();
              }
            }}
            disabled={isLoading}
            className="min-h-[80px] text-sm shadow-none focus-visible:ring-0 focus-visible:border-primary resize-y"
          />
        ) : (
          <Input
            ref={inputRef}
            type={type}
            value={value}
            onChange={(e) =>
              setValue(
                type === "number" ? e.target.valueAsNumber : e.target.value,
              )
            }
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className={cn(
              "h-8 text-sm shadow-none focus-visible:ring-0 focus-visible:border-primary",
              type === "number" &&
                "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            )}
          />
        )}
        <div
          className={cn("flex", type === "textarea" ? "flex-col gap-1" : "")}
        >
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
      </div>
    );
  }

  return (
    <button
      type="button"
      className="group flex items-center w-full text-left gap-2 min-h-[32px] cursor-pointer hover:bg-muted/50 px-2 -mx-2 rounded transition-colors"
      onClick={() => setIsEditing(true)}
      title="Click to edit"
    >
      <span className="truncate">
        {value || <span className="text-muted-foreground italic">Empty</span>}
      </span>
    </button>
  );
}
