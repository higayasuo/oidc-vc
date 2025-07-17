import { describe, it, expect } from 'vitest';
import { pkce } from '../pkce';
import type { RandomBytes } from '@/types';
import { sha256 } from '@noble/hashes/sha256';

// Helper to get Base64URL string for a given byte array
const toBase64Url = (bytes: Uint8Array) =>
  Buffer.from(bytes)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

// Helper to get SHA256 hash in Base64URL format (from bytes, not string!)
const sha256Base64Url = (bytes: Uint8Array) => {
  const hash = sha256(bytes);
  return toBase64Url(Buffer.from(hash));
};

describe('pkce', () => {
  it('should generate PKCE with default byte length (32 bytes)', () => {
    const mockRandomBytes: RandomBytes = (byteLength = 32) => {
      return new Uint8Array(byteLength).fill(255);
    };

    const result = pkce(mockRandomBytes);

    const codeVerifierBytes = new Uint8Array(32).fill(255);
    const expectedCodeVerifier = toBase64Url(codeVerifierBytes);
    const expectedCodeChallenge = sha256Base64Url(codeVerifierBytes);

    expect(result.codeVerifier).toBe(expectedCodeVerifier);
    expect(result.codeChallenge).toHaveLength(43);
    expect(result.codeChallenge).toBe(expectedCodeChallenge);
  });

  it('should generate PKCE with custom byte length', () => {
    const mockRandomBytes: RandomBytes = (byteLength = 32) => {
      return new Uint8Array(byteLength).fill(0);
    };

    const result = pkce(mockRandomBytes, 16);

    const codeVerifierBytes = new Uint8Array(16).fill(0);
    const expectedCodeVerifier = toBase64Url(codeVerifierBytes);
    const expectedCodeChallenge = sha256Base64Url(codeVerifierBytes);

    expect(result.codeVerifier).toBe(expectedCodeVerifier);
    expect(result.codeChallenge).toHaveLength(43);
    expect(result.codeChallenge).toBe(expectedCodeChallenge);
  });

  it('should generate PKCE with mixed byte values', () => {
    const mockRandomBytes: RandomBytes = (byteLength = 32) => {
      const bytes = new Uint8Array(byteLength);
      for (let i = 0; i < byteLength; i++) {
        bytes[i] = i % 256;
      }
      return bytes;
    };

    const result = pkce(mockRandomBytes, 4);

    const codeVerifierBytes = Uint8Array.from([0, 1, 2, 3]);
    const expectedCodeVerifier = toBase64Url(codeVerifierBytes);
    const expectedCodeChallenge = sha256Base64Url(codeVerifierBytes);

    expect(result.codeVerifier).toBe(expectedCodeVerifier);
    expect(result.codeChallenge).toHaveLength(43);
    expect(result.codeChallenge).toBe(expectedCodeChallenge);
  });

  it('should handle single byte correctly', () => {
    const mockRandomBytes: RandomBytes = () => {
      return new Uint8Array([170]); // 0xAA
    };

    const result = pkce(mockRandomBytes, 1);

    const codeVerifierBytes = Uint8Array.from([170]);
    const expectedCodeVerifier = toBase64Url(codeVerifierBytes);
    const expectedCodeChallenge = sha256Base64Url(codeVerifierBytes);

    expect(result.codeVerifier).toBe(expectedCodeVerifier);
    expect(result.codeChallenge).toHaveLength(43);
    expect(result.codeChallenge).toBe(expectedCodeChallenge);
  });

  it('should handle zero byte length', () => {
    const mockRandomBytes: RandomBytes = () => {
      return new Uint8Array(0);
    };

    const result = pkce(mockRandomBytes, 0);

    const codeVerifierBytes = new Uint8Array(0);
    const expectedCodeVerifier = toBase64Url(codeVerifierBytes);
    const expectedCodeChallenge = sha256Base64Url(codeVerifierBytes);

    expect(result.codeVerifier).toBe(expectedCodeVerifier);
    expect(result.codeChallenge).toHaveLength(43);
    expect(result.codeChallenge).toBe(expectedCodeChallenge);
  });

  it('should generate unique PKCE values with different random values', () => {
    let callCount = 0;
    const mockRandomBytes: RandomBytes = (byteLength = 32) => {
      const bytes = new Uint8Array(byteLength);
      bytes.fill(callCount++);
      return bytes;
    };

    const result1 = pkce(mockRandomBytes, 4);
    const result2 = pkce(mockRandomBytes, 4);

    const codeVerifierBytes1 = Uint8Array.from([0, 0, 0, 0]);
    const codeVerifierBytes2 = Uint8Array.from([1, 1, 1, 1]);
    const expectedCodeVerifier1 = toBase64Url(codeVerifierBytes1);
    const expectedCodeVerifier2 = toBase64Url(codeVerifierBytes2);
    expect(result1.codeVerifier).not.toBe(result2.codeVerifier);
    expect(result1.codeChallenge).not.toBe(result2.codeChallenge);
    expect(result1.codeVerifier).toBe(expectedCodeVerifier1);
    expect(result2.codeVerifier).toBe(expectedCodeVerifier2);
  });

  it('should generate valid Base64URL strings (no padding, URL-safe)', () => {
    const mockRandomBytes: RandomBytes = (byteLength = 32) => {
      const bytes = new Uint8Array(byteLength);
      bytes.fill(0);
      return bytes;
    };

    const result = pkce(mockRandomBytes, 32);

    // Check that Base64URL strings don't contain padding (=) or unsafe characters (+, /)
    expect(result.codeVerifier).not.toContain('=');
    expect(result.codeVerifier).not.toContain('+');
    expect(result.codeVerifier).not.toContain('/');
    expect(result.codeChallenge).not.toContain('=');
    expect(result.codeChallenge).not.toContain('+');
    expect(result.codeChallenge).not.toContain('/');
  });

  it('should use default byte length when not specified', () => {
    const mockRandomBytes: RandomBytes = (byteLength = 32) => {
      return new Uint8Array(byteLength).fill(42);
    };

    const result = pkce(mockRandomBytes);

    const codeVerifierBytes = new Uint8Array(32).fill(42);
    const expectedCodeVerifier = toBase64Url(codeVerifierBytes);
    const expectedCodeChallenge = sha256Base64Url(codeVerifierBytes);

    expect(result.codeVerifier).toBe(expectedCodeVerifier);
    expect(result.codeChallenge).toHaveLength(43);
    expect(result.codeChallenge).toBe(expectedCodeChallenge);
  });

  it('should generate consistent results for same input', () => {
    const mockRandomBytes: RandomBytes = (byteLength = 32) => {
      return new Uint8Array(byteLength).fill(123);
    };

    const result1 = pkce(mockRandomBytes, 8);
    const result2 = pkce(mockRandomBytes, 8);

    expect(result1.codeVerifier).toBe(result2.codeVerifier);
    expect(result1.codeChallenge).toBe(result2.codeChallenge);
  });

  it('should handle large byte lengths', () => {
    const mockRandomBytes: RandomBytes = (byteLength = 32) => {
      return new Uint8Array(byteLength).fill(128);
    };

    const result = pkce(mockRandomBytes, 128);

    const codeVerifierBytes = new Uint8Array(128).fill(128);
    const expectedCodeVerifier = toBase64Url(codeVerifierBytes);
    const expectedCodeChallenge = sha256Base64Url(codeVerifierBytes);

    // 128 bytes should produce longer Base64URL strings
    expect(result.codeVerifier).toBe(expectedCodeVerifier);
    expect(result.codeVerifier).toHaveLength(171); // 128 bytes in Base64URL
    expect(result.codeChallenge).toBe(expectedCodeChallenge);
    expect(result.codeChallenge).toHaveLength(43); // SHA256 hash is always 43 chars
  });

  it('should verify SHA256 relationship between code_verifier and code_challenge', () => {
    const mockRandomBytes: RandomBytes = (byteLength = 32) => {
      return new Uint8Array(byteLength).fill(100);
    };

    const result = pkce(mockRandomBytes, 16);

    const codeVerifierBytes = new Uint8Array(16).fill(100);
    const expectedCodeVerifier = toBase64Url(codeVerifierBytes);
    const expectedCodeChallenge = sha256Base64Url(codeVerifierBytes);

    expect(result.codeVerifier).toBe(expectedCodeVerifier);
    expect(result.codeChallenge).toBe(expectedCodeChallenge);
  });
});
