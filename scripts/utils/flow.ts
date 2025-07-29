import { fetchOpenIdConfiguration } from '../../src/endpoints/openid-configuration';
import { generateAuthorizationRequest } from '../../src/endpoints/authorization';
import { verifyAuthorizationResponse } from '../../src/endpoints/authorization/verifyAuthorizationResponse';
import { fetchToken } from '../../src/endpoints/token/fetchToken';
import { validateIdToken } from '../../src/endpoints/token/validateIdToken';
import { validateTokenResponse } from '../../src/endpoints/token/validateTokenResponse';
import { fetchJwks } from '../../src/endpoints/jwks/fetchJwks';
import type { RandomBytes } from '../../src/types';
import type { Jwk } from '../../src/endpoints/jwks/JwksResponse';

/**
 * Fetches OpenID Configuration and displays the results
 */
export const fetchAndDisplayOpenIdConfig = async (issuer: string) => {
  console.log(`\n📡 Fetching OpenID Configuration from: ${issuer}`);

  const openIdConfig = await fetchOpenIdConfiguration(issuer);
  console.log('✅ OpenID Configuration fetched successfully');
  console.log(
    `   Authorization Endpoint: ${openIdConfig.authorization_endpoint}`
  );
  console.log(`   Token Endpoint: ${openIdConfig.token_endpoint}`);
  console.log(`   Issuer: ${openIdConfig.issuer}\n`);

  return openIdConfig;
};

/**
 * Generates authorization request and displays the results
 */
export const generateAndDisplayAuthRequest = (
  authParams: {
    authorizationEndpoint: string;
    clientId: string;
    redirectUri: string;
    scope: string;
    responseType: string;
    additionalParams: Record<string, string>;
  },
  randomBytes: RandomBytes
) => {
  const authResult = generateAuthorizationRequest(authParams, randomBytes);

  console.log('\n' + '='.repeat(80));
  console.log('Code Verifier:', authResult.codeVerifier);
  console.log('State:', authResult.state);
  console.log('Nonce:', authResult.nonce);

  // Output authorization URL
  console.log('\n' + '='.repeat(80));
  console.log('🔗 AUTHORIZATION REQUEST URL');
  console.log('='.repeat(80));
  console.log(authResult.url.toString());
  console.log('\n' + '='.repeat(80));

  console.log('💡 Instructions:');
  console.log('1. Copy the URL above and paste it into your browser');
  console.log('2. Complete the authorization (login, consent, etc.)');
  console.log('3. You will be redirected to your redirect URI');
  console.log('4. Copy the entire redirected URL from your browser');
  console.log('5. Paste it below\n');

  return authResult;
};

/**
 * Verifies the redirected URL and extracts authorization code
 */
export const verifyRedirectedUri = (params: {
  redirectedUri: string;
  authResult: {
    state: string;
    nonce: string | undefined;
  };
  openIdConfig: {
    original_issuer?: string | null;
    issuer: string;
  };
  clientId: string;
  redirectUri: string;
}): string => {
  console.log('\n🔍 Analyzing redirect result...');

  const code = verifyAuthorizationResponse(params.redirectedUri, {
    state: params.authResult.state,
    issuer: params.openIdConfig.original_issuer ?? params.openIdConfig.issuer,
    clientId: params.clientId,
    redirectUri: params.redirectUri,
  });

  return code;
};

/**
 * Performs token exchange and displays results
 */
export const performTokenExchange = async (params: {
  code: string;
  authResult: {
    codeVerifier: string;
    nonce: string | undefined;
  };
  openIdConfig: {
    token_endpoint: string;
    original_issuer?: string | null;
    issuer: string;
    jwks_uri?: string;
  };
  clientId: string;
  redirectUri: string;
  clientSecret?: string;
}) => {
  console.log('\n' + '='.repeat(80));
  console.log('🔄 TOKEN EXCHANGE');
  console.log('='.repeat(80));
  console.log(`Token Endpoint: ${params.openIdConfig.token_endpoint}`);
  console.log(`Authorization Code: ${params.code}`);
  console.log(`Code Verifier: ${params.authResult.codeVerifier}`);
  console.log(`Client ID: ${params.clientId}`);
  console.log(`Redirect URI: ${params.redirectUri}`);
  console.log('='.repeat(80));

  const tokenResponse = await fetchToken({
    tokenEndpoint: params.openIdConfig.token_endpoint,
    clientId: params.clientId,
    clientSecret: params.clientSecret,
    code: params.code,
    codeVerifier: params.authResult.codeVerifier,
    redirectUri: params.redirectUri,
    grantType: 'authorization_code',
  });

  console.log('\n✅ Token Response:');
  console.log(JSON.stringify(tokenResponse, undefined, 2));

  return tokenResponse;
};

/**
 * Validates token response by checking both scope and ID token
 */
export const validateTokenResponseWithJwks = async (params: {
  tokenResponse: any;
  requestedScope: string;
  authResult: {
    nonce: string | undefined;
    state: string;
  };
  openIdConfig: {
    issuer: string;
    jwks_uri?: string;
  };
  clientId: string;
}) => {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 TOKEN RESPONSE VALIDATION');
  console.log('='.repeat(80));

  // Fetch JWKS for ID token validation
  let jwks: Jwk[] = [];
  if (params.tokenResponse.id_token && params.openIdConfig.jwks_uri) {
    console.log(`📡 Fetching JWKS from: ${params.openIdConfig.jwks_uri}`);
    jwks = await fetchJwks(params.openIdConfig.jwks_uri);
    console.log(`✅ Fetched ${jwks.length} JWK(s)`);
  }

  const validationResult = await validateTokenResponse({
    tokenResponse: params.tokenResponse,
    requestedScope: params.requestedScope,
    jwks,
    issuer: params.openIdConfig.issuer,
    audience: params.clientId,
    nonce: params.authResult.nonce!,
    state: params.authResult.state,
  });

  if (validationResult) {
    console.log('✅ Token response validated successfully');
    console.log('📋 ID Token Claims:');
    console.log(JSON.stringify(validationResult.payload, null, 2));
  } else {
    console.log(
      '✅ Token response validated successfully (no ID token present)'
    );
  }

  console.log('='.repeat(80));

  return validationResult;
};
