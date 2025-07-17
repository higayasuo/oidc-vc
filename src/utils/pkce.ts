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
