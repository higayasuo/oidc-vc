import { RandomBytes } from '@/types';
import { encodeBase64Url } from 'u8a-utils';
import { sha256 } from '@noble/hashes/sha256';

/**
 * Result of PKCE (Proof Key for Code Exchange) generation.
 * @typedef {Object} GeneratePkceResult
 * @property {string} codeVerifier - The code verifier, a random string used in PKCE.
 * @property {string} codeChallenge - The code challenge, derived from the code verifier.
 */
type GeneratePkceResult = {
  codeVerifier: string;
  codeChallenge: string;
};

/**
 * Generates a PKCE (Proof Key for Code Exchange) pair consisting of a code verifier and a code challenge.
 *
 * @param {RandomBytes} randomBytes - A function to generate random bytes.
 * @param {number} [byteLength=32] - The number of random bytes to generate for the code verifier. Defaults to 32.
 * @returns {GeneratePkceResult} An object containing the code verifier and code challenge.
 */
export const pkce = (
  randomBytes: RandomBytes,
  byteLength: number = 32
): GeneratePkceResult => {
  const codeVerifierBytes = randomBytes(byteLength);
  const codeChallengeBytes = sha256(codeVerifierBytes);

  return {
    codeVerifier: encodeBase64Url(codeVerifierBytes),
    codeChallenge: encodeBase64Url(codeChallengeBytes),
  };
};
