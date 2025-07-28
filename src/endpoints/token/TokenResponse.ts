import { z } from 'zod';

/**
 * Zod schema for validating a token response object.
 * This schema allows for additional properties not explicitly defined.
 */
export const tokenResponseSchema = z
  .object({
    /** The access token issued by the authorization server */
    access_token: z.string(),
    /** The type of the token issued */
    token_type: z.string(),
    /** The lifetime in seconds of the access token */
    expires_in: z.number().nullish(),
    /** The refresh token, which can be used to obtain new access tokens */
    refresh_token: z.string().nullish(),
    /** The ID token, which contains claims about the authentication event */
    id_token: z.string().nullish(),
    /** Error code if the token request fails */
    error: z.string().nullish(),
    /** Human-readable text providing additional information about the error */
    error_description: z.string().nullish(),
  })
  .passthrough();

/**
 * Type representing the output of the token response schema.
 */
export type TokenResponse = z.output<typeof tokenResponseSchema>;
