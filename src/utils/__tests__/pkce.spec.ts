import { describe, it, expect } from 'vitest';
import { pkce, generateCodeChallenge, generateCodeVerifier } from '../pkce';
import type { RandomBytes } from '@/types';
import { sha256 } from '@noble/hashes/sha256';

describe('PKCE utilities', () => {
  describe('generateCodeVerifier', () => {
    it('should generate code verifier with correct length and format', () => {
      const mockRandomBytes: RandomBytes = (byteLength = 32) => {
        return new Uint8Array(byteLength).fill(255);
      };

      const result = generateCodeVerifier(mockRandomBytes);

      // Check length requirements (RFC 7636)
      expect(result).toHaveLength(43); // 32 bytes in Base64URL = 43 characters

      // Check that string uses the correct character set
      // Base64URL can contain: A-Z, a-z, 0-9, -, _
      const validCodeVerifierChars = /^[A-Za-z0-9_-]+$/;
      expect(result).toMatch(validCodeVerifierChars);
    });

    it('should use default byte length when not specified', () => {
      const mockRandomBytes: RandomBytes = (byteLength = 32) => {
        return new Uint8Array(byteLength).fill(42);
      };

      const result = generateCodeVerifier(mockRandomBytes);

      expect(result).toHaveLength(43); // 32 bytes in Base64URL = 43 characters
    });

    it('should generate consistent results for same input', () => {
      const mockRandomBytes: RandomBytes = (byteLength = 32) => {
        return new Uint8Array(byteLength).fill(123);
      };

      const result1 = generateCodeVerifier(mockRandomBytes, 32);
      const result2 = generateCodeVerifier(mockRandomBytes, 32);

      expect(result1).toBe(result2);
    });

    it('should handle custom byte lengths', () => {
      const mockRandomBytes: RandomBytes = (byteLength = 32) => {
        return new Uint8Array(byteLength).fill(100);
      };

      const result = generateCodeVerifier(mockRandomBytes, 16);

      expect(result).toHaveLength(22); // 16 bytes in Base64URL = 22 characters
    });

    it('should generate unique code verifiers with different random values', () => {
      let callCount = 0;
      const mockRandomBytes: RandomBytes = (byteLength = 32) => {
        const bytes = new Uint8Array(byteLength);
        bytes.fill(callCount++);
        return bytes;
      };

      const result1 = generateCodeVerifier(mockRandomBytes, 32);
      const result2 = generateCodeVerifier(mockRandomBytes, 32);

      expect(result1).not.toBe(result2);
    });
  });

  describe('generateCodeChallenge', () => {
    it('should generate code challenge with correct length and format', () => {
      const codeVerifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
      const result = generateCodeChallenge(codeVerifier);

      // Check length requirements (RFC 7636)
      expect(result).toHaveLength(43); // SHA256 hash in Base64URL = 43 characters

      // Check that string uses the correct character set
      // Base64URL can contain: A-Z, a-z, 0-9, -, _
      const validCodeChallengeChars = /^[A-Za-z0-9_-]+$/;
      expect(result).toMatch(validCodeChallengeChars);
    });

    it('should calculate correct code_challenge for RFC 7636 example code_verifier', () => {
      // RFC 7636 example values
      const rfcCodeVerifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
      const expectedCodeChallenge =
        'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM';

      const calculatedCodeChallenge = generateCodeChallenge(rfcCodeVerifier);

      expect(calculatedCodeChallenge).toBe(expectedCodeChallenge);
    });

    it('should generate consistent results for same input', () => {
      const codeVerifier = 'testCodeVerifier123';

      const result1 = generateCodeChallenge(codeVerifier);
      const result2 = generateCodeChallenge(codeVerifier);

      expect(result1).toBe(result2);
    });

    it('should generate different challenges for different verifiers', () => {
      const codeVerifier1 = 'testCodeVerifier123';
      const codeVerifier2 = 'differentCodeVerifier456';

      const result1 = generateCodeChallenge(codeVerifier1);
      const result2 = generateCodeChallenge(codeVerifier2);

      expect(result1).not.toBe(result2);
    });

    it('should handle empty string input', () => {
      const result = generateCodeChallenge('');

      expect(result).toHaveLength(43);
      expect(result).toMatch(/^[A-Za-z0-9_-]+$/);
    });
  });

  describe('pkce', () => {
    it('should generate PKCE with correct length and format', () => {
      const mockRandomBytes: RandomBytes = (byteLength = 32) => {
        return new Uint8Array(byteLength).fill(255);
      };

      const result = pkce(mockRandomBytes);

      // Check length requirements (RFC 7636)
      expect(result.codeVerifier).toHaveLength(43); // 32 bytes in Base64URL = 43 characters
      expect(result.codeChallenge).toHaveLength(43);

      // Check that code_challenge is derived from code_verifier
      const encoder = new TextEncoder();
      const codeVerifierBytes = encoder.encode(result.codeVerifier);
      const expectedChallengeBytes = sha256(codeVerifierBytes);
      const expectedChallenge = Buffer.from(expectedChallengeBytes)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      expect(result.codeChallenge).toBe(expectedChallenge);
    });

    it('should generate unique PKCE values with different random values', () => {
      let callCount = 0;
      const mockRandomBytes: RandomBytes = (byteLength = 32) => {
        const bytes = new Uint8Array(byteLength);
        bytes.fill(callCount++);
        return bytes;
      };

      const result1 = pkce(mockRandomBytes, 32);
      const result2 = pkce(mockRandomBytes, 32);

      expect(result1.codeVerifier).not.toBe(result2.codeVerifier);
      expect(result1.codeChallenge).not.toBe(result2.codeChallenge);
    });

    it('should generate valid character set strings', () => {
      const mockRandomBytes: RandomBytes = (byteLength = 32) => {
        const bytes = new Uint8Array(byteLength);
        bytes.fill(0);
        return bytes;
      };

      const result = pkce(mockRandomBytes, 32);

      // Check that strings use the correct character set
      // Base64URL can contain: A-Z, a-z, 0-9, -, _
      const validCodeVerifierChars = /^[A-Za-z0-9_-]+$/;
      const validCodeChallengeChars = /^[A-Za-z0-9_-]+$/;
      expect(result.codeVerifier).toMatch(validCodeVerifierChars);
      expect(result.codeChallenge).toMatch(validCodeChallengeChars);
    });

    it('should use default byte length when not specified', () => {
      const mockRandomBytes: RandomBytes = (byteLength = 32) => {
        return new Uint8Array(byteLength).fill(42);
      };

      const result = pkce(mockRandomBytes);

      expect(result.codeVerifier).toHaveLength(43); // 32 bytes in Base64URL = 43 characters
      expect(result.codeChallenge).toHaveLength(43);
    });

    it('should generate consistent results for same input', () => {
      const mockRandomBytes: RandomBytes = (byteLength = 32) => {
        return new Uint8Array(byteLength).fill(123);
      };

      const result1 = pkce(mockRandomBytes, 32);
      const result2 = pkce(mockRandomBytes, 32);

      expect(result1.codeVerifier).toBe(result2.codeVerifier);
      expect(result1.codeChallenge).toBe(result2.codeChallenge);
    });

    it('should handle custom byte lengths', () => {
      const mockRandomBytes: RandomBytes = (byteLength = 32) => {
        return new Uint8Array(byteLength).fill(100);
      };

      const result = pkce(mockRandomBytes, 16);

      expect(result.codeVerifier).toHaveLength(22); // 16 bytes in Base64URL = 22 characters
      expect(result.codeChallenge).toHaveLength(43);
    });

    it('should match RFC 7636 example values', () => {
      // RFC 7636 example: code_verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"
      // Expected code_challenge = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"

      const mockRandomBytes: RandomBytes = () => {
        return new Uint8Array(32).fill(0);
      };

      const result = pkce(mockRandomBytes, 32);

      expect(result.codeVerifier).toHaveLength(43); // 32 bytes in Base64URL = 43 characters
      expect(result.codeChallenge).toHaveLength(43);

      // Verify that code_challenge is derived from code_verifier
      const encoder = new TextEncoder();
      const codeVerifierBytes = encoder.encode(result.codeVerifier);
      const expectedChallengeBytes = sha256(codeVerifierBytes);
      const expectedChallenge = Buffer.from(expectedChallengeBytes)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      expect(result.codeChallenge).toBe(expectedChallenge);
    });
  });
});
