#!/usr/bin/env node

/**
 * Complete OIDC Authorization Flow Script
 *
 * Usage:
 *   node scripts/authorizationFlow.js
 *
 * This script:
 * 1. Takes an issuer URL
 * 2. Fetches OpenID Configuration
 * 3. Generates authorization request URL
 * 4. Provides instructions for the complete flow
 */

import { fetchOpenIdConfiguration } from '../dist/index.mjs';
import { generateAuthorizationRequest } from '../dist/index.mjs';
import { createInterface } from 'node:readline';
import { randomBytes as nodeRandomBytes } from 'crypto';

// Adapter: Node.js randomBytes to Uint8Array for RandomBytes type
const randomBytes = (byteLength = 32) => {
  return new Uint8Array(nodeRandomBytes(byteLength));
};

// Create readline interface
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to prompt for input
const question = (query) => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

async function main() {
  console.log('🔐 OIDC Authorization Flow Generator\n');
  console.log('This tool helps you complete the OIDC authorization flow:\n');
  console.log('1. Fetch OpenID Configuration from issuer');
  console.log('2. Generate authorization request URL');
  console.log('3. Handle authorization response');
  console.log('4. Exchange authorization code for tokens');
  console.log('5. Validate ID Token\n');

  try {
    // Step 1: Get issuer URL
    const issuer = await question('Issuer URL: ');
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
    const clientId = await question('Client ID: ');
    const redirectUri = await question('Redirect URI: ');
    const scope = (await question('Scope (default: openid): ')) || 'openid';
    const responseType =
      (await question('Response Type (default: code): ')) || 'code';

    console.log(
      '\nℹ️  PKCE and state parameters are automatically generated (OAuth 2.1 compliance)'
    );

    const additionalParams = {};
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

    // Output results
    console.log('\n' + '='.repeat(80));
    console.log('🔗 STEP 1: AUTHORIZATION REQUEST URL');
    console.log('='.repeat(80));
    console.log(authResult.url.toString());
    console.log('\n' + '='.repeat(80));

    console.log('📝 State parameter (save this for verification):');
    console.log(authResult.url.searchParams.get('state'));
    console.log('');

    console.log('🔐 PKCE Code Verifier (save this for token exchange):');
    console.log(authResult.codeVerifier);
    console.log('');

    console.log(
      '💡 Copy the URL above and paste it into your browser to start the authorization flow.'
    );
    console.log('='.repeat(80));

    // Step 5: Instructions for next steps
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Open the URL in your browser');
    console.log('2. Complete the authorization');
    console.log(
      '3. You will be redirected to your redirect URI with authorization code'
    );
    console.log('4. Extract the authorization code from the redirect URL');
    console.log(
      '5. Use the code_verifier above to exchange the code for tokens'
    );
    console.log('6. Validate the ID Token using the issuer and client_id\n');

    console.log('🔍 AUTHORIZATION RESPONSE VALIDATION:');
    console.log('- Verify state parameter matches the one above');
    console.log('- Verify iss parameter matches the issuer URL');
    console.log('- Check for error parameters in the response\n');

    console.log('🔄 TOKEN EXCHANGE:');
    console.log(`- Token Endpoint: ${openIdConfig.token_endpoint}`);
    console.log('- Use authorization code from redirect URL');
    console.log('- Include code_verifier in the request');
    console.log('- Validate ID Token signature and claims\n');
  } catch (error) {
    console.error('❌ Error in authorization flow:', error.message);
    if (error.cause) {
      console.error('   Cause:', error.cause.message);
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
