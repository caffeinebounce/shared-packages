/**
 * Authentication logging helpers
 *
 * Convenience functions for logging auth events with consistent structure.
 */

import { logger } from "./logger";

/**
 * Auth event logging helpers
 */
export const authLogger = {
  signInAttempt: (email: string, provider = "email") => {
    logger.auth("info", "User attempting to sign in", {
      event: "auth.signin.attempt",
      email,
      provider,
    });
  },

  signInSuccess: (userId: string, email: string, mfaUsed = false) => {
    logger.auth("info", "User signed in successfully", {
      event: "auth.signin.success",
      userId,
      email,
      mfaUsed,
    });
  },

  signInFailure: (email: string, reason: string) => {
    logger.auth("warn", "Sign in failed", {
      event: "auth.signin.failure",
      email,
      reason,
    });
  },

  mfaRequired: (userId: string, email: string) => {
    logger.auth("info", "MFA challenge triggered", {
      event: "auth.signin.mfa_required",
      userId,
      email,
    });
  },

  mfaSuccess: (userId: string, email: string) => {
    logger.auth("info", "MFA verification passed", {
      event: "auth.signin.mfa_success",
      userId,
      email,
      mfaUsed: true,
    });
  },

  mfaFailure: (userId: string, email: string, reason: string) => {
    logger.auth("warn", "MFA verification failed", {
      event: "auth.signin.mfa_failure",
      userId,
      email,
      reason,
    });
  },

  signUpAttempt: (email: string, provider = "email") => {
    logger.auth("info", "User attempting to sign up", {
      event: "auth.signup.attempt",
      email,
      provider,
    });
  },

  signUpSuccess: (userId: string, email: string) => {
    logger.auth("info", "Account created successfully", {
      event: "auth.signup.success",
      userId,
      email,
    });
  },

  signUpFailure: (email: string, reason: string) => {
    logger.auth("warn", "Sign up failed", {
      event: "auth.signup.failure",
      email,
      reason,
    });
  },

  emailVerificationSent: (email: string) => {
    logger.auth("info", "Verification email sent", {
      event: "auth.signup.email_verification_sent",
      email,
    });
  },

  passwordResetRequested: (email: string) => {
    logger.auth("info", "Password reset requested", {
      event: "auth.password_reset.requested",
      email,
    });
  },

  passwordResetCompleted: (userId: string, email: string) => {
    logger.auth("info", "Password reset completed", {
      event: "auth.password_reset.completed",
      userId,
      email,
    });
  },

  passwordResetFailed: (email: string, reason: string) => {
    logger.auth("warn", "Password reset failed", {
      event: "auth.password_reset.failed",
      email,
      reason,
    });
  },

  signOut: (userId: string, email: string) => {
    logger.auth("info", "User signed out", {
      event: "auth.signout",
      userId,
      email,
    });
  },

  sessionRefresh: (userId: string) => {
    logger.auth("debug", "Session token refreshed", {
      event: "auth.session.refresh",
      userId,
    });
  },
};
