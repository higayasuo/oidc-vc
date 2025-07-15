import { describe, it, expect } from 'vitest';
import { generateState } from '../generateState';
import type { RandomBytes } from '@/types';

describe('generateState', () => {
  it('should generate state with default byte length (32 bytes)', () => {
    // Mock randomBytes to return predictable values
    const mockRandomBytes: RandomBytes = (byteLength = 32) => {
      return new Uint8Array(byteLength).fill(255);
    };

    const state = generateState(mockRandomBytes);

    // 32 bytes = 64 hex characters
    expect(state).toHaveLength(64);
    expect(state).toBe('ff'.repeat(32));
  });

  it('should generate state with custom byte length', () => {
    const mockRandomBytes: RandomBytes = (byteLength = 32) => {
      return new Uint8Array(byteLength).fill(0);
    };

    const state = generateState(mockRandomBytes, 16);

    // 16 bytes = 32 hex characters
    expect(state).toHaveLength(32);
    expect(state).toBe('00'.repeat(16));
  });

  it('should generate state with mixed byte values', () => {
    const mockRandomBytes: RandomBytes = (byteLength = 32) => {
      const bytes = new Uint8Array(byteLength);
      for (let i = 0; i < byteLength; i++) {
        bytes[i] = i % 256;
      }
      return bytes;
    };

    const state = generateState(mockRandomBytes, 4);

    // 4 bytes: [0, 1, 2, 3] -> "00010203"
    expect(state).toHaveLength(8);
    expect(state).toBe('00010203');
  });

  it('should handle single byte correctly', () => {
    const mockRandomBytes: RandomBytes = () => {
      return new Uint8Array([170]); // 0xAA
    };

    const state = generateState(mockRandomBytes, 1);

    expect(state).toHaveLength(2);
    expect(state).toBe('aa');
  });

  it('should handle zero byte length', () => {
    const mockRandomBytes: RandomBytes = () => {
      return new Uint8Array(0);
    };

    const state = generateState(mockRandomBytes, 0);

    expect(state).toHaveLength(0);
    expect(state).toBe('');
  });

  it('should generate unique states with different random values', () => {
    let callCount = 0;
    const mockRandomBytes: RandomBytes = (byteLength = 32) => {
      const bytes = new Uint8Array(byteLength);
      bytes.fill(callCount++);
      return bytes;
    };

    const state1 = generateState(mockRandomBytes, 4);
    const state2 = generateState(mockRandomBytes, 4);

    expect(state1).not.toBe(state2);
    expect(state1).toBe('00000000');
    expect(state2).toBe('01010101');
  });

  it('should handle large byte lengths', () => {
    const mockRandomBytes: RandomBytes = (byteLength = 32) => {
      return new Uint8Array(byteLength).fill(128);
    };

    const state = generateState(mockRandomBytes, 128);

    // 128 bytes = 256 hex characters
    expect(state).toHaveLength(256);
    expect(state).toBe('80'.repeat(128));
  });

  it('should use default byte length when not specified', () => {
    const mockRandomBytes: RandomBytes = (byteLength = 32) => {
      return new Uint8Array(byteLength).fill(42);
    };

    const state = generateState(mockRandomBytes);

    // Should use default 32 bytes
    expect(state).toHaveLength(64);
    expect(state).toBe('2a'.repeat(32));
  });
});