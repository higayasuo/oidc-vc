import { leftMostHalfHash } from './leftMostHalfHash';

type ValidateLeftMostHalfHashParams = {
  hash: unknown;
  data: string;
  alg: string;
};

/**
 * Validates that a given hash matches the expected left-most half hash for the provided data and algorithm.
 *
 * This function is commonly used in OAuth 2.0 and OpenID Connect to validate token hashes
 * such as `at_hash` (access token hash) and `s_hash` (state hash). It computes the expected
 * left-most half hash using the same algorithm and data, then compares it with the provided hash.
 *
 * The function supports various algorithms including:
 * - SHA-256 algorithms: ES256, RS256, PS256, HS256, ES256K
 * - SHA-384 algorithms: ES384, RS384, PS384, HS384
 * - SHA-512 algorithms: ES512, RS512, PS512, HS512
 * - EdDSA algorithms: EdDSA, Ed25519 (use SHA-512)
 *
 * @param {ValidateLeftMostHalfHashParams} params - The validation parameters.
 * @param {unknown} params.hash - The hash string to validate. This should be a Base64URL-encoded string.
 * @param {string} params.data - The original data string that was used to generate the hash.
 * @param {string} params.alg - The algorithm string used to determine the SHA function. Must be a valid JWT algorithm.
 * @throws {Error} If the provided hash does not match the expected hash. The error message includes:
 *   - The original data and algorithm used
 *   - The expected hash value
 *   - The received hash value
 *
 * @example
 * ```typescript
 * // Validate at_hash for ES256 algorithm
 * validateLeftMostHalfHash({
 *   hash: 'xsZZrUssMXjL3FBlzoSh2g',
 *   data: accessToken,
 *   alg: 'ES256'
 * });
 *
 * // Validate s_hash for RS384 algorithm
 * validateLeftMostHalfHash({
 *   hash: 'adt46pcdiB-l6eTNifgoVM-5AIJAxq84',
 *   data: state,
 *   alg: 'RS384'
 * });
 *
 * // Validate hash for EdDSA algorithm
 * validateLeftMostHalfHash({
 *   hash: 'p2LHG4H-8pYDc0hyVOo3iIHvZJUqe9tbj3jESOuXbkY',
 *   data: token,
 *   alg: 'EdDSA'
 * });
 * ```
 */
export const validateLeftMostHalfHash = ({
  hash,
  data,
  alg,
}: ValidateLeftMostHalfHashParams): void => {
  if (!hash) {
    throw new Error('hash is missing');
  }

  if (typeof hash !== 'string') {
    throw new Error('hash must be a string');
  }

  const expectedHash = leftMostHalfHash(data, alg);

  if (hash !== expectedHash) {
    throw new Error(
      `Hash validation failed for data: "${data}" and algorithm: "${alg}"\n` +
        `Expected: "${expectedHash}"\n` +
        `Received: "${hash}"`
    );
  }
};
