"use client";

import { GripHorizontal, X } from "lucide-react";
import { type ReactNode, useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface DraggableStickyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  initialX?: number;
  initialY?: number;
  widthClassName?: string;
  heightClassName?: string;
}

export function DraggableStickyModal({
  open,
  onOpenChange,
  title,
  subtitle,
  children,
  initialX = 16,
  initialY = 16,
  widthClassName = "w-[min(920px,95vw)]",
  heightClassName = "h-[80vh]",
}: DraggableStickyModalProps) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const dragRef = useRef<{
    startX: number;
    startY: number;
    posX: number;
    posY: number;
  } | null>(null);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        posX: position.x,
        posY: position.y,
      };

      const onMove = (ev: MouseEvent) => {
        if (!dragRef.current) return;
        setPosition({
          x: dragRef.current.posX + (ev.clientX - dragRef.current.startX),
          y: dragRef.current.posY + (ev.clientY - dragRef.current.startY),
        });
      };

      const onUp = () => {
        dragRef.current = null;
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [position],
  );

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div
        className={`pointer-events-auto absolute rounded-lg border bg-background shadow-xl ${widthClassName} ${heightClassName}`}
        style={{ left: position.x, top: position.y }}
      >
        {/* biome-ignore lint/a11y/useSemanticElements: drag handle needs container semantics for nested close button */}
        <div
          className="flex items-center gap-2 border-b px-3 py-2 cursor-grab active:cursor-grabbing select-none"
          onMouseDown={onMouseDown}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Escape") onOpenChange(false);
          }}
        >
          <GripHorizontal className="size-3 text-muted-foreground/60 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{title}</p>
            {subtitle ? (
              <p className="text-xs text-muted-foreground truncate">
                {subtitle}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded p-1 hover:bg-muted"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="h-[calc(100%-44px)] overflow-auto">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
