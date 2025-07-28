import { describe, it, expect } from 'vitest';
import { extractKeyBitsFromAlg } from '../extractKeyBitsFromAlg';

describe('extractKeyBitsFromAlg', () => {
  describe('valid algorithms', () => {
    it('should extract key bits from ES256 algorithm', () => {
      const result = extractKeyBitsFromAlg('ES256');
      expect(result).toBe(256);
    });

    it('should extract key bits from ES384 algorithm', () => {
      const result = extractKeyBitsFromAlg('ES384');
      expect(result).toBe(384);
    });

    it('should extract key bits from ES512 algorithm', () => {
      const result = extractKeyBitsFromAlg('ES512');
      expect(result).toBe(512);
    });

    it('should extract key bits from RS256 algorithm', () => {
      const result = extractKeyBitsFromAlg('RS256');
      expect(result).toBe(256);
    });

    it('should extract key bits from RS384 algorithm', () => {
      const result = extractKeyBitsFromAlg('RS384');
      expect(result).toBe(384);
    });

    it('should extract key bits from RS512 algorithm', () => {
      const result = extractKeyBitsFromAlg('RS512');
      expect(result).toBe(512);
    });

    it('should extract key bits from PS256 algorithm', () => {
      const result = extractKeyBitsFromAlg('PS256');
      expect(result).toBe(256);
    });

    it('should extract key bits from PS384 algorithm', () => {
      const result = extractKeyBitsFromAlg('PS384');
      expect(result).toBe(384);
    });

    it('should extract key bits from PS512 algorithm', () => {
      const result = extractKeyBitsFromAlg('PS512');
      expect(result).toBe(512);
    });

    it('should extract key bits from HS256 algorithm', () => {
      const result = extractKeyBitsFromAlg('HS256');
      expect(result).toBe(256);
    });

    it('should extract key bits from HS384 algorithm', () => {
      const result = extractKeyBitsFromAlg('HS384');
      expect(result).toBe(384);
    });

    it('should extract key bits from HS512 algorithm', () => {
      const result = extractKeyBitsFromAlg('HS512');
      expect(result).toBe(512);
    });

    it('should extract key bits from A128GCM algorithm', () => {
      const result = extractKeyBitsFromAlg('A128GCM');
      expect(result).toBe(128);
    });

    it('should extract key bits from A192GCM algorithm', () => {
      const result = extractKeyBitsFromAlg('A192GCM');
      expect(result).toBe(192);
    });

    it('should extract key bits from A256GCM algorithm', () => {
      const result = extractKeyBitsFromAlg('A256GCM');
      expect(result).toBe(256);
    });

    it('should extract key bits from A128KW algorithm', () => {
      const result = extractKeyBitsFromAlg('A128KW');
      expect(result).toBe(128);
    });

    it('should extract key bits from A192KW algorithm', () => {
      const result = extractKeyBitsFromAlg('A192KW');
      expect(result).toBe(192);
    });

    it('should extract key bits from A256KW algorithm', () => {
      const result = extractKeyBitsFromAlg('A256KW');
      expect(result).toBe(256);
    });

    it('should extract key bits from RSA-OAEP-256 algorithm', () => {
      const result = extractKeyBitsFromAlg('RSA-OAEP-256');
      expect(result).toBe(256);
    });

    it('should extract key bits from RSA-OAEP-384 algorithm', () => {
      const result = extractKeyBitsFromAlg('RSA-OAEP-384');
      expect(result).toBe(384);
    });

    it('should extract key bits from RSA-OAEP-512 algorithm', () => {
      const result = extractKeyBitsFromAlg('RSA-OAEP-512');
      expect(result).toBe(512);
    });
  });

  describe('EdDSA algorithms', () => {
    it('should return 512 for EdDSA algorithm', () => {
      const result = extractKeyBitsFromAlg('EdDSA');
      expect(result).toBe(512);
    });

    it('should return 512 for Ed25519 algorithm', () => {
      const result = extractKeyBitsFromAlg('Ed25519');
      expect(result).toBe(512);
    });
  });

  describe('algorithms with multiple numbers', () => {
    it('should extract the last three-digit number from ES256-RSA2048', () => {
      const result = extractKeyBitsFromAlg('ES256-RSA2048');
      expect(result).toBe(48);
    });

    it('should extract the last three-digit number from RSA1024-ES384', () => {
      const result = extractKeyBitsFromAlg('RSA1024-ES384');
      expect(result).toBe(384);
    });

    it('should extract the last three-digit number from A128GCM-256', () => {
      const result = extractKeyBitsFromAlg('A128GCM-256');
      expect(result).toBe(256);
    });

    it('should extract the last three-digit number from RSA2048-ES512', () => {
      const result = extractKeyBitsFromAlg('RSA2048-ES512');
      expect(result).toBe(512);
    });

    it('should extract the last three-digit number from ES256-384-512', () => {
      const result = extractKeyBitsFromAlg('ES256-384-512');
      expect(result).toBe(512);
    });
  });

  describe('edge cases', () => {
    it('should extract key bits from algorithm with leading zeros', () => {
      const result = extractKeyBitsFromAlg('ES0256');
      expect(result).toBe(256);
    });

    it('should extract key bits from algorithm with trailing zeros', () => {
      const result = extractKeyBitsFromAlg('ES2560');
      expect(result).toBe(560);
    });

    it('should extract key bits from algorithm with underscores', () => {
      const result = extractKeyBitsFromAlg('ES_256');
      expect(result).toBe(256);
    });

    it('should extract key bits from algorithm with dashes', () => {
      const result = extractKeyBitsFromAlg('ES-256');
      expect(result).toBe(256);
    });

    it('should extract key bits from algorithm with dots', () => {
      const result = extractKeyBitsFromAlg('ES.256');
      expect(result).toBe(256);
    });

    it('should extract key bits from algorithm with spaces', () => {
      const result = extractKeyBitsFromAlg('ES 256');
      expect(result).toBe(256);
    });

    it('should extract key bits from algorithm with mixed separators', () => {
      const result = extractKeyBitsFromAlg('ES-256_RSA.512');
      expect(result).toBe(512);
    });
  });

  describe('invalid algorithms', () => {
    it('should throw error for algorithm without three-digit number', () => {
      expect(() => {
        extractKeyBitsFromAlg('ES');
      }).toThrow('Invalid algorithm: ES');
    });

    it('should throw error for algorithm with two-digit number', () => {
      expect(() => {
        extractKeyBitsFromAlg('ES25');
      }).toThrow('Invalid algorithm: ES25');
    });

    it('should extract key bits from algorithm with four-digit number', () => {
      const result = extractKeyBitsFromAlg('ES2560');
      expect(result).toBe(560);
    });

    it('should throw error for empty string', () => {
      expect(() => {
        extractKeyBitsFromAlg('');
      }).toThrow('Invalid algorithm: ');
    });

    it('should throw error for algorithm with only letters', () => {
      expect(() => {
        extractKeyBitsFromAlg('ESABCD');
      }).toThrow('Invalid algorithm: ESABCD');
    });

    it('should throw error for algorithm with only numbers less than 100', () => {
      expect(() => {
        extractKeyBitsFromAlg('ES99');
      }).toThrow('Invalid algorithm: ES99');
    });

    it('should extract key bits from algorithm with numbers greater than 999', () => {
      const result = extractKeyBitsFromAlg('ES1000');
      expect(result).toBe(0);
    });

    it('should extract key bits from algorithm with mixed case', () => {
      const result = extractKeyBitsFromAlg('es256');
      expect(result).toBe(256);
    });

    it('should extract key bits from algorithm with special characters', () => {
      const result = extractKeyBitsFromAlg('ES@256');
      expect(result).toBe(256);
    });
  });

  describe('specific error message format', () => {
    it('should throw error with specific message format', () => {
      try {
        extractKeyBitsFromAlg('INVALID');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Invalid algorithm: INVALID');
      }
    });

    it('should throw error with specific message format for empty string', () => {
      try {
        extractKeyBitsFromAlg('');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Invalid algorithm: ');
      }
    });
  });

  describe('return type validation', () => {
    it('should return a number', () => {
      const result = extractKeyBitsFromAlg('ES256');
      expect(typeof result).toBe('number');
    });

    it('should return a positive integer', () => {
      const result = extractKeyBitsFromAlg('ES256');
      expect(Number.isInteger(result)).toBe(true);
      expect(result).toBeGreaterThan(0);
    });

    it('should return a number divisible by 8', () => {
      const result = extractKeyBitsFromAlg('ES256');
      expect(result % 8).toBe(0);
    });
  });

  describe('common OAuth 2.0/JWT algorithms', () => {
    it('should handle all common ES algorithms', () => {
      const algorithms = ['ES256', 'ES384', 'ES512'];
      const expectedBits = [256, 384, 512];

      algorithms.forEach((alg, index) => {
        const result = extractKeyBitsFromAlg(alg);
        expect(result).toBe(expectedBits[index]);
      });
    });

    it('should handle all common RS algorithms', () => {
      const algorithms = ['RS256', 'RS384', 'RS512'];
      const expectedBits = [256, 384, 512];

      algorithms.forEach((alg, index) => {
        const result = extractKeyBitsFromAlg(alg);
        expect(result).toBe(expectedBits[index]);
      });
    });

    it('should handle all common PS algorithms', () => {
      const algorithms = ['PS256', 'PS384', 'PS512'];
      const expectedBits = [256, 384, 512];

      algorithms.forEach((alg, index) => {
        const result = extractKeyBitsFromAlg(alg);
        expect(result).toBe(expectedBits[index]);
      });
    });

    it('should handle all common HS algorithms', () => {
      const algorithms = ['HS256', 'HS384', 'HS512'];
      const expectedBits = [256, 384, 512];

      algorithms.forEach((alg, index) => {
        const result = extractKeyBitsFromAlg(alg);
        expect(result).toBe(expectedBits[index]);
      });
    });

    it('should handle all common AES algorithms', () => {
      const algorithms = ['A128GCM', 'A192GCM', 'A256GCM'];
      const expectedBits = [128, 192, 256];

      algorithms.forEach((alg, index) => {
        const result = extractKeyBitsFromAlg(alg);
        expect(result).toBe(expectedBits[index]);
      });
    });

    it('should handle EdDSA algorithms', () => {
      const algorithms = ['EdDSA', 'Ed25519'];
      const expectedBits = [512, 512];

      algorithms.forEach((alg, index) => {
        const result = extractKeyBitsFromAlg(alg);
        expect(result).toBe(expectedBits[index]);
      });
    });
  });
});
