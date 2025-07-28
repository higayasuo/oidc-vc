import { TokenResponse, tokenResponseSchema } from './TokenResponse';
import { buildBasicCredentials } from '../../utils/buildBasicCredentials';
import { fetchJson } from '../../utils/fetchJson';

/**
 * Parameters for the fetchToken function.
 */
type FetchTokenParams = {
  /** The token endpoint URL where the token request will be sent */
  tokenEndpoint: string;
  /** The OAuth 2.0 client identifier */
  clientId: string;
  /** The OAuth 2.0 client secret. If provided, will be used for Basic authentication */
  clientSecret?: string;
  /** The authorization code received from the authorization server */
  code: string;
  /** The PKCE code verifier that was used to generate the authorization request */
  codeVerifier: string;
  /** The redirect URI that was used in the authorization request */
  redirectUri: string;
  /** The grant type. Currently only supports 'authorization_code' */
  grantType: 'authorization_code';
  /** Additional parameters to include in the token request */
  additionalParams?: Record<string, string>;
};

/**
 * Fetches an access token from the OAuth 2.0 token endpoint using the authorization code flow.
 *
 * This function implements the OAuth 2.0 authorization code flow with PKCE support.
 * It handles both client authentication methods:
 * - HTTP Basic authentication (when clientSecret is provided)
 * - Client ID in request body (when clientSecret is not provided)
 *
 * The function automatically validates the response using the TokenResponse schema
 * and handles various error conditions including HTTP errors and schema validation failures.
 *
 * @param params - Configuration parameters for the token request
 * @param params.tokenEndpoint - The token endpoint URL where the request will be sent
 * @param params.clientId - The OAuth 2.0 client identifier
 * @param params.clientSecret - The OAuth 2.0 client secret (optional, used for Basic auth)
 * @param params.code - The authorization code received from the authorization server
 * @param params.codeVerifier - The PKCE code verifier used in the authorization request
 * @param params.redirectUri - The redirect URI that was used in the authorization request
 * @param params.grantType - The grant type (currently only 'authorization_code' is supported)
 * @param params.additionalParams - Additional parameters to include in the token request
 * @returns A promise that resolves to the validated token response
 * @throws Will throw an error if the request fails, HTTP status is not 200, or if the response does not conform to the expected schema
 *
 * @example
 * ```typescript
 * // With client secret (Basic authentication)
 * const tokenResponse = await fetchToken({
 *   tokenEndpoint: 'https://auth.example.com/token',
 *   clientId: 'my-client-id',
 *   clientSecret: 'my-client-secret',
 *   code: 'authorization-code-from-server',
 *   codeVerifier: 'pkce-code-verifier',
 *   redirectUri: 'https://my-app.com/callback',
 *   grantType: 'authorization_code',
 * });
 *
 * console.log(tokenResponse.access_token);
 * ```
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.3 RFC 6749 Section 4.1.3 - Access Token Request}
 * @see {@link https://datatracker.ietf.org/doc/html/rfc7636 RFC 7636 - PKCE}
 */
export const fetchToken = async ({
  tokenEndpoint,
  clientId,
  clientSecret,
  code,
  codeVerifier,
  redirectUri,
  grantType,
  additionalParams,
}: FetchTokenParams): Promise<TokenResponse> => {
  // Prepare request body
  const body = new URLSearchParams({
    grant_type: grantType,
    code,
    code_verifier: codeVerifier,
    redirect_uri: redirectUri,
    ...additionalParams,
  });

  // Prepare headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  if (clientSecret == null) {
    body.append('client_id', clientId);
  } else {
    headers.Authorization = buildBasicCredentials(clientId, clientSecret);
  }

  // Make the request using fetchJson
  return fetchJson({
    url: tokenEndpoint,
    schema: tokenResponseSchema,
    method: 'POST',
    headers,
    body: body.toString(),
  });
};
