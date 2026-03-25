"use client";

import { useErrorLoggerSafe as useErrorLogger } from "@caffeinebounce/logger/client";
import { useState } from "react";
import { toast } from "sonner";

interface EditableCellSaveOptions {
  component: string;
  endpoint: string;
  rowId: string;
  payload: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  action?: string;
  successMessage?: string;
  onSuccess?: () => void;
  onError?: () => void;
}

async function getErrorMessage(response: Response) {
  try {
    const data: unknown = await response.json();

    if (
      data &&
      typeof data === "object" &&
      "error" in data &&
      typeof data.error === "string" &&
      data.error
    ) {
      return data.error;
    }
  } catch {
    // Fall back to the generic message when the response body is empty or non-JSON.
  }

  return "Failed to update";
}

export function useEditableCellSave() {
  const { logError } = useErrorLogger();
  const [isLoading, setIsLoading] = useState(false);

  const save = async ({
    action = "handleSave",
    component,
    endpoint,
    rowId,
    payload,
    metadata,
    successMessage = "Updated successfully",
    onSuccess,
    onError,
  }: EditableCellSaveOptions) => {
    setIsLoading(true);

    try {
      const response = await fetch(`${endpoint}/${rowId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      toast.success(successMessage);
      onSuccess?.();
    } catch (error) {
      logError(error, {
        component,
        action,
        metadata: {
          rowId,
          ...metadata,
        },
      });
      toast.error(error instanceof Error ? error.message : "Failed to update");
      onError?.();
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, save };
}
