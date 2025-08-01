import { describe, it, expect } from 'vitest';
import { fetchOpenIdConfiguration } from '../fetchOpenIdConfiguration';

describe('fetchOpenIdConfiguration', () => {
  // Production group
  describe('(production)', () => {
    const issuer = process.env.TEST_ISSUER!;

    it('should successfully fetch OpenID Configuration from real issuer', async () => {
      const config = await fetchOpenIdConfiguration(issuer);
      expect(config).toBeDefined();
      expect(config.issuer).toBeDefined();
      expect(config.authorization_endpoint).toMatch(/^https?:\/\/.+/);
      expect(config.token_endpoint).toMatch(/^https?:\/\/.+/);
      expect(config.jwks_uri).toMatch(/^https?:\/\/.+/);
      expect(config.userinfo_endpoint).toMatch(/^https?:\/\/.+/);
      expect(config.pushed_authorization_request_endpoint).toMatch(
        /^https?:\/\/.+/
      );
      expect(config.revocation_endpoint).toMatch(/^https?:\/\/.+/);
      expect(config.introspection_endpoint).toMatch(/^https?:\/\/.+/);
    }, 10000);

    it('should handle invalid issuer URL', async () => {
      const invalidIssuer = 'https://invalid-issuer-that-does-not-exist.com';
      await expect(fetchOpenIdConfiguration(invalidIssuer)).rejects.toThrow(
        /Failed to fetch from/
      );
    }, 10000);

    it('should handle issuer with trailing slash', async () => {
      const issuerWithTrailingSlash = issuer + '/';
      const config = await fetchOpenIdConfiguration(issuerWithTrailingSlash);
      // The response should contain the server's issuer, not the normalized request issuer
      expect(config.issuer).toBeDefined();
      expect(config.authorization_endpoint).toBeDefined();
      expect(config.token_endpoint).toBeDefined();
      expect(config.jwks_uri).toBeDefined();
    }, 10000);
  });
});
