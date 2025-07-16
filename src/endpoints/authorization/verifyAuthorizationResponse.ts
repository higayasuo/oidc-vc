import { validateIssuer } from '@/utils/validateIssuer';
import { parseUrl } from '@/utils/parseUrl';

/**
 * Expected values for verifying the authorization response.
 * @typedef {Object} ExpectedValues
 * @property {string} state - The expected state parameter.
 * @property {string} issuer - The expected issuer URL.
 * @property {string} clientId - The expected client ID.
 * @property {string} redirectUri - The expected redirect URI.
 */
type ExpectedValues = {
  state: string;
  issuer: string;
  clientId: string;
  redirectUri: string;
};

/**
 * Verifies the authorization response by checking the URL parameters against expected values.
 *
 * @param {string} location - The URL of the authorization response.
 * @param {ExpectedValues} expected - The expected values to validate against.
 * @returns {string} The authorization code from the response.
 * @throws Will throw an error if any validation fails, such as mismatched state, client ID, or redirect URI.
 */
export const verifyAuthorizationResponse = (
  location: string,
  expected: ExpectedValues
): string => {
  // Validate that location is a valid URL
  const url = parseUrl(location, 'location URL');

  // Validate that expected.redirectUri is a valid URL
  const expectedRedirectUriUrl = parseUrl(
    expected.redirectUri,
    'expected redirect URI'
  );

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const issuer = url.searchParams.get('iss');
  const clientId = url.searchParams.get('client_id');
  const error = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');

  if (error) {
    throw new Error(`Authorization error: ${error} ${errorDescription}`);
  }

  if (
    url.origin !== expectedRedirectUriUrl.origin ||
    url.pathname !== expectedRedirectUriUrl.pathname
  ) {
    throw new Error(
      `Redirect URI mismatch: received "${url.origin}${url.pathname}" but expected "${expectedRedirectUriUrl.origin}${expectedRedirectUriUrl.pathname}"`
    );
  }

  if (!state) {
    throw new Error(`State is missing in the authorization response`);
  }

  if (state !== expected.state) {
    throw new Error(
      `State mismatch: received "${state}" but expected "${expected.state}"`
    );
  }

  if (!code) {
    throw new Error(`Code is missing in the authorization response`);
  }

  if (issuer) {
    validateIssuer({
      receivedIssuer: issuer,
      expectedIssuer: expected.issuer,
    });
  }

  if (clientId && clientId !== expected.clientId) {
    throw new Error(
      `Client ID mismatch: received "${clientId}" but expected "${expected.clientId}"`
    );
  }

  return code;
};
