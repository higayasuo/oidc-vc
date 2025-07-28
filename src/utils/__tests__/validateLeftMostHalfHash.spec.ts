import { describe, it, expect } from 'vitest';
import { validateLeftMostHalfHash } from '../validateLeftMostHalfHash';

describe('validateLeftMostHalfHash', () => {
  const testData =
    'YmJiZTAwYmYtMzgyOC00NzhkLTkyOTItNjJjNDM3MGYzOWIy9sFhvH8K_x8UIHj1osisS57f5DduL';

  describe('valid hashes', () => {
    it('should not throw error for valid SHA-256 hash', () => {
      expect(() => {
        validateLeftMostHalfHash({
          hash: 'xsZZrUssMXjL3FBlzoSh2g',
          data: testData,
          alg: 'ES256',
        });
      }).not.toThrow();
    });

    it('should not throw error for valid SHA-384 hash', () => {
      expect(() => {
        validateLeftMostHalfHash({
          hash: 'adt46pcdiB-l6eTNifgoVM-5AIJAxq84',
          data: testData,
          alg: 'ES384',
        });
      }).not.toThrow();
    });

    it('should not throw error for valid SHA-512 hash', () => {
      expect(() => {
        validateLeftMostHalfHash({
          hash: 'p2LHG4H-8pYDc0hyVOo3iIHvZJUqe9tbj3jESOuXbkY',
          data: testData,
          alg: 'ES512',
        });
      }).not.toThrow();
    });

    it('should not throw error for valid EdDSA hash', () => {
      expect(() => {
        validateLeftMostHalfHash({
          hash: 'p2LHG4H-8pYDc0hyVOo3iIHvZJUqe9tbj3jESOuXbkY',
          data: testData,
          alg: 'EdDSA',
        });
      }).not.toThrow();
    });

    it('should not throw error for valid Ed25519 hash', () => {
      expect(() => {
        validateLeftMostHalfHash({
          hash: 'p2LHG4H-8pYDc0hyVOo3iIHvZJUqe9tbj3jESOuXbkY',
          data: testData,
          alg: 'Ed25519',
        });
      }).not.toThrow();
    });
  });

  describe('invalid hashes', () => {
    it('should throw error for incorrect SHA-256 hash', () => {
      expect(() => {
        validateLeftMostHalfHash({
          hash: 'wrong-hash-value',
          data: testData,
          alg: 'ES256',
        });
      }).toThrow(
        'Hash validation failed for data: "YmJiZTAwYmYtMzgyOC00NzhkLTkyOTItNjJjNDM3MGYzOWIy9sFhvH8K_x8UIHj1osisS57f5DduL" and algorithm: "ES256"'
      );
    });

    it('should throw error for incorrect SHA-384 hash', () => {
      expect(() => {
        validateLeftMostHalfHash({
          hash: 'wrong-hash-value',
          data: testData,
          alg: 'ES384',
        });
      }).toThrow(
        'Hash validation failed for data: "YmJiZTAwYmYtMzgyOC00NzhkLTkyOTItNjJjNDM3MGYzOWIy9sFhvH8K_x8UIHj1osisS57f5DduL" and algorithm: "ES384"'
      );
    });

    it('should throw error for incorrect SHA-512 hash', () => {
      expect(() => {
        validateLeftMostHalfHash({
          hash: 'wrong-hash-value',
          data: testData,
          alg: 'ES512',
        });
      }).toThrow(
        'Hash validation failed for data: "YmJiZTAwYmYtMzgyOC00NzhkLTkyOTItNjJjNDM3MGYzOWIy9sFhvH8K_x8UIHj1osisS57f5DduL" and algorithm: "ES512"'
      );
    });

    it('should throw error for incorrect EdDSA hash', () => {
      expect(() => {
        validateLeftMostHalfHash({
          hash: 'wrong-hash-value',
          data: testData,
          alg: 'EdDSA',
        });
      }).toThrow(
        'Hash validation failed for data: "YmJiZTAwYmYtMzgyOC00NzhkLTkyOTItNjJjNDM3MGYzOWIy9sFhvH8K_x8UIHj1osisS57f5DduL" and algorithm: "EdDSA"'
      );
    });
  });

  describe('different algorithms with same data', () => {
    it('should validate different algorithms correctly', () => {
      const algorithms = [
        { alg: 'ES256', hash: 'xsZZrUssMXjL3FBlzoSh2g' },
        { alg: 'RS256', hash: 'xsZZrUssMXjL3FBlzoSh2g' },
        { alg: 'PS256', hash: 'xsZZrUssMXjL3FBlzoSh2g' },
        { alg: 'HS256', hash: 'xsZZrUssMXjL3FBlzoSh2g' },
        { alg: 'ES384', hash: 'adt46pcdiB-l6eTNifgoVM-5AIJAxq84' },
        { alg: 'RS384', hash: 'adt46pcdiB-l6eTNifgoVM-5AIJAxq84' },
        { alg: 'PS384', hash: 'adt46pcdiB-l6eTNifgoVM-5AIJAxq84' },
        { alg: 'HS384', hash: 'adt46pcdiB-l6eTNifgoVM-5AIJAxq84' },
        { alg: 'ES512', hash: 'p2LHG4H-8pYDc0hyVOo3iIHvZJUqe9tbj3jESOuXbkY' },
        { alg: 'RS512', hash: 'p2LHG4H-8pYDc0hyVOo3iIHvZJUqe9tbj3jESOuXbkY' },
        { alg: 'PS512', hash: 'p2LHG4H-8pYDc0hyVOo3iIHvZJUqe9tbj3jESOuXbkY' },
        { alg: 'HS512', hash: 'p2LHG4H-8pYDc0hyVOo3iIHvZJUqe9tbj3jESOuXbkY' },
        { alg: 'EdDSA', hash: 'p2LHG4H-8pYDc0hyVOo3iIHvZJUqe9tbj3jESOuXbkY' },
        { alg: 'Ed25519', hash: 'p2LHG4H-8pYDc0hyVOo3iIHvZJUqe9tbj3jESOuXbkY' },
      ];

      algorithms.forEach(({ alg, hash }) => {
        expect(() => {
          validateLeftMostHalfHash({
            hash,
            data: testData,
            alg,
          });
        }).not.toThrow();
      });
    });
  });

  describe('error message format', () => {
    it('should include expected and received values in error message', () => {
      try {
        validateLeftMostHalfHash({
          hash: 'wrong-hash',
          data: 'test-data',
          alg: 'ES256',
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        const errorMessage = (error as Error).message;
        expect(errorMessage).toContain(
          'Hash validation failed for data: "test-data" and algorithm: "ES256"'
        );
        expect(errorMessage).toContain('Expected: "');
        expect(errorMessage).toContain('Received: "wrong-hash"');
      }
    });

    it('should include data and algorithm in error message', () => {
      try {
        validateLeftMostHalfHash({
          hash: 'invalid-hash',
          data: 'my-test-data',
          alg: 'RS384',
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        const errorMessage = (error as Error).message;
        expect(errorMessage).toContain('"my-test-data"');
        expect(errorMessage).toContain('"RS384"');
      }
    });
  });

  describe('edge cases', () => {
    it('should handle empty data string', () => {
      expect(() => {
        validateLeftMostHalfHash({
          hash: '47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU',
          data: '',
          alg: 'ES256',
        });
      }).toThrow(); // This will throw because the hash doesn't match the expected hash for empty string
    });

    it('should handle special characters in data', () => {
      expect(() => {
        validateLeftMostHalfHash({
          hash: 'xsZZrUssMXjL3FBlzoSh2g',
          data: 'test@#$%^&*()',
          alg: 'ES256',
        });
      }).toThrow();
    });

    it('should handle unicode characters in data', () => {
      expect(() => {
        validateLeftMostHalfHash({
          hash: 'xsZZrUssMXjL3FBlzoSh2g',
          data: 'テスト',
          alg: 'ES256',
        });
      }).toThrow();
    });

    it('should handle very long data strings', () => {
      const longData = 'a'.repeat(1000);
      expect(() => {
        validateLeftMostHalfHash({
          hash: 'wrong-hash',
          data: longData,
          alg: 'ES256',
        });
      }).toThrow();
    });
  });

  describe('algorithm error propagation', () => {
    it('should propagate errors from invalid algorithms', () => {
      expect(() => {
        validateLeftMostHalfHash({
          hash: 'some-hash',
          data: testData,
          alg: 'INVALID',
        });
      }).toThrow('Invalid algorithm: INVALID');
    });

    it('should propagate errors from unsupported key sizes', () => {
      expect(() => {
        validateLeftMostHalfHash({
          hash: 'some-hash',
          data: testData,
          alg: 'A128GCM',
        });
      }).toThrow('Unsupported key size: 128 bits');
    });

    it('should propagate errors from algorithms without three-digit numbers', () => {
      expect(() => {
        validateLeftMostHalfHash({
          hash: 'some-hash',
          data: testData,
          alg: 'ES',
        });
      }).toThrow('Invalid algorithm: ES');
    });
  });

  describe('function behavior', () => {
    it('should return void when validation passes', () => {
      const result = validateLeftMostHalfHash({
        hash: 'xsZZrUssMXjL3FBlzoSh2g',
        data: testData,
        alg: 'ES256',
      });
      expect(result).toBeUndefined();
    });

    it('should be consistent for same inputs', () => {
      const params = {
        hash: 'xsZZrUssMXjL3FBlzoSh2g',
        data: testData,
        alg: 'ES256' as const,
      };

      expect(() => {
        validateLeftMostHalfHash(params);
      }).not.toThrow();

      expect(() => {
        validateLeftMostHalfHash(params);
      }).not.toThrow();
    });

    it('should handle different hash formats', () => {
      // Test with different hash values that won't match the expected hash for ES256
      const invalidHashes = [
        'wrong-hash-value',
        'different-hash-value',
        'another-hash-value',
      ];

      invalidHashes.forEach((hash) => {
        expect(() => {
          validateLeftMostHalfHash({
            hash,
            data: testData,
            alg: 'ES256',
          });
        }).toThrow(); // These won't match the expected hash for ES256
      });
    });
  });

  describe('type validation', () => {
    it('should throw error when hash is null', () => {
      expect(() => {
        validateLeftMostHalfHash({
          hash: null as unknown,
          data: testData,
          alg: 'ES256',
        });
      }).toThrow('hash is missing');
    });

    it('should throw error when hash is undefined', () => {
      expect(() => {
        validateLeftMostHalfHash({
          hash: undefined as unknown,
          data: testData,
          alg: 'ES256',
        });
      }).toThrow('hash is missing');
    });

    it('should throw error when hash is a number', () => {
      expect(() => {
        validateLeftMostHalfHash({
          hash: 123 as unknown,
          data: testData,
          alg: 'ES256',
        });
      }).toThrow('hash must be a string');
    });

    it('should throw error when hash is a boolean', () => {
      expect(() => {
        validateLeftMostHalfHash({
          hash: true as unknown,
          data: testData,
          alg: 'ES256',
        });
      }).toThrow('hash must be a string');
    });

    it('should throw error when hash is an object', () => {
      expect(() => {
        validateLeftMostHalfHash({
          hash: { key: 'value' } as unknown,
          data: testData,
          alg: 'ES256',
        });
      }).toThrow('hash must be a string');
    });

    it('should throw error when hash is an array', () => {
      expect(() => {
        validateLeftMostHalfHash({
          hash: ['hash', 'value'] as unknown,
          data: testData,
          alg: 'ES256',
        });
      }).toThrow('hash must be a string');
    });

    it('should throw error when hash is empty string', () => {
      expect(() => {
        validateLeftMostHalfHash({
          hash: '',
          data: testData,
          alg: 'ES256',
        });
      }).toThrow('hash is missing');
    });

    it('should accept valid string hash', () => {
      expect(() => {
        validateLeftMostHalfHash({
          hash: 'xsZZrUssMXjL3FBlzoSh2g',
          data: testData,
          alg: 'ES256',
        });
      }).not.toThrow();
    });
  });
});
