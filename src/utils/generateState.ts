import { RandomBytes } from "@/types";
import { encodeHex } from 'u8a-utils';

/**
 * Generates a cryptographically secure state parameter for OAuth/OIDC flows.
 * Returns a hex-encoded string of random bytes for CSRF protection.
 *
 * @param {RandomBytes} randomBytes - Function to generate random bytes
 * @param {number} [byteLength=32] - Number of bytes to generate (default: 32)
 * @returns {string} Hex-encoded state parameter
 */
export const generateState = (randomBytes: RandomBytes, byteLength: number = 32): string => {
  const bytes = randomBytes(byteLength);
  return encodeHex(bytes);
};