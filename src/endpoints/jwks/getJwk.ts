import { Jwk } from './JwksResponse';

/**
 * Retrieves a JSON Web Key (JWK) from a set of JWKs based on the provided key ID (kid).
 *
 * If no kid is provided and there is exactly one JWK in the set, that JWK is returned.
 * If no kid is provided and there are multiple JWKs, an error is thrown.
 * If a kid is provided but no matching JWK is found, an error is thrown.
 *
 * @param {Jwk[]} jwks - An array of JSON Web Keys (JWKs).
 * @param {string | undefined} kid - The key ID to search for in the JWK set.
 * @returns {Jwk} The JWK that matches the provided kid, or the only JWK if no kid is provided and there is exactly one JWK.
 * @throws Will throw an error if no kid is provided and there are multiple JWKs, or if a kid is provided but no matching JWK is found.
 */
export const getJwk = (jwks: Jwk[], kid: string | undefined): Jwk => {
  if (kid == null) {
    if (jwks.length === 1) {
      return jwks[0];
    }

    throw new Error('No kid provided and more than one JWK found');
  }

  const jwk = jwks.find((jwk) => jwk.kid === kid);

  if (!jwk) {
    throw new Error(`JWK with kid "${kid}" not found`);
  }

  return jwk;
};
