/**
 * Returns current timestamp in ISO format
 * Use for created_at, updated_at, etc.
 */
export function now(): string {
  return new Date().toISOString();
}
