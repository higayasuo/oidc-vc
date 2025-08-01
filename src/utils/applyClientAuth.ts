import { buildBasicCredentials } from './buildBasicCredentials';

/**
 * Client authentication parameters
 */
export type ClientAuth = {
  /** The OAuth 2.0 client identifier */
  clientId: string;
  /** The OAuth 2.0 client secret (optional) */
  clientSecret?: string;
  /** The client assertion type (optional) */
  clientAssertionType?: string;
  /** The client assertion (optional) */
  clientAssertion?: string;
};

/**
 * Applies client authentication to the request
 *
 * This function handles different client authentication methods for OAuth 2.0 requests:
 * - HTTP Basic authentication (when clientSecret is provided)
 * - Client ID in request parameters (when clientSecret is not provided)
 * - Client assertion (when clientAssertion is provided)
 *
 * The function modifies the provided URLSearchParams and headers objects directly.
 * Client secret takes precedence over client assertion when both are provided.
 *
 * @param params - The URLSearchParams object to modify (for client_id, client_assertion, etc.)
 * @param headers - The headers object to modify (for Authorization header)
 * @param clientAuth - Client authentication parameters
 * @returns void (modifies the provided params and headers objects)
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc6749#section-2.3 RFC 6749 Section 2.3 - Client Authentication}
 * @see {@link https://datatracker.ietf.org/doc/html/rfc7521 RFC 7521 - Assertion Framework}
 */
export const applyClientAuth = (
  params: URLSearchParams,
  headers: Record<string, string>,
  { clientId, clientSecret, clientAssertionType, clientAssertion }: ClientAuth
): void => {
  // Handle Basic authentication
  if (clientSecret != null) {
    headers.Authorization = buildBasicCredentials(clientId, clientSecret);
    return;
  }

  params.set('client_id', clientId);

  // Handle client assertion first (highest priority)
  if (clientAssertion) {
    if (clientAssertionType) {
      params.set('client_assertion_type', clientAssertionType);
    }
    params.set('client_assertion', clientAssertion);
  }
};
