import { validateIdToken, ValidateIdTokenResult } from './validateIdToken';
import { validateGrantedScope } from './validateGrantedScope';
import { TokenResponse } from './TokenResponse';
import { Jwk } from '../jwks/JwksResponse';

type ValidateTokenResponseParams = {
  tokenResponse: TokenResponse;
  requestedScope: string;
  jwks: Jwk[];
  issuer: string;
  audience: string;
  nonce: string;
  state: string;
  clockTolerance?: number;
};

/**
 * Validates a token response by checking both the granted scope and ID token.
 *
 * This function performs comprehensive validation of an OAuth 2.0 token response:
 * - Validates that the granted scope is a subset of the requested scope
 * - Validates the ID token if present (signature, claims, nonce, s_hash)
 *
 * @param {ValidateTokenResponseParams} params - The parameters for token response validation
 * @returns {Promise<ValidateIdTokenResult | undefined>} The ID token validation result if an ID token was present and validated, undefined otherwise
 * @throws Will throw an error if scope validation fails or ID token validation fails
 */
export const validateTokenResponse = async (
  params: ValidateTokenResponseParams
): Promise<ValidateIdTokenResult | undefined> => {
  // 1. Validate granted scope
  if (params.tokenResponse.scope) {
    validateGrantedScope({
      requested: params.requestedScope,
      granted: params.tokenResponse.scope,
    });
  }

  // 2. Validate ID token if present
  if (params.tokenResponse.id_token) {
    return await validateIdToken({
      idToken: params.tokenResponse.id_token,
      jwks: params.jwks,
      issuer: params.issuer,
      audience: params.audience,
      nonce: params.nonce,
      state: params.state,
      clockTolerance: params.clockTolerance,
    });
  }

  return undefined;
};
