import { z } from 'zod'
import { getErrorMessage } from './errorUtils';

/**
 * Fetches JSON data from a specified path and validates it against a given schema.
 *
 * @template T - The expected type of the parsed response data.
 * @param {string} issuer - The base URL of the issuer.
 * @param {string} path - The specific path to fetch data from.
 * @param {z.ZodSchema<T>} schema - The Zod schema to validate the response data against.
 * @returns {Promise<T>} A promise that resolves to the validated response data.
 * @throws Will throw an error if the fetch operation fails, HTTP status is not 200, or if the response does not conform to the expected schema.
 */
export const fetchJson = async <T>(issuer: string, path: string, schema: z.ZodSchema<T>): Promise<T> => {
  issuer = issuer.replace(/\/$/, '');
  path = path.startsWith('/') ? path : `/${path}`;
  const url = `${issuer}${path}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}: Failed to fetch from ${url}`);
    }

    const data = await response.json();
    return schema.parse(data);
  } catch (error) {
    throw new Error(`Failed to fetch from ${url}: ${getErrorMessage(error)}`);
  }
};