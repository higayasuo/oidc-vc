import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fetchOpenIdConfiguration } from '../fetchOpenIdConfiguration';

describe('fetchOpenIdConfiguration', () => {
  // Production group
  describe('(production)', () => {
    let originalNodeEnv: string | undefined;
    const issuer = process.env.ISSUER!;

    beforeEach(() => {
      originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
    });

    afterEach(() => {
      if (originalNodeEnv !== undefined) {
        process.env.NODE_ENV = originalNodeEnv;
      } else {
        delete process.env.NODE_ENV;
      }
    });

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
      // The issuer should be normalized (without trailing slash)
      expect(config.issuer).toBe(issuer.replace(/\/$/, ''));
      expect(config.authorization_endpoint).toBeDefined();
      expect(config.token_endpoint).toBeDefined();
      expect(config.jwks_uri).toBeDefined();
    }, 10000);

    it('should validate issuer mismatch and throw error', async () => {
      // Mock fetch to return a response with different issuer
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            issuer: 'https://different-issuer.com',
            authorization_endpoint: 'https://different-issuer.com/auth',
            token_endpoint: 'https://different-issuer.com/token',
            jwks_uri: 'https://different-issuer.com/jwks',
            userinfo_endpoint: 'https://different-issuer.com/userinfo',
            pushed_authorization_request_endpoint:
              'https://different-issuer.com/par',
            revocation_endpoint: 'https://different-issuer.com/revoke',
            introspection_endpoint: 'https://different-issuer.com/introspect',
            response_types_supported: ['code', 'token'],
            subject_types_supported: ['public'],
            id_token_signing_alg_values_supported: ['RS256'],
          }),
      });

      await expect(fetchOpenIdConfiguration(issuer)).rejects.toThrow(
        'Issuer mismatch: received'
      );

      // Restore original fetch
      global.fetch = originalFetch;
    });

    it('should handle issuer with trailing slash in response', async () => {
      // Mock fetch to return a response with trailing slash in issuer
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            issuer: issuer + '/',
            authorization_endpoint: 'https://example.com/auth',
            token_endpoint: 'https://example.com/token',
            jwks_uri: 'https://example.com/jwks',
            userinfo_endpoint: 'https://example.com/userinfo',
            pushed_authorization_request_endpoint: 'https://example.com/par',
            revocation_endpoint: 'https://example.com/revoke',
            introspection_endpoint: 'https://example.com/introspect',
            response_types_supported: ['code', 'token'],
            subject_types_supported: ['public'],
            id_token_signing_alg_values_supported: ['RS256'],
          }),
      });

      const config = await fetchOpenIdConfiguration(issuer);
      expect(config.issuer).toContain(issuer);
      // original_issuer should not be present when issuer matches (no modification)
      expect(config.original_issuer).toBeUndefined();

      // Restore original fetch
      global.fetch = originalFetch;
    });
  });

  describe('(development/test)', () => {
    let originalNodeEnv: string | undefined;
    const issuer = process.env.TEST_ISSUER!;

    beforeEach(() => {
      originalNodeEnv = process.env.NODE_ENV;
    });

    afterEach(() => {
      if (originalNodeEnv !== undefined) {
        process.env.NODE_ENV = originalNodeEnv;
      } else {
        delete process.env.NODE_ENV;
      }
    });

    it('should convert production endpoints to local endpoints in development environment', async () => {
      process.env.NODE_ENV = 'development';
      const config = await fetchOpenIdConfiguration(issuer);
      expect(config).toBeDefined();
      expect(config.issuer).toContain(issuer);
      expect(config.authorization_endpoint).toContain(issuer);
      expect(config.token_endpoint).toContain(issuer);
      expect(config.jwks_uri).toContain(issuer);
      expect(config.userinfo_endpoint).toContain(issuer);
      expect(config.pushed_authorization_request_endpoint).toContain(issuer);
      expect(config.revocation_endpoint).toContain(issuer);
      expect(config.introspection_endpoint).toContain(issuer);
      // original_issuer should be present when issuer is modified
      expect(config.original_issuer).toBeDefined();
      expect(config.original_issuer).not.toBe(issuer);
    }, 10000);

    it('should convert production endpoints to local endpoints in test environment', async () => {
      process.env.NODE_ENV = 'test';
      const config = await fetchOpenIdConfiguration(issuer);
      expect(config).toBeDefined();
      expect(config.issuer).toContain(issuer);
      expect(config.authorization_endpoint).toContain(issuer);
      expect(config.token_endpoint).toContain(issuer);
      expect(config.jwks_uri).toContain(issuer);
      expect(config.userinfo_endpoint).toContain(issuer);
      expect(config.pushed_authorization_request_endpoint).toContain(issuer);
      expect(config.revocation_endpoint).toContain(issuer);
      expect(config.introspection_endpoint).toContain(issuer);
      // original_issuer should be present when issuer is modified
      expect(config.original_issuer).toBeDefined();
      expect(config.original_issuer).not.toBe(issuer);
    }, 10000);

    it('should preserve all non-endpoint properties in development environment', async () => {
      process.env.NODE_ENV = 'development';

      // Mock fetch to return a response with various properties
      const originalFetch = global.fetch;
      const mockResponse = {
        issuer: 'https://original-issuer.com',
        authorization_endpoint: 'https://original-issuer.com/auth',
        token_endpoint: 'https://original-issuer.com/token',
        jwks_uri: 'https://original-issuer.com/jwks',
        userinfo_endpoint: 'https://original-issuer.com/userinfo',
        response_types_supported: ['code', 'token'],
        subject_types_supported: ['public'],
        id_token_signing_alg_values_supported: ['RS256'],
        scopes_supported: ['openid', 'profile', 'email'],
        token_endpoint_auth_methods_supported: ['client_secret_basic'],
        claims_supported: ['sub', 'iss', 'name', 'email'],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const config = await fetchOpenIdConfiguration(issuer);

      // Endpoints should be converted to local issuer
      expect(config.authorization_endpoint).toContain(issuer);
      expect(config.token_endpoint).toContain(issuer);
      expect(config.jwks_uri).toContain(issuer);
      expect(config.userinfo_endpoint).toContain(issuer);

      // Non-endpoint properties should be preserved exactly
      expect(config.response_types_supported).toEqual(['code', 'token']);
      expect(config.subject_types_supported).toEqual(['public']);
      expect(config.id_token_signing_alg_values_supported).toEqual(['RS256']);
      expect(config.scopes_supported).toEqual(['openid', 'profile', 'email']);
      expect(config.token_endpoint_auth_methods_supported).toEqual([
        'client_secret_basic',
      ]);
      expect(config.claims_supported).toEqual(['sub', 'iss', 'name', 'email']);

      // Issuer should be updated
      expect(config.issuer).toBe(issuer);
      expect(config.original_issuer).toBe('https://original-issuer.com');

      // Restore original fetch
      global.fetch = originalFetch;
    });

    it('should preserve all non-endpoint properties in test environment', async () => {
      process.env.NODE_ENV = 'test';

      // Mock fetch to return a response with various properties
      const originalFetch = global.fetch;
      const mockResponse = {
        issuer: 'https://original-issuer.com',
        authorization_endpoint: 'https://original-issuer.com/auth',
        token_endpoint: 'https://original-issuer.com/token',
        jwks_uri: 'https://original-issuer.com/jwks',
        userinfo_endpoint: 'https://original-issuer.com/userinfo',
        response_types_supported: ['code', 'token'],
        subject_types_supported: ['public'],
        id_token_signing_alg_values_supported: ['RS256'],
        scopes_supported: ['openid', 'profile', 'email'],
        token_endpoint_auth_methods_supported: ['client_secret_basic'],
        claims_supported: ['sub', 'iss', 'name', 'email'],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const config = await fetchOpenIdConfiguration(issuer);

      // Endpoints should be converted to local issuer
      expect(config.authorization_endpoint).toContain(issuer);
      expect(config.token_endpoint).toContain(issuer);
      expect(config.jwks_uri).toContain(issuer);
      expect(config.userinfo_endpoint).toContain(issuer);

      // Non-endpoint properties should be preserved exactly
      expect(config.response_types_supported).toEqual(['code', 'token']);
      expect(config.subject_types_supported).toEqual(['public']);
      expect(config.id_token_signing_alg_values_supported).toEqual(['RS256']);
      expect(config.scopes_supported).toEqual(['openid', 'profile', 'email']);
      expect(config.token_endpoint_auth_methods_supported).toEqual([
        'client_secret_basic',
      ]);
      expect(config.claims_supported).toEqual(['sub', 'iss', 'name', 'email']);

      // Issuer should be updated
      expect(config.issuer).toBe(issuer);
      expect(config.original_issuer).toBe('https://original-issuer.com');

      // Restore original fetch
      global.fetch = originalFetch;
    });
  });
});
