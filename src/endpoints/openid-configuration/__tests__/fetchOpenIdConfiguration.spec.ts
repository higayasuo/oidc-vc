import { describe, it, expect } from 'vitest';
import { fetchOpenIdConfiguration } from '../fetchOpenIdConfiguration';
import { TEST_ISSUER } from '@/testing/constants';

describe('fetchOpenIdConfiguration', () => {
  it('should successfully fetch OpenID Configuration from real issuer', async () => {
    const config = await fetchOpenIdConfiguration(TEST_ISSUER);

    // Verify the response structure
    expect(config).toBeDefined();
    expect(config.issuer).toBe(TEST_ISSUER);
    // Verify required endpoints are present
    expect(config.authorization_endpoint).toMatch(/^https?:\/\/.+/);
    expect(config.token_endpoint).toMatch(/^https?:\/\/.+/);
    expect(config.jwks_uri).toMatch(/^https?:\/\/.+/);
    expect(config.userinfo_endpoint).toMatch(/^https?:\/\/.+/);
    expect(config.pushed_authorization_request_endpoint).toMatch(/^https?:\/\/.+/);
    expect(config.revocation_endpoint).toMatch(/^https?:\/\/.+/);
    expect(config.introspection_endpoint).toMatch(/^https?:\/\/.+/);
  }, 10000); // 10 second timeout for real API call

  it('should handle invalid issuer URL', async () => {
    const invalidIssuer = 'https://invalid-issuer-that-does-not-exist.com';

    await expect(fetchOpenIdConfiguration(invalidIssuer))
      .rejects
      .toThrow(/Failed to fetch from/);
  }, 10000);

  it('should handle issuer with trailing slash', async () => {
    const issuerWithTrailingSlash = TEST_ISSUER + '/';
    const config = await fetchOpenIdConfiguration(issuerWithTrailingSlash);

    expect(config.issuer).toBe(TEST_ISSUER);
    expect(config.authorization_endpoint).toBeDefined();
    expect(config.token_endpoint).toBeDefined();
    expect(config.jwks_uri).toBeDefined();
  }, 10000);
});