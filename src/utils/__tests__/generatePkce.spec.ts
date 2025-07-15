import { describe, it, expect } from 'vitest';
import { generatePkce } from '../generatePkce';
import type { RandomBytes } from '@/types';

describe('generatePkce', () => {
  it('should generate PKCE with default byte length (32 bytes)', () => {
    // Mock randomBytes to return predictable values
    const mockRandomBytes: RandomBytes = (byteLength = 32) => {
      return new Uint8Array(byteLength).fill(255);
    };

    const result = generatePkce(mockRandomBytes);

    // 32 bytes of 255 should produce a specific Base64URL string
    expect(result.codeVerifier).toBe('__________________________________________8');
    expect(result.codeChallenge).toHaveLength(43); // SHA256 hash in Base64URL
    expect(result.codeChallenge).toBe('r5YTdg9yY1-9tEpaCmPDnxKvMPlQpu5clxvhiOicQFE');
  });

  it('should generate PKCE with custom byte length', () => {
    const mockRandomBytes: RandomBytes = (byteLength = 32) => {
      return new Uint8Array(byteLength).fill(0);
    };

    const result = generatePkce(mockRandomBytes, 16);

    // 16 bytes of 0 should produce specific Base64URL strings
    expect(result.codeVerifier).toBe('AAAAAAAAAAAAAAAAAAAAAA');
    expect(result.codeChallenge).toHaveLength(43);
    expect(result.codeChallenge).toBe('N0cI__dxndWXnsh11WzSKG9tPPfsMXo7JWMqqyjsN7s');
  });

  it('should generate PKCE with mixed byte values', () => {
    const mockRandomBytes: RandomBytes = (byteLength = 32) => {
      const bytes = new Uint8Array(byteLength);
      for (let i = 0; i < byteLength; i++) {
        bytes[i] = i % 256;
      }
      return bytes;
    };

    const result = generatePkce(mockRandomBytes, 4);

    // 4 bytes: [0, 1, 2, 3] -> specific Base64URL and SHA256 hash
    expect(result.codeVerifier).toBe('AAECAw');
    expect(result.codeChallenge).toHaveLength(43);
    expect(result.codeChallenge).toBe('BU7ewdAhH2JP7Qy8qdT5QAsOSRxDdCryxbCr6_DJkNg');
  });

  it('should handle single byte correctly', () => {
    const mockRandomBytes: RandomBytes = () => {
      return new Uint8Array([170]); // 0xAA
    };

    const result = generatePkce(mockRandomBytes, 1);

    expect(result.codeVerifier).toBe('qg');
    expect(result.codeChallenge).toHaveLength(43);
    expect(result.codeChallenge).toBe('vO72VbWgNJEfHDcYzgVlMbRe8DtMex8VYp6GcpQBGn0');
  });

  it('should handle zero byte length', () => {
    const mockRandomBytes: RandomBytes = () => {
      return new Uint8Array(0);
    };

    const result = generatePkce(mockRandomBytes, 0);

    expect(result.codeVerifier).toBe('');
    expect(result.codeChallenge).toHaveLength(43);
    expect(result.codeChallenge).toBe('47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU');
  });

  it('should generate unique PKCE values with different random values', () => {
    let callCount = 0;
    const mockRandomBytes: RandomBytes = (byteLength = 32) => {
      const bytes = new Uint8Array(byteLength);
      bytes.fill(callCount++);
      return bytes;
    };

    const result1 = generatePkce(mockRandomBytes, 4);
    const result2 = generatePkce(mockRandomBytes, 4);

    expect(result1.codeVerifier).not.toBe(result2.codeVerifier);
    expect(result1.codeChallenge).not.toBe(result2.codeChallenge);
    expect(result1.codeVerifier).toBe('AAAAAA');
    expect(result2.codeVerifier).toBe('AQEBAQ');
  });

  it('should generate valid Base64URL strings (no padding, URL-safe)', () => {
    const mockRandomBytes: RandomBytes = (byteLength = 32) => {
      // Create bytes that would normally have padding in Base64
      const bytes = new Uint8Array(byteLength);
      bytes.fill(0);
      return bytes;
    };

    const result = generatePkce(mockRandomBytes, 32);

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

    const result = generatePkce(mockRandomBytes);

    // Should use default 32 bytes
    expect(result.codeVerifier).toHaveLength(43); // 32 bytes in Base64URL
    expect(result.codeChallenge).toHaveLength(43); // SHA256 hash in Base64URL
  });

  it('should generate consistent results for same input', () => {
    const mockRandomBytes: RandomBytes = (byteLength = 32) => {
      return new Uint8Array(byteLength).fill(123);
    };

    const result1 = generatePkce(mockRandomBytes, 8);
    const result2 = generatePkce(mockRandomBytes, 8);

    expect(result1.codeVerifier).toBe(result2.codeVerifier);
    expect(result1.codeChallenge).toBe(result2.codeChallenge);
  });

  it('should handle large byte lengths', () => {
    const mockRandomBytes: RandomBytes = (byteLength = 32) => {
      return new Uint8Array(byteLength).fill(128);
    };

    const result = generatePkce(mockRandomBytes, 128);

    // 128 bytes should produce longer Base64URL strings
    expect(result.codeVerifier).toHaveLength(171); // 128 bytes in Base64URL
    expect(result.codeChallenge).toHaveLength(43); // SHA256 hash is always 43 chars
  });

  it('should verify SHA256 relationship between code_verifier and code_challenge', () => {
    const mockRandomBytes: RandomBytes = (byteLength = 32) => {
      return new Uint8Array(byteLength).fill(100);
    };

    const result = generatePkce(mockRandomBytes, 16);

    // The code_challenge should be the SHA256 hash of the code_verifier
    // For 16 bytes of 100, we can verify the expected hash
    expect(result.codeVerifier).toBe('ZGRkZGRkZGRkZGRkZGRkZA');
    expect(result.codeChallenge).toBe('kLscwlykooMYkS0OGVSzARDoc9A6WuJ11FxD1Ot0o4g');
  });
});