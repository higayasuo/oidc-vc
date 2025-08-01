import { fetchJson } from '@/utils/fetchJson';
import {
  openIdConfigurationResponseSchema,
  OpenIdConfigurationResponse,
} from './OpenIdConfigurationResponse';
import { concatUrlPaths } from '@/utils/concatUrlPaths';

/**
 * OpenID Configuration path
 */
export const OPENID_CONFIGURATION_PATH = '/.well-known/openid-configuration';

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
  return fetchJson({
    url: concatUrlPaths(issuer, OPENID_CONFIGURATION_PATH),
    schema: openIdConfigurationResponseSchema,
  });
};
