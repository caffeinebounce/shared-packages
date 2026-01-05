import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Type for the createClient function that apps must provide.
 * This abstracts over browser vs server client creation.
 *
 * Using `any` for all generic parameters avoids version mismatches
 * between packages with different Supabase client versions.
 */
// biome-ignore lint/suspicious/noExplicitAny: Required for cross-version Supabase client compatibility
export type CreateClientFn = () => SupabaseClient<any, any, any, any, any>;

/**
 * Configuration for OAuth providers
 */
export type OAuthProvider = "google" | "azure";

/**
 * Logo configuration for auth pages
 */
export interface AuthLogo {
  /** Logo image source (URL or path) */
  src: string;
  /** Alt text for the logo */
  alt: string;
  /** Logo width in pixels */
  width?: number;
  /** Logo height in pixels */
  height?: number;
}

/**
 * Common configuration for auth forms
 */
export interface AuthFormConfig {
  /** App name displayed in headings */
  appName?: string;
  /** Logo configuration */
  logo?: AuthLogo;
  /** URL to terms of service page */
  termsUrl?: string;
  /** URL to privacy policy page */
  privacyUrl?: string;
  /** Supabase client factory */
  createClient: CreateClientFn;
}

/**
 * Link configuration for auth pages
 */
export interface AuthLinks {
  /** Sign in page path */
  signIn?: string;
  /** Sign up page path */
  signUp?: string;
  /** Forgot password page path */
  forgotPassword?: string;
  /** Reset password page path */
  resetPassword?: string;
  /** Auth callback route for PKCE code exchange (e.g., /callback) */
  callback?: string;
  /** Home page path */
  home?: string;
  /** Default redirect after auth */
  defaultRedirect?: string;
}

/**
 * Default auth links
 */
export const defaultAuthLinks: Required<AuthLinks> = {
  signIn: "/signin",
  signUp: "/signup",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  callback: "/callback",
  home: "/",
  defaultRedirect: "/dashboard",
};
