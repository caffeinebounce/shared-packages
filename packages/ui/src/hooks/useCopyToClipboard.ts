import { useCallback, useState } from "react";

function fallbackCopy(text: string): boolean {
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

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
      if (typeof window === "undefined" || !value) return;

      const onSuccess = () => {
        setIsCopied(true);
        if (id) setCopiedId(id);
        setTimeout(() => {
          setIsCopied(false);
          if (id) setCopiedId(null);
        }, timeout);
      };

      // Prefer Clipboard API (requires secure context)
      if (navigator.clipboard?.writeText) {
        navigator.clipboard
          .writeText(value)
          .then(onSuccess)
          .catch(() => {
            // Fallback for non-secure contexts (e.g. HTTP over Tailscale)
            fallbackCopy(value) && onSuccess();
          });
        return;
      }

      // Fallback for browsers without Clipboard API
      fallbackCopy(value) && onSuccess();
    },
    [timeout],
  );

  return { isCopied, copiedId, copyToClipboard };
}
