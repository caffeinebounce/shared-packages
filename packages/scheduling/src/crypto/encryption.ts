/**
 * AES-256-GCM encryption for sensitive data at rest (advisor OAuth access /
 * refresh tokens, calendar credentials).
 *
 * Ported from the factory-careers production implementation. Uses HKDF-SHA-256
 * to derive a 256-bit key from the application secret with a fixed info label
 * scoped to this package — so the AES key is cryptographically distinct from
 * any other key derived from the same secret. Each encryption uses a fresh
 * random IV (12 bytes) + auth tag (16 bytes).
 *
 * Format: base64(iv ‖ authTag ‖ ciphertext)
 *
 * The secret is supplied per-call (sourced from `SchedulingConfig.encryptionSecret`)
 * and never stored in the database alongside the ciphertext.
 */
import {
  createCipheriv,
  createDecipheriv,
  hkdfSync,
  randomBytes,
} from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const HKDF_INFO = "caffeinebounce-scheduling-v1";

/**
 * Derive a 256-bit AES key from `secret` via HKDF-SHA-256. The info label scopes
 * the key exclusively to this package's at-rest encryption.
 */
function deriveKey(secret: string): Buffer {
  return Buffer.from(hkdfSync("sha256", secret, "", HKDF_INFO, 32));
}

/**
 * Encrypt `plaintext` with AES-256-GCM.
 * Returns base64(IV ‖ AuthTag ‖ Ciphertext).
 */
export function encrypt(plaintext: string, secret: string): string {
  const key = deriveKey(secret);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf-8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

/**
 * Decrypt a base64(IV ‖ AuthTag ‖ Ciphertext) value produced by {@link encrypt}.
 * Returns `null` for tampered data or an unrecognised format (never throws).
 */
export function decrypt(
  encryptedBase64: string,
  secret: string,
): string | null {
  try {
    const combined = Buffer.from(encryptedBase64, "base64");
    if (combined.length < IV_LENGTH + AUTH_TAG_LENGTH) return null;

    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const ciphertext = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = createDecipheriv(ALGORITHM, deriveKey(secret), iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]).toString("utf-8");
  } catch {
    return null;
  }
}
