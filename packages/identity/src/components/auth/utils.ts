/**
 * Sanitize error messages to hide internal/technical details from users.
 * Returns a user-friendly message for known error patterns.
 */
export function sanitizeAuthError(message: string): string {
  const lowerMessage = message.toLowerCase();

  // User already exists - common signup error
  if (
    lowerMessage.includes("user already registered") ||
    lowerMessage.includes("already registered") ||
    lowerMessage.includes("already exists") ||
    lowerMessage.includes("email already") ||
    lowerMessage.includes("duplicate")
  ) {
    return "An account with this email already exists. Please sign in instead.";
  }

  // Invalid credentials
  if (
    lowerMessage.includes("invalid login credentials") ||
    lowerMessage.includes("invalid credentials") ||
    lowerMessage.includes("wrong password") ||
    lowerMessage.includes("incorrect password")
  ) {
    return "Invalid email or password. Please try again.";
  }

  // Known user-friendly errors - pass through
  if (
    lowerMessage.includes("invalid email") ||
    lowerMessage.includes("password")
  ) {
    return message;
  }

  // Email format error
  if (message === "The string did not match the expected pattern.") {
    return "Please check your email address format and try again.";
  }

  // Rate limiting
  if (
    lowerMessage.includes("rate limit") ||
    lowerMessage.includes("too many requests") ||
    lowerMessage.includes("try again later")
  ) {
    return "Too many attempts. Please wait a moment and try again.";
  }

  // Internal/technical errors - hide details
  if (
    lowerMessage.includes("hook") ||
    lowerMessage.includes("authorization") ||
    lowerMessage.includes("token") ||
    lowerMessage.includes("internal") ||
    lowerMessage.includes("server") ||
    lowerMessage.includes("database") ||
    lowerMessage.includes("connection")
  ) {
    return "An error occurred. Please try again.";
  }

  // Default fallback for any other unrecognized errors
  return "An error occurred. Please try again.";
}

/**
 * Sanitize signup-specific errors with context-appropriate messages.
 */
export function sanitizeSignupError(message: string): string {
  const sanitized = sanitizeAuthError(message);
  // Replace generic message with signup-specific one
  if (sanitized === "An error occurred. Please try again.") {
    return "An error occurred during sign up. Please try again.";
  }
  return sanitized;
}

/**
 * Sanitize signin-specific errors with context-appropriate messages.
 */
export function sanitizeSigninError(message: string): string {
  const sanitized = sanitizeAuthError(message);
  // Replace generic message with signin-specific one
  if (sanitized === "An error occurred. Please try again.") {
    return "An error occurred during sign in. Please try again.";
  }
  return sanitized;
}
