import { describe, it, expect } from 'vitest';
import { leftMostHalfHash } from '../leftMostHalfHash';

describe('leftMostHalfHash', () => {
  const testData =
    'YmJiZTAwYmYtMzgyOC00NzhkLTkyOTItNjJjNDM3MGYzOWIy9sFhvH8K_x8UIHj1osisS57f5DduL';

  describe('SHA-256 algorithms', () => {
    const expectedSha256 = 'xsZZrUssMXjL3FBlzoSh2g';

    it('should generate correct hash for RS256', () => {
      const result = leftMostHalfHash(testData, 'RS256');
      expect(result).toBe(expectedSha256);
    });

    it('should generate correct hash for PS256', () => {
      const result = leftMostHalfHash(testData, 'PS256');
      expect(result).toBe(expectedSha256);
    });

    it('should generate correct hash for ES256', () => {
      const result = leftMostHalfHash(testData, 'ES256');
      expect(result).toBe(expectedSha256);
    });

    it('should generate correct hash for ES256K', () => {
      const result = leftMostHalfHash(testData, 'ES256K');
      expect(result).toBe(expectedSha256);
    });

    it('should generate correct hash for HS256', () => {
      const result = leftMostHalfHash(testData, 'HS256');
      expect(result).toBe(expectedSha256);
    });
  });

  describe('SHA-384 algorithms', () => {
    const expectedSha384 = 'adt46pcdiB-l6eTNifgoVM-5AIJAxq84';

    it('should generate correct hash for RS384', () => {
      const result = leftMostHalfHash(testData, 'RS384');
      expect(result).toBe(expectedSha384);
    });

    it('should generate correct hash for PS384', () => {
      const result = leftMostHalfHash(testData, 'PS384');
      expect(result).toBe(expectedSha384);
    });

    it('should generate correct hash for ES384', () => {
      const result = leftMostHalfHash(testData, 'ES384');
      expect(result).toBe(expectedSha384);
    });

    it('should generate correct hash for HS384', () => {
      const result = leftMostHalfHash(testData, 'HS384');
      expect(result).toBe(expectedSha384);
    });
  });

  describe('SHA-512 algorithms', () => {
    const expectedSha512 = 'p2LHG4H-8pYDc0hyVOo3iIHvZJUqe9tbj3jESOuXbkY';

    it('should generate correct hash for RS512', () => {
      const result = leftMostHalfHash(testData, 'RS512');
      expect(result).toBe(expectedSha512);
    });

    it('should generate correct hash for PS512', () => {
      const result = leftMostHalfHash(testData, 'PS512');
      expect(result).toBe(expectedSha512);
    });

    it('should generate correct hash for ES512', () => {
      const result = leftMostHalfHash(testData, 'ES512');
      expect(result).toBe(expectedSha512);
    });

    it('should generate correct hash for HS512', () => {
      const result = leftMostHalfHash(testData, 'HS512');
      expect(result).toBe(expectedSha512);
    });
  });

  describe('EdDSA algorithms', () => {
    const expectedEdDsa = 'p2LHG4H-8pYDc0hyVOo3iIHvZJUqe9tbj3jESOuXbkY';

    it('should generate correct hash for EdDSA', () => {
      const result = leftMostHalfHash(testData, 'EdDSA');
      expect(result).toBe(expectedEdDsa);
    });

    it('should generate correct hash for Ed25519', () => {
      const result = leftMostHalfHash(testData, 'Ed25519');
      expect(result).toBe(expectedEdDsa);
    });
  });

  describe('function behavior', () => {
    it('should return string', () => {
      const result = leftMostHalfHash('test', 'ES256');
      expect(typeof result).toBe('string');
    });

    it('should return Base64URL format string', () => {
      const result = leftMostHalfHash('test', 'ES256');
      // Base64URL can contain: A-Z, a-z, 0-9, -, _
      const validBase64UrlChars = /^[A-Za-z0-9_-]+$/;
      expect(result).toMatch(validBase64UrlChars);
    });

    it('should return consistent results for same input', () => {
      const result1 = leftMostHalfHash('test', 'ES256');
      const result2 = leftMostHalfHash('test', 'ES256');
      expect(result1).toBe(result2);
    });

    it('should return different results for different inputs', () => {
      const result1 = leftMostHalfHash('test1', 'ES256');
      const result2 = leftMostHalfHash('test2', 'ES256');
      expect(result1).not.toBe(result2);
    });

    it('should handle empty string', () => {
      const result = leftMostHalfHash('', 'ES256');
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it('should handle special characters', () => {
      const result = leftMostHalfHash('test@#$%^&*()', 'ES256');
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it('should handle unicode characters', () => {
      const result = leftMostHalfHash('テスト', 'ES256');
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^[A-Za-z0-9_-]+$/);
    });
  });

  describe('string length validation', () => {
    it('should return 22 characters for SHA-256 algorithms', () => {
      const algorithms = ['ES256', 'RS256', 'PS256', 'HS256'];
      algorithms.forEach((alg) => {
        const result = leftMostHalfHash('test', alg);
        expect(result.length).toBe(22); // 16 bytes encoded as Base64URL
      });
    });

    it('should return 32 characters for SHA-384 algorithms', () => {
      const algorithms = ['ES384', 'RS384', 'PS384', 'HS384'];
      algorithms.forEach((alg) => {
        const result = leftMostHalfHash('test', alg);
        expect(result.length).toBe(32); // 24 bytes encoded as Base64URL
      });
    });

    it('should return 43 characters for SHA-512 algorithms', () => {
      const algorithms = ['ES512', 'RS512', 'PS512', 'HS512'];
      algorithms.forEach((alg) => {
        const result = leftMostHalfHash('test', alg);
        expect(result.length).toBe(43); // 32 bytes encoded as Base64URL
      });
    });

    it('should return 43 characters for EdDSA (uses SHA-512)', () => {
      const result = leftMostHalfHash('test', 'EdDSA');
      expect(result.length).toBe(43); // 32 bytes encoded as Base64URL
    });
  });

  describe('error handling', () => {
    it('should throw error for unsupported algorithm', () => {
      expect(() => {
        leftMostHalfHash('test', 'INVALID');
      }).toThrow('Invalid algorithm: INVALID');
    });

    it('should throw error for algorithm without three-digit number', () => {
      expect(() => {
        leftMostHalfHash('test', 'ES');
      }).toThrow('Invalid algorithm: ES');
    });

    it('should throw error for unsupported key size', () => {
      expect(() => {
        leftMostHalfHash('test', 'A128GCM');
      }).toThrow('Unsupported key size: 128 bits');
    });
  });

  describe('Base64URL format validation', () => {
    it('should return valid Base64URL for SHA-256', () => {
      const result = leftMostHalfHash(testData, 'ES256');
      expect(result).toBe('xsZZrUssMXjL3FBlzoSh2g');
      expect(result).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it('should return valid Base64URL for SHA-384', () => {
      const result = leftMostHalfHash(testData, 'ES384');
      expect(result).toBe('adt46pcdiB-l6eTNifgoVM-5AIJAxq84');
      expect(result).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it('should return valid Base64URL for SHA-512', () => {
      const result = leftMostHalfHash(testData, 'ES512');
      expect(result).toBe('p2LHG4H-8pYDc0hyVOo3iIHvZJUqe9tbj3jESOuXbkY');
      expect(result).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it('should return valid Base64URL for EdDSA', () => {
      const result = leftMostHalfHash(testData, 'EdDSA');
      expect(result).toBe('p2LHG4H-8pYDc0hyVOo3iIHvZJUqe9tbj3jESOuXbkY');
      expect(result).toMatch(/^[A-Za-z0-9_-]+$/);
    });
  });
});
