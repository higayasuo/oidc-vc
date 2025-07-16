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
 */

import { fetchOpenIdConfiguration } from '../src/endpoints/openid-configuration';
import { generateAuthorizationRequest } from '../src/endpoints/authorization';
import { verifyAuthorizationResponse } from '../src/endpoints/authorization/verifyAuthorizationResponse';
import { createInterface } from 'node:readline';
import { randomBytes as nodeRandomBytes } from 'crypto';
import { config } from 'dotenv';
import type { RandomBytes } from '../src/types';

// Adapter: Node.js randomBytes to Uint8Array for RandomBytes type
const randomBytes: RandomBytes = (byteLength = 32) => {
  return new Uint8Array(nodeRandomBytes(byteLength));
};

// Create readline interface
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to prompt for input
const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

/**
 * Loads environment variables from .env.test file using dotenv
 */
const loadEnvTest = (): Record<string, string> => {
  try {
    const result = config({ path: '.env.test' });
    if (result.error) {
      console.warn('⚠️  Warning: Could not load .env.test file:', result.error);
      return {};
    }

    // Return the loaded environment variables
    return result.parsed || {};
  } catch (error) {
    console.warn('⚠️  Warning: Could not read .env.test file:', error);
    return {};
  }
};

/**
 * Gets default value for a parameter, prioritizing .env.test over process.env
 */
const getDefaultValue = (
  key: string,
  envTest: Record<string, string>
): string => {
  return envTest[key] || process.env[key] || '';
};

async function main(): Promise<void> {
  console.log('🔐 OIDC Authorization Flow Generator\n');
  console.log('This tool helps you complete the OIDC authorization flow:\n');
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
    const issuer =
      (await question(
        `Issuer URL${defaultIssuer ? ` (default: ${defaultIssuer})` : ''}: `
      )) || defaultIssuer;

    if (!issuer) {
      console.error('❌ Issuer URL is required');
      return;
    }

    console.log(`\n📡 Fetching OpenID Configuration from: ${issuer}`);

    // Step 2: Fetch OpenID Configuration
    const openIdConfig = await fetchOpenIdConfiguration(issuer);
    console.log('✅ OpenID Configuration fetched successfully');
    console.log(
      `   Authorization Endpoint: ${openIdConfig.authorization_endpoint}`
    );
    console.log(`   Token Endpoint: ${openIdConfig.token_endpoint}`);
    console.log(`   Issuer: ${openIdConfig.issuer}\n`);

    // Step 3: Get client configuration
    const defaultClientId = getDefaultValue('CLIENT_ID', envTest);
    const clientId =
      (await question(
        `Client ID${defaultClientId ? ` (default: ${defaultClientId})` : ''}: `
      )) || defaultClientId;

    const defaultRedirectUri = getDefaultValue('REDIRECT_URI', envTest);
    const redirectUri =
      (await question(
        `Redirect URI${
          defaultRedirectUri ? ` (default: ${defaultRedirectUri})` : ''
        }: `
      )) || defaultRedirectUri;

    const scope = (await question('Scope (default: openid): ')) || 'openid';
    const responseType =
      (await question('Response Type (default: code): ')) || 'code';

    console.log(
      '\nℹ️  PKCE and state parameters are automatically generated (OAuth 2.1 compliance)'
    );

    const additionalParams: Record<string, string> = {};
    const addMore = await question(
      '\nAdd additional parameters? (y/n, default: n): '
    );

    if (addMore.toLowerCase() === 'y') {
      while (true) {
        const paramName = await question(
          'Parameter name (or press Enter to finish): '
        );
        if (!paramName) break;

        const paramValue = await question(`Value for ${paramName}: `);
        additionalParams[paramName] = paramValue;
      }
    }

    // Step 4: Generate authorization request
    const authParams = {
      authorizationEndpoint: openIdConfig.authorization_endpoint,
      clientId,
      redirectUri,
      scope,
      responseType,
      additionalParams,
    };

    const authResult = generateAuthorizationRequest(authParams, randomBytes);
    const expectedState = authResult.url.searchParams.get('state')!;

    // Output authorization URL
    console.log('\n' + '='.repeat(80));
    console.log('🔗 AUTHORIZATION REQUEST URL');
    console.log('='.repeat(80));
    console.log(authResult.url.toString());
    console.log('\n' + '='.repeat(80));

    console.log('📝 State parameter (for verification):');
    console.log(expectedState);
    console.log('');

    console.log('🔐 PKCE Code Verifier (for token exchange):');
    console.log(authResult.codeVerifier);
    console.log('');

    console.log('💡 Instructions:');
    console.log('1. Copy the URL above and paste it into your browser');
    console.log('2. Complete the authorization (login, consent, etc.)');
    console.log('3. You will be redirected to your redirect URI');
    console.log('4. Copy the entire redirected URL from your browser');
    console.log('5. Paste it below\n');

    // Step 5: Wait for manual authorization result
    const redirectUrl = await question('Enter the redirected URL: ');

    if (!redirectUrl.trim()) {
      console.log('\n⚠️  No redirect URL provided. Exiting.');
      return;
    }

    // Step 6: Extract authorization result using verifyAuthorizationResponse
    console.log('\n🔍 Analyzing redirect result...');
    try {
      const code = verifyAuthorizationResponse(redirectUrl, {
        state: expectedState,
        issuer: openIdConfig.original_issuer ?? openIdConfig.issuer,
        clientId,
        redirectUri,
      });
      // Step 7: Instructions for token exchange
      if (code) {
        console.log('\n' + '='.repeat(80));
        console.log('🔄 TOKEN EXCHANGE');
        console.log('='.repeat(80));
        console.log(`Token Endpoint: ${openIdConfig.token_endpoint}`);
        console.log(`Authorization Code: ${code}`);
        console.log(`Code Verifier: ${authResult.codeVerifier}`);
        console.log(`Client ID: ${clientId}`);
        console.log(`Redirect URI: ${redirectUri}`);
        console.log('='.repeat(80));

        console.log('\n📋 TOKEN EXCHANGE REQUEST:');
        console.log('POST', openIdConfig.token_endpoint);
        console.log('Content-Type: application/x-www-form-urlencoded');
        console.log('');
        console.log('grant_type=authorization_code');
        console.log(`code=${code}`);
        console.log(`redirect_uri=${encodeURIComponent(redirectUri)}`);
        console.log(`client_id=${encodeURIComponent(clientId)}`);
        console.log(`code_verifier=${authResult.codeVerifier}`);
        console.log('');

        console.log('🔍 ID TOKEN VALIDATION:');
        console.log('- Verify iss parameter matches the issuer URL');
        console.log('- Verify aud parameter matches the client_id');
        console.log('- Check token signature using JWKS endpoint');
        console.log('- Verify token expiration (exp claim)');
        console.log('- Validate nonce if provided');
      } else {
        console.log(
          '\n❌ No authorization code received. Token exchange cannot proceed.'
        );
      }
    } catch (error) {
      console.log('\n❌ Error analyzing redirect result:');
      if (error instanceof Error) {
        console.log('   ' + error.message);
      } else {
        console.log('   ' + String(error));
      }
      console.log(
        '\n⚠️  No authorization code received. Token exchange cannot proceed.'
      );
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
