import { z } from 'zod';
import { getErrorMessage } from './getErrorMessage';

/**
 * Parameters for the fetchJson function.
 *
 * @template T - The expected type of the parsed response data.
 */
type FetchJsonParams<T> = {
  /** The URL to fetch data from */
  url: string;
  /** The Zod schema to validate the response data against */
  schema: z.ZodSchema<T>;
  /** HTTP method to use for the request. Defaults to 'GET' */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  /** HTTP headers to include in the request. Accept: application/json is always added */
  headers?: Record<string, string>;
  /** Request body content. Used for POST, PUT requests */
  body?: string;
};

/**
 * Fetches JSON data from a URL and validates it against a given schema.
 *
 * This function provides a type-safe way to fetch and validate JSON responses.
 * It automatically handles HTTP error responses and schema validation errors.
 * The Accept header is always set to 'application/json' since this function expects JSON responses.
 *
 * @template T - The expected type of the parsed response data.
 * @param params - Configuration parameters for the fetch request
 * @param params.url - The URL to fetch data from
 * @param params.schema - The Zod schema to validate the response data against
 * @param params.method - HTTP method to use for the request (defaults to 'GET')
 * @param params.headers - HTTP headers to include in the request (Accept: application/json is always added)
 * @param params.body - Request body content for POST/PUT requests
 * @returns A promise that resolves to the validated response data of type T
 * @throws Will throw an error if the fetch operation fails, HTTP status is not 200, or if the response does not conform to the expected schema
 *
 * @example
 * ```typescript
 * const userSchema = z.object({
 *   id: z.number(),
 *   name: z.string(),
 * });
 *
 * const user = await fetchJson({
 *   url: 'https://api.example.com/users/1',
 *   schema: userSchema,
 * });
 * // user is typed as { id: number; name: string }
 * ```
 *
 * @example
 * ```typescript
 * const response = await fetchJson({
 *   url: 'https://api.example.com/users',
 *   schema: userSchema,
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ name: 'John' }),
 * });
 * ```
 */
export const fetchJson = async <T>({
  url,
  schema,
  method = 'GET',
  headers = {},
  body,
}: FetchJsonParams<T>): Promise<T> => {
  // Validate that user doesn't specify non-JSON Accept header
  if (headers.Accept && !headers.Accept.includes('application/json')) {
    throw new Error(
      `fetchJson expects JSON responses, but Accept header specifies: ${headers.Accept}`
    );
  }

  try {
    // Always set Accept: application/json since we expect JSON responses
    const requestHeaders = {
      Accept: 'application/json',
      ...headers,
    };

    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body,
    });

    if (!response.ok) {
      console.log(await response.text());
      throw new Error(
        `Failed to fetch from ${url}: HTTP ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return schema.parse(data);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Failed to fetch')) {
      throw error;
    }
    throw new Error(`Failed to fetch from ${url}: ${getErrorMessage(error)}`);
  }
};
