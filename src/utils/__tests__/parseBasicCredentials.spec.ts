import { describe, it, expect } from 'vitest';
import { parseBasicCredentials } from '../parseBasicCredentials';

describe('parseBasicCredentials', () => {
  it('should parse valid Basic credentials', () => {
    const authHeader = 'Basic dGVzdHVzZXI6dGVzdHBhc3M=';

    const result = parseBasicCredentials(authHeader);

    expect(result).toEqual({
      userId: 'testuser',
      password: 'testpass',
    });
  });

  it('should handle empty password', () => {
    const authHeader = 'Basic dGVzdHVzZXI6';

    const result = parseBasicCredentials(authHeader);

    expect(result).toEqual({
      userId: 'testuser',
      password: '',
    });
  });

  it('should handle empty userId and password', () => {
    const authHeader = 'Basic Og==';

    const result = parseBasicCredentials(authHeader);

    expect(result).toEqual({
      userId: '',
      password: '',
    });
  });

  it('should handle special characters in credentials', () => {
    const authHeader = 'Basic dXNlckBkb21haW4uY29tOnBhc3M6d29yZA==';

    const result = parseBasicCredentials(authHeader);

    expect(result).toEqual({
      userId: 'user@domain.com',
      password: 'pass:word',
    });
  });

  it('should return undefined values for invalid Basic format', () => {
    const authHeader = 'Bearer token123';

    const result = parseBasicCredentials(authHeader);

    expect(result).toEqual({
      userId: undefined,
      password: undefined,
    });
  });

  it('should return undefined values for missing colon in credentials', () => {
    const authHeader = 'Basic dGVzdHVzZXI=';

    const result = parseBasicCredentials(authHeader);

    expect(result).toEqual({
      userId: undefined,
      password: undefined,
    });
  });

  it('should return undefined values for invalid Base64', () => {
    const authHeader = 'Basic invalid-base64!';

    const result = parseBasicCredentials(authHeader);

    expect(result).toEqual({
      userId: undefined,
      password: undefined,
    });
  });

  it('should return undefined values for empty string', () => {
    const result = parseBasicCredentials('');

    expect(result).toEqual({
      userId: undefined,
      password: undefined,
    });
  });

  it('should work with destructuring assignment', () => {
    const authHeader = 'Basic dGVzdHVzZXI6dGVzdHBhc3M=';

    const { userId, password } = parseBasicCredentials(authHeader);

    expect(userId).toBe('testuser');
    expect(password).toBe('testpass');
  });

  it('should work with destructuring assignment for invalid input', () => {
    const authHeader = 'Bearer token123';

    const { userId, password } = parseBasicCredentials(authHeader);

    expect(userId).toBeUndefined();
    expect(password).toBeUndefined();
  });
});
