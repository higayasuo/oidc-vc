import type { RandomBytes } from '@/types';
import { applyAdditionalParams } from '@/utils/applyAdditionalParams';
import {
  prepareAuthorizationParams,
  type PrepareAuthorizationParamsParams,
  type PrepareAuthorizationParamsResult,
} from '@/utils/prepareAuthorizationParams';

export type PrepareAuthorizationRequestParams = {
  /** The URL of the authorization endpoint */
  endpoint: string;
  /** The client identifier issued to the client during the registration process */
  clientId: string;
  /** Additional parameters to be included in the authorization request */
  additionalParams?: Record<string, string>;
} & PrepareAuthorizationParamsParams;

export type PrepareAuthorizationRequestResult = {
  /** The complete URL for the authorization request */
  url: URL;
} & Omit<PrepareAuthorizationParamsResult, 'params'>;

/**
 * Prepares an authorization request with the necessary parameters and PKCE.
 *
 * This function constructs the authorization request URL with the specified parameters,
 * including PKCE for enhanced security, and returns the URL along with security-related
 * parameters such as the code verifier, state, and nonce.
 *
 * @param {PrepareAuthorizationRequestParams} params - The parameters for the authorization request
 * @param {RandomBytes} randomBytes - A function to generate random bytes for security parameters
 * @returns {PrepareAuthorizationRequestResult} An object containing the authorization request URL and security parameters
 */
export const prepareAuthorizationRequest = (
  {
    endpoint,
    clientId,
    redirectUri,
    scope = 'openid',
    responseType = 'code',
    additionalParams = {},
  }: PrepareAuthorizationRequestParams,
  randomBytes: RandomBytes
): PrepareAuthorizationRequestResult => {
  const authorizationParams = prepareAuthorizationParams(
    {
      redirectUri,
      scope,
      responseType,
    },
    randomBytes
  );

  const { params, ...rest } = authorizationParams;
  params.set('client_id', clientId);
  applyAdditionalParams(params, additionalParams);

  const url = new URL(endpoint);
  url.search = params.toString();

  return {
    url,
    ...rest,
  };
};
