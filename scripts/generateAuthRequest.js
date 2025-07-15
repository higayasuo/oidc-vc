#!/usr/bin/env node

/**
 * Standalone script to generate authorization request URLs for browser testing.
 *
 * Usage:
 *   node scripts/generateAuthRequest.js
 *
 * This script will prompt for configuration and output a URL that can be
 * copied and pasted into a browser for testing.
 */

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
  console.log('🔐 OIDC Authorization Request URL Generator\n');
  console.log(
    'This tool generates authorization request URLs for testing in browsers.\n'
  );

  try {
    // Get configuration from user
    const authorizationEndpoint = await question(
      'Authorization Endpoint URL: '
    );
    const clientId = await question('Client ID: ');
    const redirectUri = await question('Redirect URI: ');
    const scope = (await question('Scope (default: openid): ')) || 'openid';
    const responseType =
      (await question('Response Type (default: code): ')) || 'code';

    console.log(
      'ℹ️  PKCE and state parameters are automatically generated (OAuth 2.1 compliance)'
    );
    console.log('');

    const additionalParams = {};
    const addMore = await question(
      'Add additional parameters? (y/n, default: n): '
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

    // Generate the authorization request URL
    const params = {
      authorizationEndpoint,
      clientId,
      redirectUri,
      scope,
      responseType,
      additionalParams,
    };

    const result = generateAuthorizationRequest(params, randomBytes);

    // Output results
    console.log('\n' + '='.repeat(80));
    console.log('🔗 GENERATED AUTHORIZATION REQUEST URL');
    console.log('='.repeat(80));
    console.log(result.url.toString());
    console.log('\n' + '='.repeat(80));

    console.log('📝 State parameter (save this for verification):');
    console.log(result.url.searchParams.get('state'));
    console.log('');

    console.log('🔐 PKCE Code Verifier (save this for token exchange):');
    console.log(result.codeVerifier);
    console.log('');

    console.log(
      '💡 Copy the URL above and paste it into your browser to test the authorization flow.'
    );
    console.log('='.repeat(80));
  } catch (error) {
    console.error('❌ Error generating authorization request:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
