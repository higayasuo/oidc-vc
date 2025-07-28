/**
 * Extracts the key size in bits from an algorithm string.
 *
 * This function searches for a three-digit number within the algorithm string,
 * which typically represents the key size in bits. If no such number is found,
 * an error is thrown.
 *
 * @param {string} alg - The algorithm string from which to extract the key size.
 * @returns {number} The key size in bits extracted from the algorithm string.
 * @throws {Error} If the algorithm string does not contain a valid key size.
 */
export const extractKeyBitsFromAlg = (alg: string): number => {
  if (alg === 'EdDSA' || alg === 'Ed25519') {
    return 512;
  }

  const match = alg.match(/(\d{3})(?!.*\d)/);

  if (!match) {
    throw new Error(`Invalid algorithm: ${alg}`);
  }

  return parseInt(match[1], 10);
};
