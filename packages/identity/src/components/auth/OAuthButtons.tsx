import { Button, cn } from "@caffeinebounce/ui/primitives";
import { Loader2 } from "lucide-react";
import {
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  useState,
} from "react";
import type { OAuthProvider } from "../../types";
import { GoogleIcon, MicrosoftIcon } from "../shared/OAuthIcons";

interface OAuthButtonsProps {
  providers: OAuthProvider[];
  googleComingSoon?: boolean;
  azureComingSoon?: boolean;
  disabled?: boolean;
  loadingProvider: OAuthProvider | null;
  oauthIconMonochromeOnHover?: boolean;
  onProviderSelect: (provider: OAuthProvider) => void;
  isLastMethod?: (method: OAuthProvider) => boolean;
  showLastUsedBadge?: boolean;
  mode?: "signin" | "signup";
}

const providerMeta = {
  google: {
    label: "Google",
    Icon: GoogleIcon,
  },
  azure: {
    label: "Microsoft",
    Icon: MicrosoftIcon,
  },
} satisfies Record<
  OAuthProvider,
  {
    label: string;
    Icon: typeof GoogleIcon;
  }
>;

function isStillInsideButton(
  event:
    | ReactMouseEvent<HTMLButtonElement>
    | ReactPointerEvent<HTMLButtonElement>,
) {
  const relatedTarget = event.relatedTarget;
  return (
    relatedTarget instanceof Node && event.currentTarget.contains(relatedTarget)
  );
}

export function OAuthButtons({
  providers,
  googleComingSoon = false,
  azureComingSoon = false,
  disabled = false,
  loadingProvider,
  oauthIconMonochromeOnHover = false,
  onProviderSelect,
  isLastMethod,
  showLastUsedBadge = false,
  mode = "signup",
}: OAuthButtonsProps) {
  const [hoveredProvider, setHoveredProvider] = useState<OAuthProvider | null>(
    null,
  );
  const visibleProviders = providers.filter(
    (provider) => provider === "google" || provider === "azure",
  );

  if (visibleProviders.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-3">
      {visibleProviders.map((provider) => {
        const comingSoon =
          provider === "google" ? googleComingSoon : azureComingSoon;
        const { Icon, label } = providerMeta[provider];
        const lastUsed =
          showLastUsedBadge && !comingSoon && isLastMethod?.(provider);

        return (
          <Button
            key={provider}
            type="button"
            variant="outline"
            size="lg"
            disabled={comingSoon || disabled || loadingProvider !== null}
            onClick={comingSoon ? undefined : () => onProviderSelect(provider)}
            onMouseOver={() => setHoveredProvider(provider)}
            onMouseOut={(event) => {
              if (isStillInsideButton(event)) {
                return;
              }
              setHoveredProvider(null);
            }}
            onPointerEnter={() => setHoveredProvider(provider)}
            onPointerLeave={(event) => {
              if (isStillInsideButton(event)) {
                return;
              }
              setHoveredProvider(null);
            }}
            onFocus={() => setHoveredProvider(provider)}
            onBlur={() => setHoveredProvider(null)}
            className={cn(
              "w-full bg-muted/50 border-border hover:bg-muted relative",
              mode === "signup" && "overflow-hidden",
              comingSoon
                ? "text-muted-foreground justify-center"
                : "text-foreground",
              mode === "signin" &&
                (lastUsed ? "justify-between" : "justify-center"),
            )}
          >
            <span
              className={cn(
                "inline-flex items-center gap-2 transition-opacity duration-150",
                loadingProvider === provider ? "opacity-0" : "opacity-100",
              )}
            >
              <Icon
                className={cn("size-5", comingSoon && "opacity-50")}
                monochrome={
                  oauthIconMonochromeOnHover && hoveredProvider === provider
                }
              />
              Continue with {label}
              {comingSoon && (
                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  Soon
                </span>
              )}
            </span>
            {lastUsed && !loadingProvider && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary border border-primary/30 rounded z-10 relative">
                Last Used
              </span>
            )}
            {loadingProvider === provider && (
              <span
                className={cn(
                  "absolute inset-0 inline-flex items-center justify-center gap-2",
                  mode === "signin"
                    ? "bg-muted/50"
                    : "transition-opacity duration-150 opacity-100",
                )}
              >
                <Loader2 className="size-5 animate-spin" />
                Redirecting...
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}
