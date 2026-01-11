"use client";

import { useErrorLogger } from "@caffeinebounce/logger";
import {
  Badge,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@caffeinebounce/ui";
import type { Factor } from "@supabase/supabase-js";
import {
  AlertTriangle,
  Check,
  KeyRound,
  Loader2,
  Mail,
  Shield,
  Smartphone,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { CreateClientFn } from "../../../types";
import { PhoneEnrollmentDialog } from "./PhoneEnrollmentDialog";
import { TOTPEnrollmentDialog } from "./TOTPEnrollmentDialog";

interface MFAFactor extends Factor {
  phone?: string;
}

export interface TwoFactorSectionProps {
  /** Function to create a Supabase client */
  createClient: CreateClientFn;
}

export function TwoFactorSection({ createClient }: TwoFactorSectionProps) {
  const { logError } = useErrorLogger();
  const [loading, setLoading] = useState(true);
  const [factors, setFactors] = useState<MFAFactor[]>([]);
  const [enrollingTOTP, setEnrollingTOTP] = useState(false);
  const [enrollingPhone, setEnrollingPhone] = useState(false);
  const [preferredMethod, setPreferredMethod] = useState<string | null>(null);

  // Feature flags - set to true when ready to enable
  const ENABLE_SMS_MFA = false;
  const ENABLE_PASSKEYS = false;

  const loadFactors = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;

      const allFactors = [...(data.totp || []), ...(data.phone || [])];
      setFactors(allFactors);
    } catch (error) {
      logError(error, {
        component: "TwoFactorSection",
        action: "loadMFAFactors",
      });
    } finally {
      setLoading(false);
    }
  }, [createClient, logError]);

  useEffect(() => {
    loadFactors();
  }, [loadFactors]);

  const verifiedFactors = factors.filter((f) => f.status === "verified");
  const hasTOTP = factors.some(
    (f) => f.factor_type === "totp" && f.status === "verified",
  );
  const hasPhone = factors.some(
    (f) => f.factor_type === "phone" && f.status === "verified",
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Banner */}
      {verifiedFactors.length > 0 ? (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900 dark:bg-green-950">
          <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            Two-factor authentication is enabled ({verifiedFactors.length}{" "}
            method
            {verifiedFactors.length > 1 ? "s" : ""})
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Two-factor authentication is not enabled
          </p>
        </div>
      )}

      {/* Preferred 2FA Method - Only show when MFA is enabled */}
      {verifiedFactors.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
          <span className="font-medium">Preferred 2FA method</span>
          <Select
            value={preferredMethod || verifiedFactors[0]?.factor_type || ""}
            onValueChange={setPreferredMethod}
            disabled={verifiedFactors.length === 1}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              {hasTOTP && (
                <SelectItem value="totp">Authenticator App</SelectItem>
              )}
              {hasPhone && <SelectItem value="phone">SMS</SelectItem>}
              {/* Passkeys will be added here when enabled */}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* MFA Methods - Grouped in a single container */}
      <div className="rounded-lg border border-border divide-y divide-border">
        {/* Authenticator App */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Smartphone className="h-4 w-4 text-primary" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Authenticator App</span>
              {hasTOTP && (
                <Badge variant="success" className="font-normal">
                  <Check className="h-3 w-3 mr-1" />
                  Enabled
                </Badge>
              )}
            </div>
          </div>
          <Button
            variant={hasTOTP ? "outline" : "default"}
            size="sm"
            onClick={() => setEnrollingTOTP(true)}
          >
            {hasTOTP ? "Manage" : "Set up"}
          </Button>
        </div>

        {/* SMS Authentication */}
        <div
          className={`flex items-center justify-between px-4 py-3 ${!ENABLE_SMS_MFA ? "opacity-60" : ""}`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${ENABLE_SMS_MFA ? "bg-primary/10" : "bg-muted"}`}
            >
              <Mail
                className={`h-4 w-4 ${ENABLE_SMS_MFA ? "text-primary" : "text-muted-foreground"}`}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">SMS Authentication</span>
              {!ENABLE_SMS_MFA && (
                <Badge variant="muted" className="font-normal">
                  Coming Soon
                </Badge>
              )}
              {ENABLE_SMS_MFA && hasPhone && (
                <Badge variant="success" className="font-normal">
                  <Check className="h-3 w-3 mr-1" />
                  Enabled
                </Badge>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEnrollingPhone(true)}
            disabled={!ENABLE_SMS_MFA}
          >
            {hasPhone && ENABLE_SMS_MFA ? "Manage" : "Set up"}
          </Button>
        </div>

        {/* Passkeys */}
        <div
          className={`flex items-center justify-between px-4 py-3 ${!ENABLE_PASSKEYS ? "opacity-60" : ""}`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <KeyRound className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Passkeys</span>
              {!ENABLE_PASSKEYS && (
                <Badge variant="muted" className="font-normal">
                  Coming Soon
                </Badge>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" disabled={!ENABLE_PASSKEYS}>
            Set up
          </Button>
        </div>
      </div>

      {/* TOTP Enrollment Dialog */}
      <TOTPEnrollmentDialog
        createClient={createClient}
        open={enrollingTOTP}
        onOpenChange={setEnrollingTOTP}
        onSuccess={() => {
          setEnrollingTOTP(false);
          loadFactors();
        }}
        existingFactor={factors.find(
          (f) => f.factor_type === "totp" && f.status === "verified",
        )}
      />

      {/* Phone Enrollment Dialog */}
      <PhoneEnrollmentDialog
        createClient={createClient}
        open={enrollingPhone}
        onOpenChange={setEnrollingPhone}
        onSuccess={() => {
          setEnrollingPhone(false);
          loadFactors();
        }}
        existingFactor={
          factors.find(
            (f) => f.factor_type === "phone" && f.status === "verified",
          ) as MFAFactor | undefined
        }
      />
    </div>
  );
}
