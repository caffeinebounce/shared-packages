/**
 * Example brand configurations for development preview.
 * These demonstrate how to configure the templates for different apps.
 */

import type { BrandConfig } from "../src/types/brand";

/**
 * Acme App - Default example brand
 */
export const acmeBrand: BrandConfig = {
  name: "Acme App",
  tagline: "by Acme Corp",
  companyName: "Acme Corporation",
  logoUrl: "https://placehold.co/56x56/047857/ffffff?text=A",
  logoWidth: 56,
  logoHeight: 56,
  logoAlt: "Acme Logo",
  primaryColor: "#047857", // emerald-700
  baseUrl: "https://acme.example.com",
  supportEmail: "support@acme.example.com",
  address: {
    street: "123 Innovation Way",
    city: "San Francisco",
    state: "CA",
    zip: "94102",
    country: "United States",
  },
  socialLinks: {
    website: "https://acme.example.com",
    twitter: "https://twitter.com/acme",
  },
};

/**
 * Capital Compass - Real world example
 */
export const capitalCompassBrand: BrandConfig = {
  name: "Capital Compass",
  tagline: "by The Capital Collective",
  companyName: "The Capital Collective",
  logoUrl: "https://thecapitalcompass.ai/logo.png",
  logoWidth: 56,
  logoHeight: 56,
  logoAlt: "Capital Compass",
  primaryColor: "#047857", // emerald-700
  baseUrl: "https://thecapitalcompass.ai",
  supportEmail: "support@thecapitalcollective.org",
  address: {
    street: "344 Maple Ave, W Suite 343",
    city: "Vienna",
    state: "VA",
    zip: "22180",
    country: "United States",
  },
  socialLinks: {
    website: "https://thecapitalcollective.org",
    linkedin: "https://linkedin.com/company/thecapitalcollective",
  },
};

/**
 * Startup Kit - Colorful example
 */
export const startupKitBrand: BrandConfig = {
  name: "Startup Kit",
  tagline: "Launch faster",
  companyName: "Startup Kit Inc.",
  logoUrl: "https://placehold.co/56x56/6366f1/ffffff?text=SK",
  logoWidth: 56,
  logoHeight: 56,
  logoAlt: "Startup Kit",
  primaryColor: "#6366f1", // Indigo
  baseUrl: "https://startupkit.example.com",
  supportEmail: "hello@startupkit.example.com",
  address: {
    street: "456 Tech Blvd",
    city: "Austin",
    state: "TX",
    zip: "78701",
    country: "United States",
  },
  socialLinks: {
    website: "https://startupkit.example.com",
    twitter: "https://twitter.com/startupkit",
    github: "https://github.com/startupkit",
  },
};
