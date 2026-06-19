/**
 * Authentication logging helpers
 *
 * Convenience functions for logging auth events with consistent structure.
 */

import { extractAccountDomain } from "./email-domain";
import { logger } from "./logger";

function accountDomainContext(email: string): { accountDomain?: string } {
  const accountDomain = extractAccountDomain(email);

  return accountDomain ? { accountDomain } : {};
}

/**
 * Auth event logging helpers
 */
export const authLogger = {
  signInAttempt: (email: string, provider = "email") => {
    logger.auth("info", "User attempting to sign in", {
      event: "auth.signin.attempt",
      ...accountDomainContext(email),
      provider,
    });
  },

  signInSuccess: (userId: string, email: string, mfaUsed = false) => {
    logger.auth("info", "User signed in successfully", {
      event: "auth.signin.success",
      userId,
      ...accountDomainContext(email),
      mfaUsed,
    });
  },

  signInFailure: (email: string, reason: string) => {
    logger.auth("warn", "Sign in failed", {
      event: "auth.signin.failure",
      ...accountDomainContext(email),
      reason,
    });
  },

  mfaRequired: (userId: string, email: string) => {
    logger.auth("info", "MFA challenge triggered", {
      event: "auth.signin.mfa_required",
      userId,
      ...accountDomainContext(email),
    });
  },

  mfaSuccess: (userId: string, email: string) => {
    logger.auth("info", "MFA verification passed", {
      event: "auth.signin.mfa_success",
      userId,
      ...accountDomainContext(email),
      mfaUsed: true,
    });
  },

  mfaFailure: (userId: string, email: string, reason: string) => {
    logger.auth("warn", "MFA verification failed", {
      event: "auth.signin.mfa_failure",
      userId,
      ...accountDomainContext(email),
      reason,
    });
  },

  signUpAttempt: (email: string, provider = "email") => {
    logger.auth("info", "User attempting to sign up", {
      event: "auth.signup.attempt",
      ...accountDomainContext(email),
      provider,
    });
  },

  signUpSuccess: (userId: string, email: string) => {
    logger.auth("info", "Account created successfully", {
      event: "auth.signup.success",
      userId,
      ...accountDomainContext(email),
    });
  },

  signUpFailure: (email: string, reason: string) => {
    logger.auth("warn", "Sign up failed", {
      event: "auth.signup.failure",
      ...accountDomainContext(email),
      reason,
    });
  },

  emailVerificationSent: (email: string) => {
    logger.auth("info", "Verification email sent", {
      event: "auth.signup.email_verification_sent",
      ...accountDomainContext(email),
    });
  },

  passwordResetRequested: (email: string) => {
    logger.auth("info", "Password reset requested", {
      event: "auth.password_reset.requested",
      ...accountDomainContext(email),
    });
  },

  passwordResetCompleted: (userId: string, email: string) => {
    logger.auth("info", "Password reset completed", {
      event: "auth.password_reset.completed",
      userId,
      ...accountDomainContext(email),
    });
  },

  passwordResetFailed: (email: string, reason: string) => {
    logger.auth("warn", "Password reset failed", {
      event: "auth.password_reset.failed",
      ...accountDomainContext(email),
      reason,
    });
  },

  signOut: (userId: string, email: string) => {
    logger.auth("info", "User signed out", {
      event: "auth.signout",
      userId,
      ...accountDomainContext(email),
    });
  },

  sessionRefresh: (userId: string) => {
    logger.auth("debug", "Session token refreshed", {
      event: "auth.session.refresh",
      userId,
    });
  },
};
