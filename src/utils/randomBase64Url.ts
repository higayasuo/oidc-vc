import { RandomBytes } from '@/types';
import { encodeBase64Url } from 'u8a-utils';

/**
 * Generates a random base64 URL-encoded string.
 *
 * @param {RandomBytes} randomBytes - A function to generate random bytes.
 * @param {number} [byteLength=32] - The number of random bytes to generate. Defaults to 32.
 * @returns {string} A base64 URL-encoded string representation of the random bytes.
 */
export const randomBase64Url = (
  randomBytes: RandomBytes,
  byteLength: number = 32
): string => {
  const bytes = randomBytes(byteLength);
  return encodeBase64Url(bytes);
};
