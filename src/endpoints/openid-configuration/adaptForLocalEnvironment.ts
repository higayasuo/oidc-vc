import { isLocalEnvironment } from './isLocalEnvironment';
import { OpenIdConfigurationResponse } from './OpenIdConfigurationResponse';

/**
 * Adapts the OpenID Configuration response to use local endpoints if the environment is test or development.
 *
 * @param {OpenIdConfigurationResponse} response - The original OpenID Configuration response.
 * @param {string} issuer - The issuer URL to be used for local endpoints.
 * @returns {OpenIdConfigurationResponse} The modified OpenID Configuration response with local endpoints if applicable.
 */
export const adaptForLocalEnvironment = (
  response: OpenIdConfigurationResponse,
  issuer: string
): OpenIdConfigurationResponse => {
  if (isLocalEnvironment(issuer)) {
    const modifiedResponse: Record<string, string> = {};

    Object.entries(response).forEach(([key, value]) => {
      if (key.endsWith('_endpoint') || key.endsWith('_uri')) {
        const url = new URL(value as string);
        const localUrl = new URL(url.pathname + url.search, issuer);
        modifiedResponse[key] = localUrl.toString();
      } else if (key === 'issuer') {
        modifiedResponse.issuer = issuer;
        if (response.issuer !== issuer) {
          modifiedResponse.original_issuer = response.issuer;
        }
      } else {
        modifiedResponse[key] = value as string;
      }
    });

    return modifiedResponse as OpenIdConfigurationResponse;
  }

  return response;
};
