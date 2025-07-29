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
  question,
  rl,
  fetchAndDisplayOpenIdConfig,
  generateAndDisplayAuthRequest,
  verifyRedirectedUri,
  performTokenExchange,
  validateTokenResponseWithJwks,
} from './utils';
import { collectAuthorizationParams } from './utils/cli';
import { getErrorMessage } from '../src/utils/getErrorMessage';

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
    // Step 1: Collect authorization parameters
    const {
      issuer,
      clientId,
      redirectUri,
      scope,
      responseType,
      additionalParams,
    } = await collectAuthorizationParams(envTest);

    // Step 2: Fetch OpenID Configuration
    const openIdConfig = await fetchAndDisplayOpenIdConfig(issuer);

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
    const redirectedUri = await question('Enter the redirected URI: ');

    if (!redirectedUri.trim()) {
      console.log('\n⚠️  No redirect URL provided. Exiting.');
      return;
    }

    // Step 6: Extract authorization result
    let code: string;
    try {
      code = verifyRedirectedUri({
        redirectedUri,
        authResult,
        openIdConfig,
        clientId,
        redirectUri,
      });

      if (!code) {
        console.log(
          '\n❌ No authorization code received. Token exchange cannot proceed.'
        );
        return;
      }
    } catch (redirectError) {
      console.log('\n❌ Error analyzing redirect result:');
      console.log('   ' + getErrorMessage(redirectError));
      console.log(
        '\n⚠️  No authorization code received. Token exchange cannot proceed.'
      );
      return;
    }

    // Step 7: Perform token exchange
    let tokenResponse;
    try {
      tokenResponse = await performTokenExchange({
        code,
        authResult,
        openIdConfig,
        clientId,
        redirectUri,
        clientSecret: envTest['CLIENT_SECRET'],
      });
    } catch (tokenError) {
      console.error('\n❌ Token exchange failed:');
      console.error('   ' + getErrorMessage(tokenError));
      return;
    }

    // Step 8: Validate token response (scope and ID token)
    if (tokenResponse) {
      try {
        await validateTokenResponseWithJwks({
          tokenResponse,
          requestedScope: authResult.scope,
          authResult,
          openIdConfig,
          clientId,
        });
      } catch (validationError) {
        console.error('❌ Token response validation failed:');
        console.error('   ' + getErrorMessage(validationError));
      }
    }
  } catch (error) {
    console.error('❌ Error in authorization flow:');
    console.error('   ' + getErrorMessage(error));
    if (error instanceof Error && error.cause) {
      console.error('   Cause: ' + getErrorMessage(error.cause));
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
