import { RandomBytes } from '@/types';
import { encodeBase64Url } from 'u8a-utils';
import { sha256 } from '@noble/hashes/sha256';

/**
 * Represents the result of generating PKCE (Proof Key for Code Exchange).
 *
 * @typedef {Object} GeneratePkceResult
 * @property {string} codeVerifier - The code verifier as a Base64URL string.
 * @property {string} codeChallenge - The code challenge as a Base64URL string.
 */
type GeneratePkceResult = {
  codeVerifier: string;
  codeChallenge: string;
};

/**
 * Generates PKCE (Proof Key for Code Exchange) code_verifier and code_challenge.
 *
 * @param {RandomBytes} randomBytes - Function to generate random bytes
 * @param {number} [byteLength=32] - Number of bytes to generate for code_verifier (default: 32)
 * @returns {GeneratePkceResult} Object containing code_verifier and code_challenge as Base64URL strings
 */
export const generatePkce = (randomBytes: RandomBytes, byteLength: number = 32): GeneratePkceResult => {
  // Generate code_verifier as random bytes
  const codeVerifierBytes = randomBytes(byteLength);

  // Generate code_challenge as SHA256 hash of code_verifier
  const codeChallengeBytes = sha256(codeVerifierBytes);

  // Convert both to Base64URL format
  return {
    codeVerifier: encodeBase64Url(codeVerifierBytes),
    codeChallenge: encodeBase64Url(codeChallengeBytes)
  };
};