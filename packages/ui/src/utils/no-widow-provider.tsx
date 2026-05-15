"use client";

import { type ReactNode, useEffect } from "react";
import { applyNoWidowText, type NoWidowDomOptions } from "./no-widow";

export type NoWidowProviderProps = NoWidowDomOptions & {
  children?: ReactNode;
};

export function NoWidowProvider({
  children,
  defaultWordCount,
  minWords,
  preserveExistingNbsp,
  selector,
  selectors,
  wordCount,
}: NoWidowProviderProps) {
  const selectorsKey = selectors?.join(",");

  useEffect(() => {
    if (typeof document === "undefined") return;

    const options: NoWidowDomOptions = {
      defaultWordCount,
      minWords,
      preserveExistingNbsp,
      selector,
      selectors: selectorsKey ? selectorsKey.split(",") : undefined,
      wordCount,
    };
    let queuedFrame: number | null = null;
    const requestFrame =
      window.requestAnimationFrame ??
      ((callback) => window.setTimeout(callback, 0));
    const cancelFrame = window.cancelAnimationFrame ?? window.clearTimeout;

    const cancelQueuedFrame = () => {
      if (queuedFrame === null) return;

      cancelFrame(queuedFrame);
      queuedFrame = null;
    };

    const run = () => {
      queuedFrame = null;
      applyNoWidowText(document.body, options);
    };

    const schedule = () => {
      cancelQueuedFrame();
      queuedFrame = requestFrame(run);
    };

    schedule();

    const observer = new MutationObserver(schedule);
    observer.observe(document.body, {
      characterData: true,
      childList: true,
      subtree: true,
    });

    return () => {
      cancelQueuedFrame();
      observer.disconnect();
    };
  }, [
    defaultWordCount,
    minWords,
    preserveExistingNbsp,
    selector,
    selectorsKey,
    wordCount,
  ]);

  return children ?? null;
}
