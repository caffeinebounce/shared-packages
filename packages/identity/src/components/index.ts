// Re-export all components from subdirectories
// Authentication forms
export {
  type AuthEventCallbacks,
  type ConsentItem,
  EmailVerificationPending,
  type EmailVerificationPendingProps,
  ForgotPasswordForm,
  type ForgotPasswordFormProps,
  type PasswordResetEventCallbacks,
  type ResetPasswordEventCallbacks,
  ResetPasswordForm,
  type ResetPasswordFormProps,
  SigninForm,
  type SigninFormProps,
  type SignupEventCallbacks,
  SignupForm,
  type SignupFormProps,
  sanitizeAuthError,
  sanitizeSigninError,
  sanitizeSignupError,
} from "./auth";

// Multi-factor authentication
export {
  MFAChallenge,
  type MFAChallengeProps,
  MFAConfirmDialog,
  type MFAConfirmDialogProps,
  type MFAEventCallbacks,
  MFAProvider,
  type MFAProviderProps,
  MFARecovery,
  type MFARecoveryProps,
  PhoneEnrollmentDialog,
  type PhoneEnrollmentDialogProps,
  TOTPEnrollmentDialog,
  type TOTPEnrollmentDialogProps,
  TwoFactorSection,
  type TwoFactorSectionProps,
  useMFA,
  useRequireMFA,
} from "./mfa";

// Security settings
export {
  ConfirmAccessDialog,
  type ConfirmAccessDialogProps,
  DeleteAccountSection,
  type DeleteAccountSectionProps,
  EmailSection,
  type EmailSectionProps,
  LinkedAccountsSection,
  type LinkedAccountsSectionProps,
  type MFAFactor,
  PasswordSection,
  type PasswordSectionProps,
  PhoneSection,
  type PhoneSectionProps,
  RecoverySection,
  type RecoverySectionProps,
  type VerificationMethod,
} from "./security";

// Shared UI components
export {
  AuthFormLayout,
  type AuthFormLayoutProps,
  AuthHeader,
  type AuthHeaderProps,
  AuthPageLayout,
  type AuthPageLayoutProps,
  GoogleIcon,
  MicrosoftIcon,
  OrDivider,
  type OrDividerProps,
} from "./shared";
