import { z } from 'zod';


/**
 * URL schema for validation
 */
const urlSchema = z.string().url();

/**
 * Schema for OpenID Configuration Response.
 * This schema defines the expected structure of the OpenID configuration response
 * from an OpenID Provider according to OpenID Connect Core 1.0 specification.
 */
export const openIdConfigurationResponseSchema = z.object({
  /**
   * The issuer identifier for the OpenID Provider.
   */
  issuer: urlSchema,

  /**
   * The URL of the authorization endpoint.
   */
  authorization_endpoint: urlSchema,

  /**
   * The URL of the token endpoint.
   */
  token_endpoint: urlSchema,

  /**
   * The URL of the userinfo endpoint.
   */
  userinfo_endpoint: urlSchema.nullish(),

  /**
   * The URL of the JSON Web Key Set (JWKS) endpoint.
   */
  jwks_uri: urlSchema,

  /**
   * The URL of the pushed authorization request endpoint, if available.
   */
  pushed_authorization_request_endpoint: urlSchema.nullish(),

  /**
   * The URL of the revocation endpoint, if available.
   */
  revocation_endpoint: urlSchema.nullish(),

  /**
   * The URL of the introspection endpoint, if available.
   */
  introspection_endpoint: urlSchema.nullish(),
}).passthrough();


/**
 * Type representing the validated OpenID Configuration Response.
 */
export type OpenIdConfigurationResponse = z.output<typeof openIdConfigurationResponseSchema>;