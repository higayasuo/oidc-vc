import { fetchOpenIdConfiguration } from '../../src/endpoints/openid-configuration';
import { generateAuthorizationRequest } from '../../src/endpoints/authorization';
import { verifyAuthorizationResponse } from '../../src/endpoints/authorization/verifyAuthorizationResponse';
import { fetchToken } from '../../src/endpoints/token/fetchToken';
import { validateIdToken } from '../../src/endpoints/token/validateIdToken';
import { fetchJwks } from '../../src/endpoints/jwks/fetchJwks';
import type { RandomBytes } from '../../src/types';

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
 * Processes the redirect URL and extracts authorization code
 */
export const processRedirectUrl = (
  redirectUrl: string,
  authResult: {
    state: string;
    nonce: string | undefined;
  },
  openIdConfig: {
    original_issuer?: string | null;
    issuer: string;
  },
  clientId: string,
  redirectUri: string
) => {
  console.log('\n🔍 Analyzing redirect result...');

  try {
    const code = verifyAuthorizationResponse(redirectUrl, {
      state: authResult.state,
      issuer: openIdConfig.original_issuer ?? openIdConfig.issuer,
      clientId,
      redirectUri,
    });

    return { code, error: null };
  } catch (error) {
    return { code: null, error };
  }
};

/**
 * Performs token exchange and displays results
 */
export const performTokenExchange = async (
  code: string,
  authResult: {
    codeVerifier: string;
    nonce: string | undefined;
  },
  openIdConfig: {
    token_endpoint: string;
    original_issuer?: string | null;
    issuer: string;
    jwks_uri?: string;
  },
  clientId: string,
  redirectUri: string,
  clientSecret?: string
) => {
  console.log('\n' + '='.repeat(80));
  console.log('🔄 TOKEN EXCHANGE');
  console.log('='.repeat(80));
  console.log(`Token Endpoint: ${openIdConfig.token_endpoint}`);
  console.log(`Authorization Code: ${code}`);
  console.log(`Code Verifier: ${authResult.codeVerifier}`);
  console.log(`Client ID: ${clientId}`);
  console.log(`Redirect URI: ${redirectUri}`);
  console.log('='.repeat(80));

  try {
    const tokenResponse = await fetchToken({
      tokenEndpoint: openIdConfig.token_endpoint,
      clientId,
      clientSecret,
      code,
      codeVerifier: authResult.codeVerifier,
      redirectUri,
      grantType: 'authorization_code',
    });

    console.log('\n✅ Token Response:');
    console.log(JSON.stringify(tokenResponse, undefined, 2));

    return { tokenResponse, error: null };
  } catch (error) {
    return { tokenResponse: null, error };
  }
};

/**
 * Validates ID token using JWKS
 */
export const validateIdTokenWithJwks = async (params: {
  idToken: string;
  authResult: {
    nonce: string | undefined;
    state: string;
  };
  openIdConfig: {
    jwks_uri?: string;
    original_issuer?: string | null;
    issuer: string;
  };
  clientId: string;
}) => {
  if (!params.openIdConfig.jwks_uri) {
    console.warn('⚠️  No JWKS URI found in OpenID Configuration');
    return { success: false, error: 'No JWKS URI found' };
  }

  console.log('\n🔍 Validating ID Token...');
  console.log(`📡 Fetching JWKS from: ${params.openIdConfig.jwks_uri}`);

  try {
    const jwks = await fetchJwks(params.openIdConfig.jwks_uri);
    console.log(`✅ Fetched ${jwks.length} JWK(s)`);

    console.log('🔍 Validating ID token...');
    const validationResult = await validateIdToken({
      idToken: params.idToken,
      jwks,
      issuer: params.openIdConfig.original_issuer ?? params.openIdConfig.issuer,
      audience: params.clientId,
      nonce: params.authResult.nonce!,
      state: params.authResult.state,
    });

    console.log('✅ ID Token validated successfully!');
    console.log('📋 Token Claims:');
    console.log(JSON.stringify(validationResult.payload, null, 2));

    return { success: true, validationResult };
  } catch (error) {
    return { success: false, error };
  }
};
