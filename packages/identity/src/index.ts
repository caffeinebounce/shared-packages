// Components
export {
  AuthFormLayout,
  type AuthFormLayoutProps,
  AuthHeader,
  type AuthHeaderProps,
  AuthPageLayout,
  type AuthPageLayoutProps,
  DeleteAccountSection,
  type DeleteAccountSectionProps,
  EmailSection,
  type EmailSectionProps,
  ForgotPasswordForm,
  type ForgotPasswordFormProps,
  GoogleIcon,
  LinkedAccountsSection,
  type LinkedAccountsSectionProps,
  MFAChallenge,
  type MFAChallengeProps,
  MFAConfirmDialog,
  type MFAConfirmDialogProps,
  MFAProvider,
  type MFAProviderProps,
  MFARecovery,
  type MFARecoveryProps,
  MicrosoftIcon,
  PasswordSection,
  type PasswordSectionProps,
  PhoneSection,
  type PhoneSectionProps,
  RecoverySection,
  type RecoverySectionProps,
  ResetPasswordForm,
  type ResetPasswordFormProps,
  SigninForm,
  type SigninFormProps,
  SignupForm,
  type SignupFormProps,
  TwoFactorSection,
  type TwoFactorSectionProps,
  useMFA,
  useRequireMFA,
} from "./components";

// Handlers
export { type AuthCallbackConfig, createAuthCallbackHandler } from "./handlers";

// Types
export {
  type AuthFormConfig,
  type AuthLinks,
  type AuthLogo,
  type CreateClientFn,
  defaultAuthLinks,
  type OAuthProvider,
} from "./types";

// Utils
export {
  type DeviceFingerprint,
  type GeolocationInfo,
  generateDeviceFingerprint,
  generateRecoveryCodes,
  generateSecureToken,
  getClientIP,
  getGeolocationFromIP,
  hashString,
} from "./utils";
