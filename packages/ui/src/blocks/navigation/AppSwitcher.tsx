"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  type ComponentType,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../components/ui/sidebar";
import { KeyboardShortcut } from "../keyboard/KeyboardShortcut";

/**
 * Application definition for the AppSwitcher.
 */
export interface AppDefinition {
  /** Unique identifier */
  id: string;
  /** Full display name for the dropdown */
  name: string;
  /** Short display name shown in the header badge */
  shortName: string;
  /** Route to navigate to when selected */
  route: string;
  /** Color class for the app indicator badge */
  colorClass: string;
  /** Optional icon component shown in dropdown */
  icon?: ReactNode;
}

export interface AppSwitcherProps {
  /** List of available apps */
  apps: AppDefinition[];
  /** Brand name to display (e.g., "Capital Compass") */
  brandName?: string;
  /** Brand logo URL */
  brandLogoUrl?: string;
  /** Function to determine active app from pathname */
  getActiveAppId?: (pathname: string) => string;
  /** Custom keyboard shortcut component */
  ShortcutComponent?: ComponentType<{
    className?: string;
    children: ReactNode;
  }>;
  /** Additional className for the container */
  className?: string;
}

/**
 * AppSwitcher Component
 *
 * A branded header with dropdown for switching between different apps/modules.
 * Styled like AdminBrandedHeader but with app selection capability.
 *
 * Visual design:
 * - Logo on the left (32x32, rounded)
 * - Brand name as main title (font-semibold)
 * - Colored app badge underneath (uppercase, tracking-wider)
 * - Subtle dropdown indicator
 *
 * @example
 * ```tsx
 * const apps: AppDefinition[] = [
 *   {
 *     id: "admin",
 *     name: "Admin Console",
 *     shortName: "Admin",
 *     route: "/admin/dashboard",
 *     colorClass: "text-orange-600 dark:text-orange-400",
 *     icon: <Compass className="h-4 w-4" />,
 *   },
 *   {
 *     id: "finance",
 *     name: "Finance",
 *     shortName: "Finance",
 *     route: "/finance",
 *     colorClass: "text-emerald-600 dark:text-emerald-400",
 *     icon: <DollarSign className="h-4 w-4" />,
 *   },
 * ];
 *
 * <AppSwitcher
 *   apps={apps}
 *   brandName="Capital Compass"
 *   brandLogoUrl="/logo.png"
 *   getActiveAppId={(pathname) => pathname.startsWith("/finance") ? "finance" : "admin"}
 * />
 * ```
 */
export function AppSwitcher({
  apps,
  brandName = "App",
  brandLogoUrl,
  getActiveAppId,
  ShortcutComponent,
  className,
}: AppSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Use custom ShortcutComponent if provided, otherwise use default
  const Shortcut = ShortcutComponent || KeyboardShortcut;

  // Determine active app
  const activeApp = useMemo(() => {
    if (getActiveAppId) {
      const activeId = getActiveAppId(pathname);
      return apps.find((app) => app.id === activeId) || apps[0] || null;
    }
    // Default: match by route prefix
    const matchedApp = apps.find((app) => pathname.startsWith(app.route));
    return matchedApp || apps[0] || null;
  }, [apps, pathname, getActiveAppId]);

  // Handle app selection
  const handleSelect = useCallback(
    (app: AppDefinition) => {
      if (app.id !== activeApp?.id) {
        router.push(app.route);
      }
      setOpen(false);
    },
    [activeApp?.id, router],
  );

  // Keyboard shortcuts: Ctrl+1 through Ctrl+9 to switch apps
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey) {
        const num = Number.parseInt(event.key, 10);
        if (num >= 1 && num <= 9 && num <= apps.length) {
          event.preventDefault();
          const app = apps[num - 1];
          if (app) {
            handleSelect(app);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [apps, handleSelect]);

  // If no apps, render nothing
  if (!activeApp) {
    return null;
  }

  return (
    <SidebarMenu className={className}>
      <SidebarMenuItem>
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {/* Logo */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                {brandLogoUrl ? (
                  <Image
                    src={brandLogoUrl}
                    alt={brandName}
                    width={32}
                    height={32}
                    priority
                    loading="eager"
                    fetchPriority="high"
                    sizes="32px"
                    className="h-8 w-8 rounded-lg object-contain"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-lg bg-primary/10" />
                )}
              </div>

              {/* Brand name + App badge */}
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{brandName}</span>
                <span
                  className={`truncate text-xs font-medium uppercase tracking-wider ${activeApp.colorClass}`}
                >
                  {activeApp.shortName}
                </span>
              </div>

              {/* Dropdown indicator */}
              <ChevronsUpDown className="ml-auto h-4 w-4 opacity-50" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[calc(var(--sidebar-width)-1rem)] min-w-[220px] rounded-lg p-1"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal uppercase tracking-wide px-2 py-1.5">
              Switch App
            </DropdownMenuLabel>

            {apps.map((app, index) => {
              const isActive = app.id === activeApp.id;
              const shortcutNumber = index < 9 ? index + 1 : null;

              return (
                <DropdownMenuItem
                  key={app.id}
                  onClick={() => handleSelect(app)}
                  className="gap-2 p-2 cursor-pointer rounded-md"
                >
                  {/* Logo - matches header */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                    {brandLogoUrl ? (
                      <Image
                        src={brandLogoUrl}
                        alt={brandName}
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-lg"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-lg bg-primary/10" />
                    )}
                  </div>

                  {/* Brand name + App badge - matches header layout */}
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{brandName}</span>
                    <span
                      className={`truncate text-xs font-medium uppercase tracking-wider ${app.colorClass}`}
                    >
                      {app.shortName}
                    </span>
                  </div>

                  {/* Keyboard shortcut + Active indicator */}
                  <div className="flex items-center gap-2">
                    {shortcutNumber && (
                      <Shortcut className="text-xs text-muted-foreground">
                        ⌃{shortcutNumber}
                      </Shortcut>
                    )}
                    {isActive && <Check className="h-4 w-4 text-primary" />}
                  </div>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
