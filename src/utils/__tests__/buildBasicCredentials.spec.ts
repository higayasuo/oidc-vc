import { describe, it, expect } from 'vitest';
import { buildBasicCredentials } from '../buildBasicCredentials';

describe('buildBasicCredentials', () => {
  it('should encode userId:password in Base64 format', () => {
    const userId = 'testuser';
    const password = 'testpass';

    const result = buildBasicCredentials(userId, password);

    // Expected: "Basic " + base64("testuser:testpass")
    // "testuser:testpass" in base64 is "dGVzdHVzZXI6dGVzdHBhc3M="
    expect(result).toBe('Basic dGVzdHVzZXI6dGVzdHBhc3M=');
  });

  it('should handle empty strings', () => {
    const result = buildBasicCredentials('', '');

    // Expected: "Basic " + base64(":")
    // ":" in base64 is "Og=="
    expect(result).toBe('Basic Og==');
  });

  it('should handle empty password (explicit empty string)', () => {
    const userId = 'testuser';
    const password = '';

    const result = buildBasicCredentials(userId, password);

    // Expected: "Basic " + base64("testuser:")
    // "testuser:" in base64 is "dGVzdHVzZXI6"
    expect(result).toBe('Basic dGVzdHVzZXI6');
  });

  it('should handle omitted password (default parameter)', () => {
    const userId = 'testuser';

    const result = buildBasicCredentials(userId);

    // Expected: "Basic " + base64("testuser:")
    // "testuser:" in base64 is "dGVzdHVzZXI6"
    expect(result).toBe('Basic dGVzdHVzZXI6');
  });

  it('should handle special characters in credentials', () => {
    const userId = 'user@domain.com';
    const password = 'pass:word';

    const result = buildBasicCredentials(userId, password);

    // Expected: "Basic " + base64("user@domain.com:pass:word")
    // "user@domain.com:pass:word" in base64 is "dXNlckBkb21haW4uY29tOnBhc3M6d29yZA=="
    expect(result).toBe('Basic dXNlckBkb21haW4uY29tOnBhc3M6d29yZA==');
  });

  it('should handle unicode characters', () => {
    const userId = 'ユーザー';
    const password = 'パスワード';

    const result = buildBasicCredentials(userId, password);

    // The function should handle unicode characters correctly
    expect(result).toMatch(/^Basic [A-Za-z0-9+/=]+$/);
    expect(result.startsWith('Basic ')).toBe(true);
  });
});
