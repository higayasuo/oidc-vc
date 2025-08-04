import { fetchJson } from '@/utils/fetchJson';
import { ParResponse, parResponseSchema } from './ParResponse';

type FetchParParams = {
  endpoint: string;
  body: URLSearchParams;
  headers: Record<string, string>;
};

/**
 * Fetches a PAR (Pushed Authorization Request) from the specified endpoint.
 *
 * @param {Object} params - The parameters for the fetch operation.
 * @param {string} params.endpoint - The endpoint URL to send the request to.
 * @param {URLSearchParams} params.body - The body of the request as URLSearchParams.
 * @param {Record<string, string>} params.headers - The headers to include in the request.
 * @returns {Promise<ParResponse>} A promise that resolves to the PAR response.
 */
export const fetchPar = async ({
  endpoint,
  body,
  headers,
}: FetchParParams): Promise<ParResponse> => {
  return fetchJson({
    url: endpoint,
    schema: parResponseSchema,
    method: 'POST',
    headers,
    body: body.toString(),
  });
};
