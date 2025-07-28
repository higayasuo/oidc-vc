import { extractKeyBitsFromAlg } from './extractKeyBitsFromAlg';
import { sha256 } from '@noble/hashes/sha256';
import { sha512, sha384 } from '@noble/hashes/sha512';

/**
 * Type representing a SHA function.
 */
type ShaFunc = (data: Uint8Array) => Uint8Array;

/**
 * Returns the appropriate SHA function based on the algorithm string.
 *
 * This function determines the key size from the algorithm string and returns
 * the corresponding SHA function. Supported key sizes are 256, 384, and 512 bits.
 * EdDSA and Ed25519 algorithms use SHA-512.
 *
 * @param {string} alg - The algorithm string from which to determine the SHA function.
 * @returns {ShaFunc} The SHA function corresponding to the key size.
 * @throws {Error} If the key size is unsupported.
 */
export const getShaFuncFromAlg = (alg: string): ShaFunc => {
  // Special handling for EdDSA algorithms
  if (alg === 'EdDSA' || alg === 'Ed25519') {
    return sha512;
  }

  const keyBits = extractKeyBitsFromAlg(alg);

  switch (keyBits) {
    case 256:
      return sha256;
    case 384:
      return sha384;
    case 512:
      return sha512;
    default:
      throw new Error(`Unsupported key size: ${keyBits} bits`);
  }
};
