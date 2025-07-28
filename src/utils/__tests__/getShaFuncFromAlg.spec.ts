import { describe, it, expect } from 'vitest';
import { getShaFuncFromAlg } from '../getShaFuncFromAlg';
import { sha256 } from '@noble/hashes/sha256';
import { sha384, sha512 } from '@noble/hashes/sha512';

describe('getShaFuncFromAlg', () => {
  describe('valid algorithms', () => {
    it('should return sha256 function for ES256 algorithm', () => {
      const shaFunc = getShaFuncFromAlg('ES256');
      expect(shaFunc).toBe(sha256);
    });

    it('should return sha256 function for RS256 algorithm', () => {
      const shaFunc = getShaFuncFromAlg('RS256');
      expect(shaFunc).toBe(sha256);
    });

    it('should return sha256 function for PS256 algorithm', () => {
      const shaFunc = getShaFuncFromAlg('PS256');
      expect(shaFunc).toBe(sha256);
    });

    it('should return sha256 function for HS256 algorithm', () => {
      const shaFunc = getShaFuncFromAlg('HS256');
      expect(shaFunc).toBe(sha256);
    });

    it('should return sha384 function for ES384 algorithm', () => {
      const shaFunc = getShaFuncFromAlg('ES384');
      expect(shaFunc).toBe(sha384);
    });

    it('should return sha384 function for RS384 algorithm', () => {
      const shaFunc = getShaFuncFromAlg('RS384');
      expect(shaFunc).toBe(sha384);
    });

    it('should return sha384 function for PS384 algorithm', () => {
      const shaFunc = getShaFuncFromAlg('PS384');
      expect(shaFunc).toBe(sha384);
    });

    it('should return sha384 function for HS384 algorithm', () => {
      const shaFunc = getShaFuncFromAlg('HS384');
      expect(shaFunc).toBe(sha384);
    });

    it('should return sha512 function for ES512 algorithm', () => {
      const shaFunc = getShaFuncFromAlg('ES512');
      expect(shaFunc).toBe(sha512);
    });

    it('should return sha512 function for RS512 algorithm', () => {
      const shaFunc = getShaFuncFromAlg('RS512');
      expect(shaFunc).toBe(sha512);
    });

    it('should return sha512 function for PS512 algorithm', () => {
      const shaFunc = getShaFuncFromAlg('PS512');
      expect(shaFunc).toBe(sha512);
    });

    it('should return sha512 function for HS512 algorithm', () => {
      const shaFunc = getShaFuncFromAlg('HS512');
      expect(shaFunc).toBe(sha512);
    });

    it('should return sha512 function for EdDSA algorithm', () => {
      const shaFunc = getShaFuncFromAlg('EdDSA');
      expect(shaFunc).toBe(sha512);
    });

    it('should return sha512 function for Ed25519 algorithm', () => {
      const shaFunc = getShaFuncFromAlg('Ed25519');
      expect(shaFunc).toBe(sha512);
    });
  });

  describe('function behavior', () => {
    it('should return a function that can hash data', () => {
      const shaFunc = getShaFuncFromAlg('ES256');
      const data = new TextEncoder().encode('test data');
      const hash = shaFunc(data);

      expect(hash).toBeInstanceOf(Uint8Array);
      expect(hash.length).toBe(32); // SHA-256 produces 32 bytes
    });

    it('should return sha256 function that produces correct hash length', () => {
      const shaFunc = getShaFuncFromAlg('ES256');
      const data = new TextEncoder().encode('hello world');
      const hash = shaFunc(data);

      expect(hash.length).toBe(32); // 256 bits = 32 bytes
    });

    it('should return sha384 function that produces correct hash length', () => {
      const shaFunc = getShaFuncFromAlg('ES384');
      const data = new TextEncoder().encode('hello world');
      const hash = shaFunc(data);

      expect(hash.length).toBe(48); // 384 bits = 48 bytes
    });

    it('should return sha512 function that produces correct hash length', () => {
      const shaFunc = getShaFuncFromAlg('ES512');
      const data = new TextEncoder().encode('hello world');
      const hash = shaFunc(data);

      expect(hash.length).toBe(64); // 512 bits = 64 bytes
    });

    it('should return consistent hash for same input', () => {
      const shaFunc = getShaFuncFromAlg('ES256');
      const data = new TextEncoder().encode('test');
      const hash1 = shaFunc(data);
      const hash2 = shaFunc(data);

      expect(hash1).toEqual(hash2);
    });

    it('should return different hashes for different inputs', () => {
      const shaFunc = getShaFuncFromAlg('ES256');
      const data1 = new TextEncoder().encode('test1');
      const data2 = new TextEncoder().encode('test2');
      const hash1 = shaFunc(data1);
      const hash2 = shaFunc(data2);

      expect(hash1).not.toEqual(hash2);
    });
  });

  describe('algorithms with different prefixes', () => {
    it('should return sha256 for any algorithm with 256 bits', () => {
      const algorithms = ['ES256', 'RS256', 'PS256', 'HS256', 'A256GCM'];

      algorithms.forEach((alg) => {
        const shaFunc = getShaFuncFromAlg(alg);
        expect(shaFunc).toBe(sha256);
      });
    });

    it('should return sha384 for any algorithm with 384 bits', () => {
      const algorithms = ['ES384', 'RS384', 'PS384', 'HS384'];

      algorithms.forEach((alg) => {
        const shaFunc = getShaFuncFromAlg(alg);
        expect(shaFunc).toBe(sha384);
      });
    });

    it('should return sha512 for any algorithm with 512 bits', () => {
      const algorithms = ['ES512', 'RS512', 'PS512', 'HS512'];

      algorithms.forEach((alg) => {
        const shaFunc = getShaFuncFromAlg(alg);
        expect(shaFunc).toBe(sha512);
      });
    });
  });

  describe('invalid algorithms', () => {
    it('should throw error for algorithm without three-digit number', () => {
      expect(() => {
        getShaFuncFromAlg('ES');
      }).toThrow('Invalid algorithm: ES');
    });

    it('should throw error for algorithm with two-digit number', () => {
      expect(() => {
        getShaFuncFromAlg('ES25');
      }).toThrow('Invalid algorithm: ES25');
    });

    it('should throw error for empty string', () => {
      expect(() => {
        getShaFuncFromAlg('');
      }).toThrow('Invalid algorithm: ');
    });

    it('should throw error for algorithm with only letters', () => {
      expect(() => {
        getShaFuncFromAlg('ESABCD');
      }).toThrow('Invalid algorithm: ESABCD');
    });
  });

  describe('unsupported key sizes', () => {
    it('should throw error for algorithm with 128 bits', () => {
      expect(() => {
        getShaFuncFromAlg('A128GCM');
      }).toThrow('Unsupported key size: 128 bits');
    });

    it('should throw error for algorithm with 192 bits', () => {
      expect(() => {
        getShaFuncFromAlg('A192GCM');
      }).toThrow('Unsupported key size: 192 bits');
    });

    it('should throw error for algorithm with 0 bits', () => {
      expect(() => {
        getShaFuncFromAlg('ES000');
      }).toThrow('Unsupported key size: 0 bits');
    });

    it('should throw error for algorithm with 1000 bits', () => {
      expect(() => {
        getShaFuncFromAlg('ES1000');
      }).toThrow('Unsupported key size: 0 bits');
    });
  });

  describe('error message format', () => {
    it('should throw error with specific message format for unsupported key size', () => {
      try {
        getShaFuncFromAlg('A128GCM');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Unsupported key size: 128 bits');
      }
    });

    it('should throw error with specific message format for invalid algorithm', () => {
      try {
        getShaFuncFromAlg('INVALID');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Invalid algorithm: INVALID');
      }
    });
  });

  describe('return type validation', () => {
    it('should return a function', () => {
      const shaFunc = getShaFuncFromAlg('ES256');
      expect(typeof shaFunc).toBe('function');
    });

    it('should return a function that accepts Uint8Array and returns Uint8Array', () => {
      const shaFunc = getShaFuncFromAlg('ES256');
      const data = new TextEncoder().encode('test');
      const result = shaFunc(data);

      expect(result).toBeInstanceOf(Uint8Array);
    });

    it('should return different functions for different algorithms', () => {
      const sha256Func = getShaFuncFromAlg('ES256');
      const sha384Func = getShaFuncFromAlg('ES384');
      const sha512Func = getShaFuncFromAlg('ES512');

      expect(sha256Func).toBe(sha256);
      expect(sha384Func).toBe(sha384);
      expect(sha512Func).toBe(sha512);
    });
  });

  describe('common OAuth 2.0/JWT algorithms', () => {
    it('should handle all common ES algorithms', () => {
      const algorithms = ['ES256', 'ES384', 'ES512'];
      const expectedFuncs = [sha256, sha384, sha512];

      algorithms.forEach((alg, index) => {
        const shaFunc = getShaFuncFromAlg(alg);
        expect(shaFunc).toBe(expectedFuncs[index]);
      });
    });

    it('should handle all common RS algorithms', () => {
      const algorithms = ['RS256', 'RS384', 'RS512'];
      const expectedFuncs = [sha256, sha384, sha512];

      algorithms.forEach((alg, index) => {
        const shaFunc = getShaFuncFromAlg(alg);
        expect(shaFunc).toBe(expectedFuncs[index]);
      });
    });

    it('should handle all common PS algorithms', () => {
      const algorithms = ['PS256', 'PS384', 'PS512'];
      const expectedFuncs = [sha256, sha384, sha512];

      algorithms.forEach((alg, index) => {
        const shaFunc = getShaFuncFromAlg(alg);
        expect(shaFunc).toBe(expectedFuncs[index]);
      });
    });

    it('should handle all common HS algorithms', () => {
      const algorithms = ['HS256', 'HS384', 'HS512'];
      const expectedFuncs = [sha256, sha384, sha512];

      algorithms.forEach((alg, index) => {
        const shaFunc = getShaFuncFromAlg(alg);
        expect(shaFunc).toBe(expectedFuncs[index]);
      });
    });

    it('should handle EdDSA algorithms', () => {
      const algorithms = ['EdDSA', 'Ed25519'];
      const expectedFuncs = [sha512, sha512];

      algorithms.forEach((alg, index) => {
        const shaFunc = getShaFuncFromAlg(alg);
        expect(shaFunc).toBe(expectedFuncs[index]);
      });
    });
  });
});
