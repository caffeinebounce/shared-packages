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
  useEffect(() => {
    if (typeof document === "undefined") return;

    const options: NoWidowDomOptions = {
      defaultWordCount,
      minWords,
      preserveExistingNbsp,
      selector,
      selectors,
      wordCount,
    };
    const pendingRoots = new Set<ParentNode>();
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
      const roots = Array.from(pendingRoots);
      pendingRoots.clear();

      for (const root of roots) {
        applyNoWidowText(root, options);
      }
    };

    const schedule = (root: ParentNode) => {
      pendingRoots.add(root);
      cancelQueuedFrame();
      queuedFrame = requestFrame(run);
    };

    schedule(document.body);

    const addMutationRoot = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.parentElement) {
          pendingRoots.add(node.parentElement);
        }
        return;
      }

      if (node instanceof Element) {
        pendingRoots.add(node);
        return;
      }

      if (node.parentElement) {
        pendingRoots.add(node.parentElement);
      }
    };

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        addMutationRoot(mutation.target);

        for (const node of Array.from(mutation.addedNodes)) {
          addMutationRoot(node);
        }
      }

      cancelQueuedFrame();
      queuedFrame = requestFrame(run);
    });
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
    selectors,
    wordCount,
  ]);

  return children ?? null;
}
