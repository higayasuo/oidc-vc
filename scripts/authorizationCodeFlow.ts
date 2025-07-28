#!/usr/bin/env tsx

/**
 * Complete OIDC Authorization Flow Script
 *
 * Usage:
 *   npx tsx scripts/authorizationFlow.ts
 *
 * This script:
 * 1. Takes an issuer URL
 * 2. Fetches OpenID Configuration
 * 3. Generates authorization request URL
 * 4. Waits for manual authorization completion
 * 5. Extracts authorization code from redirect
 * 6. Provides instructions for token exchange
 * 7. Validates ID token using JWKS
 */

import { randomBytes as nodeRandomBytes } from 'crypto';
import type { RandomBytes } from '../src/types';
import {
  loadEnvTest,
  getDefaultValue,
  question,
  promptWithDefault,
  promptForAdditionalParams,
  rl,
  fetchAndDisplayOpenIdConfig,
  generateAndDisplayAuthRequest,
  processRedirectUrl,
  performTokenExchange,
  validateIdTokenWithJwks,
} from './utils';
import { validateGrantedScope } from '../src/endpoints/token/validateGrantedScope';

// Adapter: Node.js randomBytes to Uint8Array for RandomBytes type
const randomBytes: RandomBytes = (byteLength = 32) => {
  return new Uint8Array(nodeRandomBytes(byteLength));
};

async function main(): Promise<void> {
  console.log('🔐 OIDC Authorization Code Flow Generator\n');
  console.log(
    'This tool helps you complete the OIDC authorization code flow:\n'
  );
  console.log('1. Fetch OpenID Configuration from issuer');
  console.log('2. Generate authorization request URL');
  console.log('3. Open URL in browser and complete authorization');
  console.log('4. Copy redirect URL and paste it here');
  console.log('5. Extract authorization code for token exchange\n');

  // Load .env.test file
  const envTest = loadEnvTest();
  if (Object.keys(envTest).length > 0) {
    console.log('📁 Loaded configuration from .env.test file');
  }

  try {
    // Step 1: Get issuer URL
    const defaultIssuer = getDefaultValue('TEST_ISSUER', envTest);
    const issuer = await promptWithDefault('Issuer URL', defaultIssuer);

    if (!issuer) {
      console.error('❌ Issuer URL is required');
      return;
    }

    // Step 2: Fetch OpenID Configuration
    const openIdConfig = await fetchAndDisplayOpenIdConfig(issuer);

    // Step 3: Get client configuration
    const defaultClientId = getDefaultValue('CLIENT_ID', envTest);
    const clientId = await promptWithDefault('Client ID', defaultClientId);

    const defaultRedirectUri = getDefaultValue('REDIRECT_URI', envTest);
    const redirectUri = await promptWithDefault(
      'Redirect URI',
      defaultRedirectUri
    );

    const scope = await promptWithDefault('Scope', 'openid');
    const responseType = await promptWithDefault('Response Type', 'code');

    console.log(
      '\nℹ️  PKCE and state parameters are automatically generated (OAuth 2.1 compliance)'
    );

    const additionalParams = await promptForAdditionalParams();

    // Step 4: Generate authorization request
    const authParams = {
      authorizationEndpoint: openIdConfig.authorization_endpoint,
      clientId,
      redirectUri,
      scope,
      responseType,
      additionalParams,
    };

    const authResult = generateAndDisplayAuthRequest(authParams, randomBytes);

    // Step 5: Wait for manual authorization result
    const redirectUrl = await question('Enter the redirected URL: ');

    if (!redirectUrl.trim()) {
      console.log('\n⚠️  No redirect URL provided. Exiting.');
      return;
    }

    // Step 6: Extract authorization result
    const { code, error: redirectError } = processRedirectUrl(
      redirectUrl,
      authResult,
      openIdConfig,
      clientId,
      redirectUri
    );

    if (redirectError) {
      console.log('\n❌ Error analyzing redirect result:');
      if (redirectError instanceof Error) {
        console.log('   ' + redirectError.message);
      } else {
        console.log('   ' + String(redirectError));
      }
      console.log(
        '\n⚠️  No authorization code received. Token exchange cannot proceed.'
      );
      return;
    }

    if (!code) {
      console.log(
        '\n❌ No authorization code received. Token exchange cannot proceed.'
      );
      return;
    }

    // Step 7: Perform token exchange
    const { tokenResponse, error: tokenError } = await performTokenExchange(
      code,
      authResult,
      openIdConfig,
      clientId,
      redirectUri,
      envTest['CLIENT_SECRET']
    );

    if (tokenError) {
      console.error('\n❌ Token exchange failed:');
      if (tokenError instanceof Error) {
        console.error('   ' + tokenError.message);
      } else {
        console.error('   ' + String(tokenError));
      }
      return;
    }

    // Step 8: Validate ID Token using JWKS
    if (tokenResponse?.id_token) {
      const { success, error: validationError } = await validateIdTokenWithJwks(
        {
          idToken: tokenResponse.id_token,
          authResult,
          openIdConfig,
          clientId,
        }
      );

      if (!success) {
        console.error('❌ ID Token validation failed:');
        if (validationError instanceof Error) {
          console.error('   ' + validationError.message);
        } else {
          console.error('   ' + String(validationError));
        }
      }
    } else {
      console.warn('⚠️  No ID Token in token response.');
    }

    // Step 9: Validate granted scope
    if (tokenResponse?.scope) {
      console.log('🔍 Validating granted scope...');
      validateGrantedScope({
        requested: authResult.scope,
        granted: tokenResponse.scope,
      });
      console.log('✅ Granted scope validated successfully');
    }
  } catch (error) {
    console.error(
      '❌ Error in authorization flow:',
      error instanceof Error ? error.message : String(error)
    );
    if (error instanceof Error && error.cause) {
      console.error(
        '   Cause:',
        error.cause instanceof Error ? error.cause.message : String(error.cause)
      );
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
