"use client";

import { Check, ChevronsUpDown, Plus } from "lucide-react";
import {
  type ComponentType,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../components/ui/sidebar";
import { Spinner } from "../../components/ui/spinner";
import { getAvatarGradient } from "../../utils/avatar-gradient";
import { KeyboardShortcut } from "../keyboard/KeyboardShortcut";

/** Base entity interface - extend this for your specific entity types */
export interface Entity {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Optional avatar image URL */
  avatarUrl?: string;
  /** Whether this is the primary/default entity */
  isPrimary?: boolean;
}

export interface EntitySwitcherShortcut {
  /** Key to press */
  key: string;
  /** Require Ctrl key */
  ctrl?: boolean;
  /** Require Shift key */
  shift?: boolean;
  /** Require Alt key */
  alt?: boolean;
  /** Require Meta key */
  meta?: boolean;
}

export interface EntitySwitcherProps<T extends Entity> {
  /** List of entities to display */
  entities: T[];
  /** Currently active entity */
  activeEntity: T | null;
  /** Callback when an entity is selected */
  onSelect: (entity: T) => void;
  /** Callback when "Add new" is clicked */
  onAddNew?: () => void;
  /** Whether entities are loading */
  loading?: boolean;
  /** User ID for gradient generation when no entities */
  userId?: string;
  /** Label shown in dropdown header */
  label?: string;
  /** Text for add new button */
  addNewLabel?: string;
  /** Placeholder text when no entities exist */
  emptyTitle?: string;
  /** Subtitle for empty state */
  emptySubtitle?: string;
  /** Custom render function for entity display name */
  getDisplayName?: (entity: T) => string;
  /** Custom render function for entity initials */
  getInitials?: (entity: T) => string;
  /** Enable keyboard shortcuts (Ctrl+1-9 for quick switch) */
  enableKeyboardShortcuts?: boolean;
  /** Keyboard shortcut to open switcher */
  openShortcut?: EntitySwitcherShortcut;
  /** Display string for open shortcut */
  openShortcutDisplay?: string;
  /** Dropdown side position */
  side?: "top" | "bottom" | "left" | "right";
  /** Dropdown alignment */
  align?: "start" | "center" | "end";
  /** Custom class name */
  className?: string;
  /** Custom keyboard shortcut component (for user preference integration) */
  ShortcutComponent?: ComponentType<{
    className?: string;
    children: ReactNode;
  }>;
}

/**
 * Get initials from a name string
 */
function defaultGetInitials(name: string): string {
  return name
    .split(" ")
    .filter((word) => word.length > 0)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Check if a keyboard event matches a shortcut definition
 */
function matchesShortcut(
  event: KeyboardEvent,
  shortcut: EntitySwitcherShortcut,
): boolean {
  const ctrlMatch = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey;
  const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
  const altMatch = shortcut.alt ? event.altKey : !event.altKey;
  const metaMatch = shortcut.meta ? event.metaKey : !event.metaKey;
  const keyMatch = event.key === shortcut.key;

  return ctrlMatch && shiftMatch && altMatch && metaMatch && keyMatch;
}

/**
 * Generic entity switcher component for switching between teams, companies, workspaces, etc.
 * Renders within a sidebar menu structure.
 */
export function EntitySwitcher<T extends Entity>({
  entities,
  activeEntity,
  onSelect,
  onAddNew,
  loading = false,
  userId,
  label = "Items",
  addNewLabel = "Add New",
  emptyTitle = "Add Item",
  emptySubtitle = "Get started",
  getDisplayName = (entity) => entity.name,
  getInitials = (entity) => defaultGetInitials(entity.name),
  enableKeyboardShortcuts = false,
  openShortcut,
  openShortcutDisplay,
  side = "bottom",
  align = "start",
  className,
  ShortcutComponent,
}: EntitySwitcherProps<T>): ReactNode {
  // Use custom ShortcutComponent if provided, otherwise use default
  const Shortcut = ShortcutComponent || KeyboardShortcut;
  const [open, setOpen] = useState(false);

  // Keyboard shortcut handler
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enableKeyboardShortcuts) return;

      // Open shortcut
      if (openShortcut && matchesShortcut(event, openShortcut)) {
        event.preventDefault();
        setOpen((prev) => !prev);
        return;
      }

      // Ctrl+1 through Ctrl+9 to switch entities
      if (event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey) {
        const num = Number.parseInt(event.key, 10);
        if (num >= 1 && num <= 9 && num <= entities.length) {
          event.preventDefault();
          const entity = entities[num - 1];
          if (entity) {
            onSelect(entity);
            setOpen(false);
          }
        }
      }
    },
    [entities, onSelect, enableKeyboardShortcuts, openShortcut],
  );

  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, enableKeyboardShortcuts]);

  // Loading state
  if (loading) {
    return (
      <SidebarMenu className={className}>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="flex h-8 w-8 items-center justify-center">
              <Spinner size="sm" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate text-muted-foreground">Loading...</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // No active entity - show prompt to create one
  if (!activeEntity) {
    const gradientId = userId || "default";
    return (
      <SidebarMenu className={className}>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" onClick={onAddNew} disabled={!onAddNew}>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
              style={getAvatarGradient(gradientId).style}
            >
              <Plus className="h-4 w-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{emptyTitle}</span>
              <span className="truncate text-xs text-muted-foreground">
                {emptySubtitle}
              </span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const displayName = getDisplayName(activeEntity);
  const initials = getInitials(activeEntity);

  return (
    <SidebarMenu className={className}>
      <SidebarMenuItem>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                <Avatar className="h-8 w-8 rounded-lg">
                  {activeEntity.avatarUrl && (
                    <AvatarImage
                      src={activeEntity.avatarUrl}
                      alt={displayName}
                    />
                  )}
                  <AvatarFallback
                    className="rounded-lg text-xs font-medium text-white"
                    style={getAvatarGradient(activeEntity.id).style}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold">{displayName}</span>
              </div>
              {openShortcutDisplay && (
                <Shortcut className="ml-auto hidden text-xs text-muted-foreground md:inline-flex group-data-[collapsible=icon]:hidden">
                  {openShortcutDisplay}
                </Shortcut>
              )}
              <ChevronsUpDown className="ml-1 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[calc(var(--sidebar-width)-1rem)] rounded-lg"
            align={align}
            side={side}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground font-light uppercase tracking-wide">
              {label}
            </DropdownMenuLabel>
            {entities.map((entity, index) => {
              const name = getDisplayName(entity);
              const entityInitials = getInitials(entity);
              const shortcutNumber =
                enableKeyboardShortcuts && index < 9 ? index + 1 : null;
              const isActive = entity.id === activeEntity.id;

              return (
                <DropdownMenuItem
                  key={entity.id}
                  onClick={() => onSelect(entity)}
                  className="gap-2 p-2"
                >
                  <Avatar className="h-6 w-6 rounded-md">
                    {entity.avatarUrl && (
                      <AvatarImage src={entity.avatarUrl} alt={name} />
                    )}
                    <AvatarFallback
                      className="rounded-md text-xs font-medium text-white"
                      style={getAvatarGradient(entity.id).style}
                    >
                      {entityInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1 truncate">{name}</span>
                  {shortcutNumber && (
                    <Shortcut className="text-xs text-muted-foreground">
                      ⌃{shortcutNumber}
                    </Shortcut>
                  )}
                  {isActive && <Check className="h-4 w-4 text-primary" />}
                </DropdownMenuItem>
              );
            })}
            {onAddNew && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 p-2 group cursor-pointer"
                  onClick={onAddNew}
                >
                  <Plus className="h-4 w-4 text-muted-foreground group-hover:text-white" />
                  <span className="text-muted-foreground">{addNewLabel}</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
