import { validateLeftMostHalfHash } from '@/utils/validateLeftMostHalfHash';
import { getJwk } from '../jwks/getJwk';
import { Jwk } from '../jwks/JwksResponse';
import {
  jwtVerify,
  JWTPayload,
  JWTHeaderParameters,
  decodeProtectedHeader,
} from 'jose';

/**
 * Parameters for validating an ID token.
 *
 * @typedef {Object} ValidateIdTokenParams
 * @property {string} idToken - The ID token to be validated.
 * @property {Jwk[]} jwks - Array of JSON Web Keys (JWKs) from which the appropriate key will be selected based on the token's kid.
 * @property {string} issuer - The expected issuer of the token.
 * @property {string} audience - The expected audience of the token.
 * @property {string} nonce - The nonce value that was sent in the authorization request to prevent CSRF attacks.
 * @property {string} state - The state value that was sent in the authorization request to prevent CSRF attacks and validate s_hash.
 * @property {number} [clockTolerance] - Clock tolerance in seconds for time-based claims. Defaults to 30 seconds.
 */
type ValidateIdTokenParams = {
  idToken: string;
  jwks: Jwk[];
  issuer: string;
  audience: string;
  nonce: string;
  state: string;
  clockTolerance?: number;
};

/**
 * Result of a successful ID token validation.
 *
 * @typedef {Object} ValidateIdTokenResult
 * @property {JWTPayload} payload - The payload of the validated token.
 * @property {JWTHeaderParameters} protectedHeader - The protected header of the validated token.
 */
export type ValidateIdTokenResult = {
  payload: JWTPayload;
  protectedHeader: JWTHeaderParameters;
};

/**
 * Validates an ID token using the provided JWKS, issuer, audience, nonce, and state.
 * This function performs comprehensive OIDC ID token validation including:
 * - Automatic JWK selection based on the token's kid (key ID)
 * - Signature verification using the selected JWK
 * - Required claims validation (iss, aud, iat, sub)
 * - Nonce validation to prevent CSRF attacks
 * - State validation through s_hash (state hash) when present
 * - Time-based claims validation with configurable tolerance (handled by jose)
 * - Issuer and audience validation
 *
 * The function automatically extracts the kid from the JWT header and selects the appropriate
 * JWK from the provided JWKS array. If no kid is present and there's exactly one JWK in the
 * array, that JWK will be used. Otherwise, an error will be thrown.
 *
 * When the ID token contains an s_hash claim, it validates that the hash matches the
 * left-most half of the SHA hash of the state parameter using the token's signing algorithm.
 * This provides additional CSRF protection by ensuring the state parameter hasn't been
 * tampered with during the authorization flow.
 *
 * @param {ValidateIdTokenParams} params - The parameters required for token validation.
 * @returns {Promise<ValidateIdTokenResult>} A promise that resolves to the validation result, containing the token's payload and protected header.
 * @throws Will throw an error if the token is invalid, expired, missing required claims, nonce mismatch, s_hash validation fails, or if no suitable JWK can be found in the JWKS.
 */
export const validateIdToken = async ({
  idToken,
  jwks,
  issuer,
  audience,
  nonce,
  state,
  clockTolerance = 30,
}: ValidateIdTokenParams): Promise<ValidateIdTokenResult> => {
  try {
    // Decode the token to get the header
    const { kid, alg } = decodeProtectedHeader(idToken);

    if (!alg) {
      throw new Error('ID token is missing the "alg" (algorithm) header');
    }

    const publicKey = getJwk(jwks, kid);

    const result = await jwtVerify(idToken, publicKey, {
      issuer,
      audience,
      clockTolerance,
    });

    // Additional OIDC ID token specific validations
    const payload = result.payload;

    // Validate required claims
    if (!payload.iat) {
      throw new Error('ID token is missing the "iat" (issued at) claim');
    }

    // Validate sub claim (required for OIDC)
    if (!payload.sub) {
      throw new Error('ID token is missing the "sub" (subject) claim');
    }

    // Validate nonce to prevent CSRF attacks
    if (!payload.nonce) {
      throw new Error(
        'ID token is missing the "nonce" claim required for CSRF protection'
      );
    }

    if (payload.nonce !== nonce) {
      throw new Error(
        `ID token nonce "${payload.nonce}" does not match expected value "${nonce}"`
      );
    }

    if (payload.s_hash) {
      validateLeftMostHalfHash({
        hash: payload.s_hash,
        data: state,
        alg,
      });
    }

    return result;
  } catch (error) {
    // Improve error messages for common jose errors
    if (error instanceof Error) {
      const message = error.message;

      if (message.includes('unexpected "iss" claim value')) {
        throw new Error(
          `ID token issuer does not match expected issuer "${issuer}"`
        );
      }

      if (message.includes('unexpected "aud" claim value')) {
        throw new Error(
          `ID token audience does not match expected audience "${audience}"`
        );
      }

      if (message.includes('"exp" claim timestamp check failed')) {
        throw new Error('ID token has expired');
      }

      if (message.includes('"nbf" claim timestamp check failed')) {
        throw new Error('ID token is not yet valid (nbf claim check failed)');
      }

      if (message.includes('signature verification failed')) {
        throw new Error('ID token signature verification failed');
      }
    }

    // Re-throw the original error to preserve all error information
    // The calling code can handle specific error types as needed
    throw error;
  }
};
