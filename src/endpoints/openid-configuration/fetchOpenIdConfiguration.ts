import { fetchJson } from '@/utils/fetchJson';
import { validateIssuer } from '@/utils/validateIssuer';
import {
  openIdConfigurationResponseSchema,
  OpenIdConfigurationResponse,
} from './OpenIdConfigurationResponse';

/**
 * OpenID Configuration path
 */
export const OPENID_CONFIGURATION_PATH = '/.well-known/openid-configuration';

/**
 * Modifies the OpenID Configuration response to use local endpoints if the environment is test or development.
 *
 * @param {OpenIdConfigurationResponse} response - The original OpenID Configuration response.
 * @param {string} issuer - The issuer URL to be used for local endpoints.
 * @returns {OpenIdConfigurationResponse} The modified OpenID Configuration response with local endpoints if applicable.
 */
const modifyResponseIfEnvIsTestOrDev = (
  response: OpenIdConfigurationResponse,
  issuer: string
): OpenIdConfigurationResponse => {
  if (
    process.env.NODE_ENV === 'test' ||
    process.env.NODE_ENV === 'development'
  ) {
    const modifiedResponse: Record<string, string> = {};

    modifiedResponse.issuer = issuer;
    if (response.issuer !== issuer) {
      modifiedResponse.original_issuer = response.issuer;
    }

    Object.entries(response).forEach(([key, value]) => {
      if (key.endsWith('_endpoint') || key.endsWith('_uri')) {
        const url = new URL(value as string);
        const localUrl = new URL(url.pathname + url.search, issuer);
        modifiedResponse[key] = localUrl.toString();
      }
    });

    return modifiedResponse as OpenIdConfigurationResponse;
  }

  return response;
};

/**
 * Fetches the OpenID Configuration from the given issuer's well-known endpoint.
 *
 * @param {string} issuer - The issuer URL from which to fetch the OpenID Configuration.
 * @returns {Promise<OpenIdConfigurationResponse>} A promise that resolves to the parsed OpenID Configuration response.
 * @throws Will throw an error if the fetch operation fails, HTTP status is not 200, if the response does not conform to the expected schema, or if the issuer in the response doesn't match the requested issuer.
 */
export const fetchOpenIdConfiguration = async (
  issuer: string
): Promise<OpenIdConfigurationResponse> => {
  const originalResponse = await fetchJson(
    issuer,
    OPENID_CONFIGURATION_PATH,
    openIdConfigurationResponseSchema
  );
  const response = modifyResponseIfEnvIsTestOrDev(originalResponse, issuer);

  // Validate that the issuer in the response matches the requested issuer
  // This is a security requirement from OpenID Connect Core 1.0 specification
  validateIssuer({
    receivedIssuer: response.issuer,
    expectedIssuer: issuer,
  });

  return response;
};
