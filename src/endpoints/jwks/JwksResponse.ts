import { z } from 'zod';

/**
 * Allowed key types for JWK (JSON Web Key)
 * Based on RFC 7518 and RFC 8037 specifications
 */
const keyTypes = ['RSA', 'EC', 'OKP'] as const;

/**
 * Allowed key uses for JWK
 */
const keyUses = ['sig', 'enc'] as const;

/**
 * Common fields for all JWK types
 */
const commonJwkFields = {
  kty: z.enum(keyTypes),
  use: z.enum(keyUses).optional(),
  kid: z.string().optional(),
  alg: z.string().optional(),
  x5c: z.array(z.string()).optional(),
  x5t: z.string().optional(),
  x5tS256: z.string().optional(),
  x5u: z.string().optional(),
};

/**
 * RSA-specific fields
 */
const rsaFields = {
  n: z.string(), // modulus (required for RSA)
  e: z.string(), // public exponent (required for RSA)
  d: z.string().optional(), // private exponent
  p: z.string().optional(), // first prime factor
  q: z.string().optional(), // second prime factor
  dp: z.string().optional(), // first factor CRT exponent
  dq: z.string().optional(), // second factor CRT exponent
  qi: z.string().optional(), // CRT coefficient
};

/**
 * EC-specific fields
 */
const ecFields = {
  crv: z.enum(['P-256', 'P-384', 'P-521']), // curve (required for EC)
  x: z.string(), // x coordinate (required for EC)
  y: z.string(), // y coordinate (required for EC)
  d: z.string().optional(), // private key
};

/**
 * OKP-specific fields (EdDSA/ECDH)
 */
const okpFields = {
  crv: z.enum(['Ed25519', 'Ed448', 'X25519', 'X448']), // curve (required for OKP)
  x: z.string(), // public key (required for OKP)
  d: z.string().optional(), // private key
};

/**
 * Schema for JSON Web Key (JWK) according to RFC 7517
 * Supports RSA, EC, and OKP (EdDSA/ECDH) key types
 */
export const jwkSchema = z.discriminatedUnion('kty', [
  // RSA key schema
  z.object({
    ...commonJwkFields,
    kty: z.literal('RSA'),
    ...rsaFields,
  }),

  // EC key schema
  z.object({
    ...commonJwkFields,
    kty: z.literal('EC'),
    ...ecFields,
  }),

  // OKP key schema (EdDSA/ECDH)
  z.object({
    ...commonJwkFields,
    kty: z.literal('OKP'),
    ...okpFields,
  }),
]);

/**
 * Schema for JWKS (JSON Web Key Set) response
 * Contains an array of JWKs
 */
export const jwksResponseSchema = z.object({
  keys: z.array(jwkSchema),
});

export type Jwk = z.output<typeof jwkSchema>;
export type JwksResponse = z.output<typeof jwksResponseSchema>;
