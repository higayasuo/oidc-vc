import { fetchJson } from '@/utils/fetchJson';
import { JwksResponse, jwksResponseSchema, Jwk } from './JwksResponse';

/**
 * Fetches a JSON Web Key Set (JWKS) from the specified URI and validates it against the JWKS schema.
 *
 * This function retrieves the JWKS from the given URI and ensures that the response conforms to the expected schema.
 *
 * @param {string} jwksUri - The URI from which to fetch the JWKS.
 * @returns {Promise<Jwk[]>} A promise that resolves to an array of JSON Web Keys (JWKs).
 * @throws Will throw an error if the fetch operation fails, HTTP status is not 200, or if the response does not conform to the expected schema.
 */
export const fetchJwks = async (jwksUri: string): Promise<Jwk[]> => {
  const response = await fetchJson<JwksResponse>({
    url: jwksUri,
    schema: jwksResponseSchema,
  });

  return response.keys;
};
