import { describe, it, expect } from 'vitest';
import { getJwk } from '../getJwk';
import type { Jwk } from '../JwksResponse';

describe('getJwk', () => {
  const mockRsaJwk: Jwk = {
    kty: 'RSA',
    n: 'AQAB',
    e: 'AQAB',
    kid: 'rsa-key-1',
    use: 'sig',
    alg: 'RS256',
  };

  const mockEcJwk: Jwk = {
    kty: 'EC',
    crv: 'P-256',
    x: 'x-coordinate-base64url',
    y: 'y-coordinate-base64url',
    kid: 'ec-key-1',
    use: 'sig',
    alg: 'ES256',
  };

  const mockOkpJwk: Jwk = {
    kty: 'OKP',
    crv: 'Ed25519',
    x: 'public-key-base64url',
    kid: 'okp-key-1',
    use: 'sig',
    alg: 'EdDSA',
  };

  describe('finding by kid', () => {
    it('should find JWK by exact kid match', () => {
      const jwks = [mockRsaJwk, mockEcJwk, mockOkpJwk];
      const result = getJwk(jwks, 'rsa-key-1');

      expect(result).toBe(mockRsaJwk);
      expect(result.kty).toBe('RSA');
      expect(result.kid).toBe('rsa-key-1');
    });

    it('should find JWK by different kid', () => {
      const jwks = [mockRsaJwk, mockEcJwk, mockOkpJwk];
      const result = getJwk(jwks, 'ec-key-1');

      expect(result).toBe(mockEcJwk);
      expect(result.kty).toBe('EC');
      expect(result.kid).toBe('ec-key-1');
    });

    it('should find OKP JWK by kid', () => {
      const jwks = [mockRsaJwk, mockEcJwk, mockOkpJwk];
      const result = getJwk(jwks, 'okp-key-1');

      expect(result).toBe(mockOkpJwk);
      expect(result.kty).toBe('OKP');
      expect(result.kid).toBe('okp-key-1');
    });

    it('should throw error when kid is not found', () => {
      const jwks = [mockRsaJwk, mockEcJwk, mockOkpJwk];

      expect(() => getJwk(jwks, 'non-existent-key')).toThrow(
        'JWK with kid "non-existent-key" not found'
      );
    });

    it('should throw error when kid is empty string', () => {
      const jwks = [mockRsaJwk, mockEcJwk, mockOkpJwk];

      expect(() => getJwk(jwks, '')).toThrow('JWK with kid "" not found');
    });

    it('should be case sensitive for kid matching', () => {
      const jwks = [mockRsaJwk, mockEcJwk, mockOkpJwk];

      expect(() => getJwk(jwks, 'RSA-KEY-1')).toThrow(
        'JWK with kid "RSA-KEY-1" not found'
      );
    });
  });

  describe('single JWK fallback', () => {
    it('should return single JWK when no kid provided', () => {
      const jwks = [mockRsaJwk];
      const result = getJwk(jwks, undefined);

      expect(result).toBe(mockRsaJwk);
      expect(result.kty).toBe('RSA');
    });

    it('should return single JWK when kid is null', () => {
      const jwks = [mockEcJwk];
      const result = getJwk(jwks, null as any);

      expect(result).toBe(mockEcJwk);
      expect(result.kty).toBe('EC');
    });

    it('should throw error when kid is empty string and single JWK exists', () => {
      const jwks = [mockOkpJwk];

      expect(() => getJwk(jwks, '')).toThrow('JWK with kid "" not found');
    });

    it('should work with single JWK without kid', () => {
      const jwkWithoutKid: Jwk = {
        kty: 'RSA',
        n: 'AQAB',
        e: 'AQAB',
        use: 'sig',
        alg: 'RS256',
      };

      const jwks = [jwkWithoutKid];
      const result = getJwk(jwks, undefined);

      expect(result).toBe(jwkWithoutKid);
      expect(result.kty).toBe('RSA');
      expect(result.kid).toBeUndefined();
    });
  });

  describe('error cases', () => {
    it('should throw error when no kid provided and multiple JWKs exist', () => {
      const jwks = [mockRsaJwk, mockEcJwk];

      expect(() => getJwk(jwks, undefined)).toThrow(
        'No kid provided and more than one JWK found'
      );
    });

    it('should throw error when no kid provided and multiple JWKs exist (3 keys)', () => {
      const jwks = [mockRsaJwk, mockEcJwk, mockOkpJwk];

      expect(() => getJwk(jwks, undefined)).toThrow(
        'No kid provided and more than one JWK found'
      );
    });

    it('should throw error when no kid provided and empty JWKS', () => {
      const jwks: Jwk[] = [];

      expect(() => getJwk(jwks, undefined)).toThrow(
        'No kid provided and more than one JWK found'
      );
    });

    it('should throw error when kid is null and multiple JWKs exist', () => {
      const jwks = [mockRsaJwk, mockEcJwk];

      expect(() => getJwk(jwks, null as any)).toThrow(
        'No kid provided and more than one JWK found'
      );
    });
  });

  describe('edge cases', () => {
    it('should handle JWK with empty kid', () => {
      const jwkWithEmptyKid: Jwk = {
        kty: 'RSA',
        n: 'AQAB',
        e: 'AQAB',
        kid: '',
        use: 'sig',
        alg: 'RS256',
      };

      const jwks = [jwkWithEmptyKid];
      const result = getJwk(jwks, '');

      expect(result).toBe(jwkWithEmptyKid);
    });

    it('should handle JWK with undefined kid', () => {
      const jwkWithUndefinedKid: Jwk = {
        kty: 'RSA',
        n: 'AQAB',
        e: 'AQAB',
        use: 'sig',
        alg: 'RS256',
      };

      const jwks = [jwkWithUndefinedKid];
      const result = getJwk(jwks, undefined);

      expect(result).toBe(jwkWithUndefinedKid);
    });

    it('should handle multiple JWKs with same kid (first match wins)', () => {
      const duplicateJwk: Jwk = {
        kty: 'RSA',
        n: 'AQAB',
        e: 'AQAB',
        kid: 'rsa-key-1',
        use: 'enc',
        alg: 'RSA-OAEP',
      };

      const jwks = [mockRsaJwk, duplicateJwk];
      const result = getJwk(jwks, 'rsa-key-1');

      // Should return the first match
      expect(result).toBe(mockRsaJwk);
      expect(result.use).toBe('sig');
    });
  });

  describe('real-world scenarios', () => {
    it('should work with typical OIDC JWKS structure', () => {
      const typicalJwks: Jwk[] = [
        {
          kty: 'RSA',
          n: 'AQAB',
          e: 'AQAB',
          kid: 'signing-key',
          use: 'sig',
          alg: 'RS256',
        },
        {
          kty: 'EC',
          crv: 'P-256',
          x: 'x-coordinate',
          y: 'y-coordinate',
          kid: 'encryption-key',
          use: 'enc',
          alg: 'ECDH-ES',
        },
      ];

      // Find signing key
      const signingKey = getJwk(typicalJwks, 'signing-key');
      expect(signingKey.kid).toBe('signing-key');
      expect(signingKey.use).toBe('sig');

      // Find encryption key
      const encryptionKey = getJwk(typicalJwks, 'encryption-key');
      expect(encryptionKey.kid).toBe('encryption-key');
      expect(encryptionKey.use).toBe('enc');
    });

    it('should handle single key scenario (common in development)', () => {
      const singleKey: Jwk[] = [
        {
          kty: 'RSA',
          n: 'AQAB',
          e: 'AQAB',
          use: 'sig',
          alg: 'RS256',
        },
      ];

      const result = getJwk(singleKey, undefined);
      expect(result.kty).toBe('RSA');
      expect(result.use).toBe('sig');
    });
  });
});
