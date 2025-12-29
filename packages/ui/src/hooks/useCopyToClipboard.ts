import { useCallback, useState } from "react";

interface UseCopyToClipboardProps {
  timeout?: number;
}

export function useCopyToClipboard({
  timeout = 2000,
}: UseCopyToClipboardProps = {}) {
  const [isCopied, setIsCopied] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = useCallback(
    (value: string, id?: string) => {
      if (typeof window === "undefined" || !navigator.clipboard?.writeText) {
        return;
      }

      if (!value) return;

      navigator.clipboard.writeText(value).then(() => {
        setIsCopied(true);
        if (id) setCopiedId(id);

        setTimeout(() => {
          setIsCopied(false);
          if (id) setCopiedId(null);
        }, timeout);
      });
    },
    [timeout],
  );

  return { isCopied, copiedId, copyToClipboard };
}
