import { z } from 'zod';

/**
 * Schema for the PAR (Pushed Authorization Request) response.
 *
 * This schema defines the structure of the response received from a PAR endpoint.
 * It includes optional fields for the request URI, expiration time, error, and error description.
 */
export const parResponseSchema = z
  .object({
    /** The URI of the request, if available */
    request_uri: z.string().optional(),
    /** The time in seconds until the request URI expires, if available */
    expires_in: z.number().optional(),
    /** Error code, if an error occurred */
    error: z.string().optional(),
    /** Description of the error, if an error occurred */
    error_description: z.string().optional(),
  })
  .passthrough();

/**
 * Type representing the output of the PAR response schema.
 */
export type ParResponse = z.output<typeof parResponseSchema>;
