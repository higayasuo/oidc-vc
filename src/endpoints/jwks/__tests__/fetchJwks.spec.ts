import { describe, it, expect } from 'vitest';
import { fetchJwks } from '../fetchJwks';
import { fetchOpenIdConfiguration } from '../../openid-configuration/fetchOpenIdConfiguration';

describe('fetchJwks', () => {
  const issuer = process.env.TEST_ISSUER || process.env.ISSUER!;

  it('should successfully fetch JWKS from real issuer', async () => {
    // First, fetch the OpenID configuration to get the JWKS URI
    const openIdConfig = await fetchOpenIdConfiguration(issuer);
    expect(openIdConfig.jwks_uri).toBeDefined();
    console.log(openIdConfig.jwks_uri);

    // Then fetch the JWKS using the URI from the configuration
    const jwks = await fetchJwks(openIdConfig.jwks_uri);

    expect(jwks).toBeDefined();
    expect(Array.isArray(jwks)).toBe(true);
    expect(jwks.length).toBeGreaterThan(0);

    // Validate that each key in the JWKS has the required structure
    jwks.forEach((jwk) => {
      expect(jwk).toBeDefined();
      expect(jwk.kty).toBeDefined();
      expect(['RSA', 'EC', 'OKP']).toContain(jwk.kty);

      // Validate key type specific requirements
      switch (jwk.kty) {
        case 'RSA':
          expect(jwk.n).toBeDefined();
          expect(jwk.e).toBeDefined();
          break;
        case 'EC':
          expect(jwk.crv).toBeDefined();
          expect(['P-256', 'P-384', 'P-521']).toContain(jwk.crv);
          expect(jwk.x).toBeDefined();
          expect(jwk.y).toBeDefined();
          break;
        case 'OKP':
          expect(jwk.crv).toBeDefined();
          expect(['Ed25519', 'Ed448', 'X25519', 'X448']).toContain(jwk.crv);
          expect(jwk.x).toBeDefined();
          break;
      }

      // Validate common fields if present
      if (jwk.kid) {
        expect(typeof jwk.kid).toBe('string');
      }
      if (jwk.use) {
        expect(['sig', 'enc']).toContain(jwk.use);
      }
      if (jwk.alg) {
        expect(typeof jwk.alg).toBe('string');
      }
    });

    console.log(`✅ Successfully fetched ${jwks.length} keys from JWKS`);
    console.log('Key types found:', [...new Set(jwks.map((key) => key.kty))]);
  }, 15000);

  it('should handle invalid JWKS URI', async () => {
    const invalidJwksUri =
      'https://invalid-jwks-uri-that-does-not-exist.com/jwks';

    await expect(fetchJwks(invalidJwksUri)).rejects.toThrow(
      /Failed to fetch from/
    );
  }, 10000);
});
