/**
 * Deployment environment detection utility
 *
 * Detects the deployment environment based on hostname patterns.
 * This allows distinguishing between:
 * - development: Local development (localhost, etc.)
 * - preview: PR preview deployments (e.g., compass-pr-123.onrender.com)
 * - production: Production deployment
 */

export type DeploymentEnvironment = "development" | "preview" | "production";

/**
 * Detect deployment environment from hostname
 *
 * @param hostname - The request hostname (e.g., from request.headers.host)
 * @returns The detected deployment environment
 */
export function detectDeploymentEnvironment(
  hostname?: string | null,
): DeploymentEnvironment {
  // Development if NODE_ENV is not production
  if (process.env.NODE_ENV !== "production") {
    return "development";
  }

  // Check for PR preview patterns
  if (hostname) {
    // Render PR previews: compass-pr-123.onrender.com
    if (/^compass-pr-\d+\.onrender\.com$/i.test(hostname)) {
      return "preview";
    }

    // Vercel previews: project-abc123.vercel.app or *.vercel.app with preview branch
    if (
      hostname.includes(".vercel.app") &&
      !hostname.startsWith("compass.") &&
      !hostname.startsWith("www.")
    ) {
      return "preview";
    }

    // Netlify previews: deploy-preview-123--sitename.netlify.app
    if (/deploy-preview-\d+--.*\.netlify\.app$/i.test(hostname)) {
      return "preview";
    }

    // Generic preview pattern: any hostname containing "-pr-" or "-preview"
    if (/-pr-\d+\.|\.preview\./i.test(hostname)) {
      return "preview";
    }
  }

  // Check environment variables for preview indicators
  // Render sets IS_PULL_REQUEST=true for PR deployments
  if (process.env.IS_PULL_REQUEST === "true") {
    return "preview";
  }

  // Vercel sets VERCEL_ENV to 'preview' for preview deployments
  if (process.env.VERCEL_ENV === "preview") {
    return "preview";
  }

  // Default to production
  return "production";
}

/**
 * Get the deployment environment for the current context
 * Uses cached detection to avoid repeated hostname parsing
 */
let cachedEnvironment: DeploymentEnvironment | null = null;
let cachedHostname: string | null = null;

export function getDeploymentEnvironment(
  hostname?: string | null,
): DeploymentEnvironment {
  // If hostname changed, re-detect
  if (hostname !== cachedHostname) {
    cachedHostname = hostname ?? null;
    cachedEnvironment = detectDeploymentEnvironment(hostname);
  }

  return cachedEnvironment ?? detectDeploymentEnvironment(hostname);
}

/**
 * Clear the cached environment (useful for testing)
 */
export function clearEnvironmentCache(): void {
  cachedEnvironment = null;
  cachedHostname = null;
}
