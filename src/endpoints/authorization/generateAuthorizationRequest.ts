import { generateState } from '../../utils/generateState';
import { generatePkce } from '../../utils/generatePkce';
import type { RandomBytes } from '@/types';

/**
 * Parameters for generating an authorization request.
 * Based on OAuth 2.0 Authorization Request Parameters (RFC 6749).
 */
export type AuthorizationRequestParams = {
  /** The authorization server's authorization endpoint URL */
  authorizationEndpoint: string;
  /** The client identifier */
  clientId: string;
  /** The redirect URI where the authorization server will send the user after authorization */
  redirectUri: string;
  /** The scope of the access request */
  scope?: string;
  /** The response type (usually 'code' for authorization code flow) */
  responseType?: string;
  /** Optional additional parameters */
  additionalParams?: Record<string, string>;
};

type GenerateAuthorizationRequestResult = {
  url: URL;
  codeVerifier: string;
};

/**
 * Generates a complete authorization request URL with PKCE (Proof Key for Code Exchange).
 * PKCE is required for OAuth 2.1 compliance and provides protection against authorization code interception attacks.
 *
 * @param {AuthorizationRequestParams} params - Parameters for the authorization request
 * @param {RandomBytes} randomBytes - Function to generate random bytes
 * @returns {GenerateAuthorizationRequestResult} Object containing URL, code_verifier, and code_challenge
 *
 * @example
 * ```typescript
 * const result = generateAuthorizationRequest({
 *   authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
 *   clientId: 'your-client-id',
 *   redirectUri: 'https://your-app.com/callback',
 *   scope: 'openid email profile'
 * }, crypto.getRandomValues);
 *
 * // Use the URL for authorization request
 * console.log(result.url.toString());
 *
 * // Save code_verifier for token exchange
 * console.log(result.codeVerifier);
 * ```
 */
export const generateAuthorizationRequest = (
  {
    authorizationEndpoint,
    clientId,
    redirectUri,
    scope = 'openid',
    responseType = 'code',
    additionalParams = {},
  }: AuthorizationRequestParams,
  randomBytes: RandomBytes
): GenerateAuthorizationRequestResult => {
  // Generate state
  const state = generateState(randomBytes);

  // Generate PKCE
  const { codeVerifier, codeChallenge } = generatePkce(randomBytes);

  // Build the authorization request URL
  const url = new URL(authorizationEndpoint);

  // Required parameters
  url.searchParams.set('response_type', responseType);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('scope', scope);
  url.searchParams.set('state', state);

  // PKCE parameters
  url.searchParams.set('code_challenge', codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');

  // Additional parameters
  Object.entries(additionalParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return { url, codeVerifier };
};
