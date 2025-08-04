import { describe, it, expect } from 'vitest';
import { fetchPar } from '../fetchPar';
import { prepareParRequest } from '../prepareParRequest';
import { fetchOpenIdConfiguration } from '../../openid-configuration/fetchOpenIdConfiguration';
import { randomBytes } from 'crypto';
import type { RandomBytes } from '@/types';

// Create a RandomBytes function from crypto.randomBytes
const mockRandomBytes: RandomBytes = (byteLength = 32) => {
  return new Uint8Array(randomBytes(byteLength));
};

describe('fetchPar', () => {
  const issuer = process.env.TEST_ISSUER || process.env.ISSUER!;
  const clientId = process.env.CLIENT_ID!;
  const clientSecret = process.env.CLIENT_SECRET!;
  const redirectUri = process.env.REDIRECT_URI!;

  it('should successfully fetch PAR response from real issuer', async () => {
    // First, fetch the OpenID configuration to get the PAR endpoint
    const openIdConfig = await fetchOpenIdConfiguration(issuer);
    expect(openIdConfig.pushed_authorization_request_endpoint).toBeDefined();
    console.log(openIdConfig.pushed_authorization_request_endpoint);

    // Prepare PAR request using prepareParRequest
    const parRequest = await prepareParRequest(
      {
        clientId,
        clientSecret,
        redirectUri,
        scope: 'org.iso.18013.5.1.mDL openid',
      },
      mockRandomBytes
    );

    // Fetch PAR response using the prepared request
    const parResponse = await fetchPar({
      endpoint: openIdConfig.pushed_authorization_request_endpoint!,
      body: parRequest.body,
      headers: parRequest.headers,
    });

    expect(parResponse).toBeDefined();
    expect(parResponse.request_uri).toBeDefined();
    expect(typeof parResponse.request_uri).toBe('string');
    expect(parResponse.expires_in).toBeDefined();
    expect(typeof parResponse.expires_in).toBe('number');
    expect(parResponse.expires_in).toBeGreaterThan(0);

    console.log(`✅ Successfully fetched PAR response`);
    console.log('Request URI:', parResponse.request_uri);
    console.log('Expires in:', parResponse.expires_in, 'seconds');
  }, 15000);

  it('should handle invalid PAR endpoint', async () => {
    const invalidParEndpoint =
      'https://invalid-par-endpoint-that-does-not-exist.com/par';

    // Prepare a valid PAR request
    const parRequest = await prepareParRequest(
      {
        clientId: 'test-client',
        redirectUri: 'https://example.com/callback',
        scope: 'openid',
      },
      mockRandomBytes
    );

    // Try to fetch from invalid endpoint
    await expect(
      fetchPar({
        endpoint: invalidParEndpoint,
        body: parRequest.body,
        headers: parRequest.headers,
      })
    ).rejects.toThrow(/Failed to fetch from/);
  }, 10000);
});
