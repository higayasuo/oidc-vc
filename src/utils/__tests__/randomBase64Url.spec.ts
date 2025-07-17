import { describe, it, expect } from 'vitest';
import { randomBase64Url } from '../randomBase64Url';
import type { RandomBytes } from '@/types';

// Helper to get Base64URL string for a given byte array
const toBase64Url = (bytes: Uint8Array) =>
  Buffer.from(bytes)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

describe('randomBase64Url', () => {
  it('should generate Base64URL string with default byte length (32 bytes)', () => {
    const mockRandomBytes: RandomBytes = (byteLength = 32) =>
      new Uint8Array(byteLength).fill(255);
    const result = randomBase64Url(mockRandomBytes);
    const expected = toBase64Url(new Uint8Array(32).fill(255));
    expect(result).toHaveLength(expected.length);
    expect(result).toBe(expected);
  });

  it('should generate Base64URL string with custom byte length', () => {
    const mockRandomBytes: RandomBytes = (byteLength = 32) =>
      new Uint8Array(byteLength).fill(0);
    const result = randomBase64Url(mockRandomBytes, 16);
    const expected = toBase64Url(new Uint8Array(16).fill(0));
    expect(result).toHaveLength(expected.length);
    expect(result).toBe(expected);
  });

  it('should generate Base64URL string with mixed byte values', () => {
    const mockRandomBytes: RandomBytes = (byteLength = 32) => {
      const bytes = new Uint8Array(byteLength);
      for (let i = 0; i < byteLength; i++) {
        bytes[i] = i % 256;
      }
      return bytes;
    };
    const result = randomBase64Url(mockRandomBytes, 4);
    const expected = toBase64Url(Uint8Array.from([0, 1, 2, 3]));
    expect(result).toHaveLength(expected.length);
    expect(result).toBe(expected);
  });

  it('should handle single byte correctly', () => {
    const mockRandomBytes: RandomBytes = () => new Uint8Array([170]); // 0xAA
    const result = randomBase64Url(mockRandomBytes, 1);
    const expected = toBase64Url(Uint8Array.from([170]));
    expect(result).toHaveLength(expected.length);
    expect(result).toBe(expected);
  });

  it('should handle zero byte length', () => {
    const mockRandomBytes: RandomBytes = () => new Uint8Array(0);
    const result = randomBase64Url(mockRandomBytes, 0);
    expect(result).toHaveLength(0);
    expect(result).toBe('');
  });

  it('should generate unique Base64URL strings with different random values', () => {
    let callCount = 0;
    const mockRandomBytes: RandomBytes = (byteLength = 32) => {
      const bytes = new Uint8Array(byteLength);
      bytes.fill(callCount++);
      return bytes;
    };
    const result1 = randomBase64Url(mockRandomBytes, 4);
    const result2 = randomBase64Url(mockRandomBytes, 4);
    const expected1 = toBase64Url(Uint8Array.from([0, 0, 0, 0]));
    const expected2 = toBase64Url(Uint8Array.from([1, 1, 1, 1]));
    expect(result1).not.toBe(result2);
    expect(result1).toBe(expected1);
    expect(result2).toBe(expected2);
  });

  it('should handle large byte lengths', () => {
    const mockRandomBytes: RandomBytes = (byteLength = 32) =>
      new Uint8Array(byteLength).fill(128);
    const result = randomBase64Url(mockRandomBytes, 128);
    const expected = toBase64Url(new Uint8Array(128).fill(128));
    expect(result).toHaveLength(expected.length);
    expect(result).toBe(expected);
  });

  it('should use default byte length when not specified', () => {
    const mockRandomBytes: RandomBytes = (byteLength = 32) =>
      new Uint8Array(byteLength).fill(42);
    const result = randomBase64Url(mockRandomBytes);
    const expected = toBase64Url(new Uint8Array(32).fill(42));
    expect(result).toHaveLength(expected.length);
    expect(result).toBe(expected);
  });

  it('should generate URL-safe Base64URL strings', () => {
    const mockRandomBytes: RandomBytes = () => new Uint8Array([63, 191]); // 0x3F, 0xBF
    const result = randomBase64Url(mockRandomBytes, 2);
    expect(result).not.toContain('+');
    expect(result).not.toContain('/');
    expect(result).not.toContain('='); // No padding
  });
});
