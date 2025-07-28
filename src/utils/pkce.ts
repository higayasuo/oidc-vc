import { RandomBytes } from '@/types';
import { encodeBase64Url } from 'u8a-utils';
import { sha256 } from '@noble/hashes/sha256';

const encoder = new TextEncoder();

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
 * Generates a code verifier for PKCE (Proof Key for Code Exchange).
 *
 * This function creates a cryptographically random string that will be used as the code verifier
 * in the PKCE flow. The code verifier is Base64URL-encoded and meets RFC 7636 requirements.
 *
 * @param {RandomBytes} randomBytes - A function to generate random bytes.
 * @param {number} [byteLength=32] - The number of random bytes to generate. Defaults to 32.
 * @returns {string} A Base64URL-encoded code verifier string.
 *
 * @example
 * ```typescript
 * const codeVerifier = generateCodeVerifier(crypto.getRandomValues, 32);
 * console.log(codeVerifier); // "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"
 * ```
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc7636#section-4.1 RFC 7636 Section 4.1}
 */
export const generateCodeVerifier = (
  randomBytes: RandomBytes,
  byteLength: number = 32
): string => {
  const codeVerifierBytes = randomBytes(byteLength);
  return encodeBase64Url(codeVerifierBytes);
};

/**
 * Generates a code challenge from a code verifier using SHA256.
 *
 * This function takes a code verifier and computes its SHA256 hash, then encodes the result
 * in Base64URL format. This implements the S256 code challenge method as specified in RFC 7636.
 *
 * @param {string} codeVerifier - The code verifier string to derive the challenge from.
 * @returns {string} A Base64URL-encoded code challenge string.
 *
 * @example
 * ```typescript
 * const codeVerifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
 * const codeChallenge = generateCodeChallenge(codeVerifier);
 * console.log(codeChallenge); // "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"
 * ```
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc7636#section-4.2 RFC 7636 Section 4.2}
 */
export const generateCodeChallenge = (codeVerifier: string): string => {
  const codeChallengeBytes = sha256(encoder.encode(codeVerifier));
  return encodeBase64Url(codeChallengeBytes);
};

/**
 * Generates a PKCE (Proof Key for Code Exchange) pair consisting of a code verifier and a code challenge.
 *
 * This function implements the PKCE flow as specified in RFC 7636. It generates a cryptographically
 * random code verifier and derives a corresponding code challenge using SHA256. The code verifier
 * is sent to the authorization server in the token request, while the code challenge is sent in
 * the authorization request.
 *
 * The generated strings are Base64URL-encoded and meet RFC 7636 requirements:
 * - Code verifier: 43-128 characters, A-Z, a-z, 0-9, -, _, .
 * - Code challenge: 43 characters, A-Z, a-z, 0-9, -, _, .
 *
 * @param {RandomBytes} randomBytes - A function to generate random bytes.
 * @param {number} [byteLength=32] - The number of random bytes to generate for the code verifier. Defaults to 32.
 * @returns {GeneratePkceResult} An object containing the code verifier and code challenge.
 *
 * @example
 * ```typescript
 * const { codeVerifier, codeChallenge } = pkce(crypto.getRandomValues, 32);
 *
 * // Use codeChallenge in authorization request
 * const authUrl = `${authEndpoint}?code_challenge=${codeChallenge}&code_challenge_method=S256`;
 *
 * // Store codeVerifier for token request
 * localStorage.setItem('codeVerifier', codeVerifier);
 * ```
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc7636 RFC 7636 - PKCE}
 * @see {@link https://datatracker.ietf.org/doc/html/rfc7636#section-4.1 RFC 7636 Section 4.1 - Code Verifier}
 * @see {@link https://datatracker.ietf.org/doc/html/rfc7636#section-4.2 RFC 7636 Section 4.2 - Code Challenge}
 */
export const pkce = (
  randomBytes: RandomBytes,
  byteLength: number = 32
): GeneratePkceResult => {
  const codeVerifier = generateCodeVerifier(randomBytes, byteLength);
  const codeChallenge = generateCodeChallenge(codeVerifier);

  return {
    codeVerifier,
    codeChallenge,
  };
};
