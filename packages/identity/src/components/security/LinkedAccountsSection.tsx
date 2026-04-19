"use client";

import { getClientOrigin } from "@caffeinebounce/shared-utils";
import {
  Button,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Spinner,
} from "@caffeinebounce/ui";
import { AlertCircle, Check, KeyRound, Link2, Unlink } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import type { CreateClientFn } from "../../types";
import { warnAboutSupabaseRedirectAllowlist } from "../auth/utils";
import { ConfirmAccessDialog, type MFAFactor } from "./ConfirmAccessDialog";

type Provider = "azure" | "google";

interface LinkedAccount {
  provider: Provider;
  name: string;
  icon: React.ReactNode;
  connected: boolean;
  email?: string;
  comingSoon?: boolean;
}

// SVG icons for OAuth providers
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-label="Google">
      <title>Google</title>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 23 23" aria-label="Microsoft">
      <title>Microsoft</title>
      <path fill="#f35325" d="M1 1h10v10H1z" />
      <path fill="#81bc06" d="M12 1h10v10H12z" />
      <path fill="#05a6f0" d="M1 12h10v10H1z" />
      <path fill="#ffba08" d="M12 12h10v10H12z" />
    </svg>
  );
}

export interface LinkedAccountsSectionProps {
  /** Function to create a Supabase client */
  createClient: CreateClientFn;
  /** Callback when user needs to set a password before disconnecting */
  onSetPasswordClick?: () => void;
  /** Redirect URL after OAuth callback */
  callbackRedirectUrl?: string;
  /** External error message (e.g., from OAuth callback) */
  linkError?: string | null;
}

export function LinkedAccountsSection({
  createClient,
  onSetPasswordClick,
  callbackRedirectUrl = "/profile#security",
  linkError: externalLinkError,
}: LinkedAccountsSectionProps) {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [pendingDisconnectProvider, setPendingDisconnectProvider] =
    useState<Provider | null>(null);
  const [accounts, setAccounts] = useState<LinkedAccount[]>([
    {
      provider: "azure",
      name: "Microsoft",
      icon: <MicrosoftIcon className="h-5 w-5" />,
      connected: false,
    },
    {
      provider: "google",
      name: "Google",
      icon: <GoogleIcon className="h-5 w-5" />,
      connected: false,
      comingSoon: true,
    },
  ]);
  const [hasPassword, setHasPassword] = useState(false);
  const [primaryProvider, setPrimaryProvider] = useState<string | null>(null);
  const [mfaFactor, setMfaFactor] = useState<MFAFactor | null>(null);
  const [showMfaConfirm, setShowMfaConfirm] = useState(false);
  const [pendingConnectProvider, setPendingConnectProvider] =
    useState<Provider | null>(null);
  const [mfaAction, setMfaAction] = useState<"connect" | "disconnect">(
    "disconnect",
  );

  // Set error from external prop (e.g., from URL params after OAuth callback)
  useEffect(() => {
    if (externalLinkError) {
      setError(externalLinkError);
    }
  }, [externalLinkError]);

  useEffect(() => {
    async function loadIdentities() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const identities = user.identities || [];

      const emailIdentity = identities.find((i) => i.provider === "email");
      const hasEmailPassword = !!emailIdentity;
      setHasPassword(hasEmailPassword);

      const oauthIdentity = identities.find((i) => i.provider !== "email");
      if (!hasEmailPassword && oauthIdentity) {
        setPrimaryProvider(oauthIdentity.provider);
      }

      setAccounts((prev) =>
        prev.map((account) => {
          const identity = identities.find(
            (i) => i.provider === account.provider,
          );
          return {
            ...account,
            connected: !!identity,
            email: identity?.identity_data?.email,
          };
        }),
      );

      // Check for MFA factors
      const { data: mfaData } = await supabase.auth.mfa.listFactors();
      if (mfaData) {
        const verifiedFactors = [
          ...(mfaData.totp || []),
          ...(mfaData.phone || []),
        ].filter((f) => f.status === "verified");

        if (verifiedFactors.length > 0) {
          const factor = verifiedFactors[0];
          setMfaFactor({
            id: factor.id,
            type: factor.factor_type as "totp" | "phone",
          });
        }
      }

      setLoading(false);
    }

    loadIdentities();
  }, [createClient]);

  const handleConnect = useCallback(
    async (provider: Provider) => {
      setError(null);
      setActionLoading(provider);

      const supabase = createClient();
      // Get the appropriate origin for this environment (handles preview vs production)
      const origin = getClientOrigin("NEXT_PUBLIC_SITE_URL");
      warnAboutSupabaseRedirectAllowlist(origin);
      const { error } = await supabase.auth.linkIdentity({
        provider,
        options: {
          redirectTo: `${origin}/callback?next=${callbackRedirectUrl}`,
        },
      });

      if (error) {
        // Provide more user-friendly error messages
        if (error.message.includes("Manual linking is disabled")) {
          setError(
            "Account linking is not currently available. Please contact support.",
          );
        } else {
          setError(error.message);
        }
        setActionLoading(null);
      }
    },
    [createClient, callbackRedirectUrl],
  );

  function handleConnectClick(provider: Provider) {
    if (mfaFactor) {
      // Require MFA confirmation before initiating OAuth
      setPendingConnectProvider(provider);
      setMfaAction("connect");
      setShowMfaConfirm(true);
    } else {
      handleConnect(provider);
    }
  }

  function handleDisconnectClick(provider: Provider) {
    const connectedCount = accounts.filter((a) => a.connected).length;
    const isOnlyMethod = connectedCount === 1 && !hasPassword;

    if (isOnlyMethod) {
      setPendingDisconnectProvider(provider);
      setShowPasswordDialog(true);
    } else if (mfaFactor) {
      // Require MFA confirmation
      setPendingDisconnectProvider(provider);
      setMfaAction("disconnect");
      setShowMfaConfirm(true);
    } else {
      handleDisconnect(provider);
    }
  }

  const handleDisconnect = useCallback(
    async (provider: Provider) => {
      setError(null);
      setActionLoading(provider);

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Not authenticated");
        setActionLoading(null);
        return;
      }

      const identity = user.identities?.find((i) => i.provider === provider);
      if (!identity) {
        setError("Identity not found");
        setActionLoading(null);
        return;
      }

      const { error } = await supabase.auth.unlinkIdentity(identity);

      if (error) {
        setError(error.message);
      } else {
        setAccounts((prev) =>
          prev.map((account) =>
            account.provider === provider
              ? { ...account, connected: false, email: undefined }
              : account,
          ),
        );
      }

      setActionLoading(null);
    },
    [createClient],
  );

  const handleMfaConfirm = useCallback(() => {
    setShowMfaConfirm(false);
    if (mfaAction === "disconnect" && pendingDisconnectProvider) {
      handleDisconnect(pendingDisconnectProvider);
      setPendingDisconnectProvider(null);
    } else if (mfaAction === "connect" && pendingConnectProvider) {
      handleConnect(pendingConnectProvider);
      setPendingConnectProvider(null);
    }
  }, [
    mfaAction,
    pendingDisconnectProvider,
    pendingConnectProvider,
    handleDisconnect,
    handleConnect,
  ]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-destructive bg-destructive/10 rounded-t-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {accounts.map((account, index) => {
        const isPrimary = primaryProvider === account.provider;

        return (
          <div
            key={account.provider}
            className={cn(
              "flex items-center justify-between px-4 py-3",
              index === 0 && !error && "rounded-t-lg",
              index === accounts.length - 1 && "rounded-b-lg",
            )}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                {account.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{account.name}</span>
                  {account.connected && (
                    <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                      <Check className="h-3 w-3" />
                      Connected
                    </span>
                  )}
                  {isPrimary && (
                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      Primary
                    </span>
                  )}
                  {account.comingSoon && !account.connected && (
                    <span className="text-xs text-muted-foreground">
                      Coming Soon
                    </span>
                  )}
                </div>
                {account.email && (
                  <span className="text-sm text-muted-foreground">
                    {account.email}
                  </span>
                )}
                {!account.connected && !account.comingSoon && (
                  <span className="text-sm text-muted-foreground">
                    Not connected
                  </span>
                )}
              </div>
            </div>

            <div>
              {account.comingSoon && !account.connected ? (
                <Button variant="outline" size="sm" disabled>
                  <Link2 className="h-4 w-4 mr-2" />
                  Connect
                </Button>
              ) : account.connected ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDisconnectClick(account.provider)}
                  loading={actionLoading === account.provider}
                >
                  <Unlink className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleConnectClick(account.provider)}
                  loading={actionLoading === account.provider}
                >
                  <Link2 className="h-4 w-4 mr-2" />
                  Connect
                </Button>
              )}
            </div>
          </div>
        );
      })}

      {/* Password Required Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set a Password First</DialogTitle>
            <DialogDescription>
              You need to set a password before you can disconnect your{" "}
              {
                accounts.find((a) => a.provider === pendingDisconnectProvider)
                  ?.name
              }{" "}
              account. This ensures you can still sign in after disconnecting.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowPasswordDialog(false)}
            >
              Cancel
            </Button>
            {onSetPasswordClick && (
              <Button
                onClick={() => {
                  setShowPasswordDialog(false);
                  onSetPasswordClick();
                }}
              >
                <KeyRound className="w-4 h-4 mr-2" />
                Set Password
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MFA Confirmation Dialog */}
      <ConfirmAccessDialog
        createClient={createClient}
        open={showMfaConfirm}
        onOpenChange={(open) => {
          if (!open) {
            setShowMfaConfirm(false);
            setPendingDisconnectProvider(null);
            setPendingConnectProvider(null);
          }
        }}
        onConfirm={handleMfaConfirm}
        verificationMethod="mfa"
        mfaFactor={mfaFactor}
        title="Confirm Access"
        description={
          mfaAction === "connect"
            ? `Verify your identity to connect your ${accounts.find((a) => a.provider === pendingConnectProvider)?.name || ""} account.`
            : `Verify your identity to disconnect your ${accounts.find((a) => a.provider === pendingDisconnectProvider)?.name || ""} account.`
        }
        confirmText={mfaAction === "connect" ? "Connect" : "Disconnect"}
        destructive={mfaAction === "disconnect"}
      />
    </div>
  );
}
