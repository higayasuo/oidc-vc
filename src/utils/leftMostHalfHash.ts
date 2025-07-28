import { encodeBase64Url } from 'u8a-utils';
import { getShaFuncFromAlg } from './getShaFuncFromAlg';

const encoder = new TextEncoder();

/**
 * Computes the left-most half of the hash for a given data string using the specified algorithm
 * and returns it as a Base64URL-encoded string.
 *
 * This function is commonly used in OAuth 2.0 and OpenID Connect for generating token hashes
 * such as `at_hash` (access token hash) and `s_hash` (state hash). The function encodes the
 * input data string into a Uint8Array, computes its hash using the specified algorithm, takes
 * the left-most half of the resulting hash, and returns it as a Base64URL-encoded string.
 *
 * The function supports various algorithms including:
 * - SHA-256 algorithms: ES256, RS256, PS256, HS256, ES256K
 * - SHA-384 algorithms: ES384, RS384, PS384, HS384
 * - SHA-512 algorithms: ES512, RS512, PS512, HS512
 * - EdDSA algorithms: EdDSA, Ed25519 (use SHA-512)
 *
 * @param {string} data - The input data string to be hashed. This is typically a token or state value.
 * @param {string} alg - The algorithm string used to determine the SHA function. Must be a valid JWT algorithm.
 * @returns {string} The left-most half of the computed hash encoded as a Base64URL string. The length will be:
 *   - SHA-256 algorithms: 22 characters (16 bytes encoded)
 *   - SHA-384 algorithms: 32 characters (24 bytes encoded)
 *   - SHA-512 algorithms: 43 characters (32 bytes encoded)
 *   - EdDSA algorithms: 43 characters (32 bytes encoded, uses SHA-512)
 * @throws {Error} If the algorithm is invalid or unsupported.
 *
 * @example
 * ```typescript
 * // Generate at_hash for ES256 algorithm
 * const atHash = leftMostHalfHash(accessToken, 'ES256');
 * // Returns: "xsZZrUssMXjL3FBlzoSh2g"
 *
 * // Generate s_hash for RS384 algorithm
 * const sHash = leftMostHalfHash(state, 'RS384');
 * // Returns: "adt46pcdiB-l6eTNifgoVM-5AIJAxq84"
 *
 * // Generate hash for EdDSA algorithm
 * const edDsaHash = leftMostHalfHash(token, 'EdDSA');
 * // Returns: "p2LHG4H-8pYDc0hyVOo3iIHvZJUqe9tbj3jESOuXbkY"
 * ```
 */
export const leftMostHalfHash = (data: string, alg: string): string => {
  const shaFunc = getShaFuncFromAlg(alg);
  const hash = shaFunc(encoder.encode(data));
  const halfHash = hash.slice(0, hash.length / 2);

  return encodeBase64Url(halfHash);
};
