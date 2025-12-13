/**
 * Generate cryptographically secure recovery codes
 * Uses crypto.getRandomValues() for secure random number generation
 */
export function generateRecoveryCodes(count = 10): string[] {
  return Array.from({ length: count }, () => {
    // Generate 8 random bytes (will give us enough randomness for the code)
    const array = new Uint8Array(8);
    crypto.getRandomValues(array);

    // Convert to base36-like format (alphanumeric)
    const part1 = Array.from(array.slice(0, 4))
      .map((byte) => byte.toString(36).padStart(2, "0"))
      .join("")
      .substring(0, 4);
    const part2 = Array.from(array.slice(4, 8))
      .map((byte) => byte.toString(36).padStart(2, "0"))
      .join("")
      .substring(0, 4);

    return `${part1}-${part2}`.toUpperCase();
  });
}
