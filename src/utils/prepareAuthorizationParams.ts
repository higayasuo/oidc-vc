import { randomBase64Url } from '@/utils/randomBase64Url';
import { pkce } from '@/utils/pkce';
import type { RandomBytes } from '@/types';

/**
 * Parameters for preparing an authorization request parameters.
 * This function can be used for both authorization endpoints and PAR (Pushed Authorization Request) endpoints.
 * Based on OAuth 2.0 Authorization Request Parameters (RFC 6749) and PAR (RFC 9126).
 */
export type PrepareAuthorizationParamsParams = {
  /** The redirect URI where the authorization server will send the user after authorization */
  redirectUri: string;
  /** The scope of the access request */
  scope?: string;
  /** The response type (usually 'code' for authorization code flow) */
  responseType?: string;
};

/**
 * Result of preparing an authorization request parameters.
 * This result can be used for both authorization endpoints and PAR endpoints.
 */
export type PrepareAuthorizationParamsResult = {
  /** The authorization request URL parameters */
  params: URLSearchParams;
  /** The code verifier used for PKCE */
  codeVerifier: string;
  /** The state parameter to maintain state between the request and callback */
  state: string;
  /** The scope included in the authorization request */
  scope: string;
  /** The nonce value for OpenID Connect requests, if applicable */
  nonce: string | undefined;
};

/**
 * Prepares a complete authorization request parameters with PKCE (Proof Key for Code Exchange).
 *
 * PKCE is required for OAuth 2.1 compliance and provides protection against authorization code interception attacks.
 *
 * @param {PrepareAuthorizationParamsParams} params - Parameters for the authorization request
 * @param {RandomBytes} randomBytes - Function to generate random bytes
 * @returns {PrepareAuthorizationRequestResult} Object containing URL, headers, and security parameters
 */
export const prepareAuthorizationParams = (
  {
    redirectUri,
    scope = 'openid',
    responseType = 'code',
  }: PrepareAuthorizationParamsParams,
  randomBytes: RandomBytes
): PrepareAuthorizationParamsResult => {
  const state = randomBase64Url(randomBytes);
  const { codeVerifier, codeChallenge } = pkce(randomBytes);
  const params = new URLSearchParams();

  params.set('response_type', responseType);
  params.set('redirect_uri', redirectUri);
  params.set('scope', scope);
  params.set('state', state);
  params.set('code_challenge', codeChallenge);
  params.set('code_challenge_method', 'S256');

  const hasOpenIdScope = scope.includes('openid');
  const nonce = hasOpenIdScope ? randomBase64Url(randomBytes) : undefined;

  if (hasOpenIdScope && nonce) {
    params.set('nonce', nonce);
  }

  return { params, codeVerifier, state, scope, nonce };
};
