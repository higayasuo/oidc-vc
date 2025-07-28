import { describe, it, expect } from 'vitest';
import { tokenResponseSchema, type TokenResponse } from '../TokenResponse';

describe('TokenResponse', () => {
  describe('tokenResponseSchema', () => {
    it('should validate a complete token response', () => {
      const validResponse = {
        access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: 'refresh_token_value',
        id_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        scope: 'openid email profile',
      };

      const result = tokenResponseSchema.parse(validResponse);
      expect(result).toEqual(validResponse);
    });

    it('should validate token response with minimal required fields', () => {
      const minimalResponse = {
        access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'Bearer',
      };

      const result = tokenResponseSchema.parse(minimalResponse);
      expect(result).toEqual(minimalResponse);
    });

    it('should validate token response with nullish optional fields', () => {
      const responseWithNulls = {
        access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'Bearer',
        expires_in: null,
        refresh_token: null,
        id_token: null,
        scope: null,
      };

      const result = tokenResponseSchema.parse(responseWithNulls);
      expect(result).toEqual(responseWithNulls);
    });

    it('should validate token response with undefined optional fields', () => {
      const responseWithUndefined = {
        access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'Bearer',
        expires_in: undefined,
        refresh_token: undefined,
        id_token: undefined,
        scope: undefined,
      };

      const result = tokenResponseSchema.parse(responseWithUndefined);
      expect(result).toEqual({
        access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'Bearer',
      });
    });

    it('should validate token response with scope field', () => {
      const responseWithScope = {
        access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'Bearer',
        scope: 'openid email profile address',
      };

      const result = tokenResponseSchema.parse(responseWithScope);
      expect(result).toEqual(responseWithScope);
    });

    it('should validate token response with empty scope', () => {
      const responseWithEmptyScope = {
        access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'Bearer',
        scope: '',
      };

      const result = tokenResponseSchema.parse(responseWithEmptyScope);
      expect(result).toEqual(responseWithEmptyScope);
    });

    it('should validate token response with additional properties', () => {
      const responseWithAdditional = {
        access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'Bearer',
        scope: 'openid email',
        custom_field: 'custom_value',
        another_field: 123,
      };

      const result = tokenResponseSchema.parse(responseWithAdditional);
      expect(result).toEqual(responseWithAdditional);
    });

    it('should throw error when access_token is missing', () => {
      const invalidResponse = {
        token_type: 'Bearer',
        scope: 'openid email',
      };

      expect(() => {
        tokenResponseSchema.parse(invalidResponse);
      }).toThrow();
    });

    it('should throw error when token_type is missing', () => {
      const invalidResponse = {
        access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        scope: 'openid email',
      };

      expect(() => {
        tokenResponseSchema.parse(invalidResponse);
      }).toThrow();
    });

    it('should throw error when access_token is not a string', () => {
      const invalidResponse = {
        access_token: 123,
        token_type: 'Bearer',
      };

      expect(() => {
        tokenResponseSchema.parse(invalidResponse);
      }).toThrow();
    });

    it('should throw error when token_type is not a string', () => {
      const invalidResponse = {
        access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 123,
      };

      expect(() => {
        tokenResponseSchema.parse(invalidResponse);
      }).toThrow();
    });

    it('should throw error when expires_in is not a number', () => {
      const invalidResponse = {
        access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'Bearer',
        expires_in: '3600',
      };

      expect(() => {
        tokenResponseSchema.parse(invalidResponse);
      }).toThrow();
    });

    it('should throw error when refresh_token is not a string', () => {
      const invalidResponse = {
        access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'Bearer',
        refresh_token: 123,
      };

      expect(() => {
        tokenResponseSchema.parse(invalidResponse);
      }).toThrow();
    });

    it('should throw error when id_token is not a string', () => {
      const invalidResponse = {
        access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'Bearer',
        id_token: 123,
      };

      expect(() => {
        tokenResponseSchema.parse(invalidResponse);
      }).toThrow();
    });

    it('should throw error when scope is not a string', () => {
      const invalidResponse = {
        access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'Bearer',
        scope: 123,
      };

      expect(() => {
        tokenResponseSchema.parse(invalidResponse);
      }).toThrow();
    });

    it('should throw error when error is not a string', () => {
      const invalidResponse = {
        access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'Bearer',
        error: 123,
      };

      expect(() => {
        tokenResponseSchema.parse(invalidResponse);
      }).toThrow();
    });

    it('should throw error when error_description is not a string', () => {
      const invalidResponse = {
        access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'Bearer',
        error_description: 123,
      };

      expect(() => {
        tokenResponseSchema.parse(invalidResponse);
      }).toThrow();
    });

    it('should validate error response', () => {
      const errorResponse = {
        error: 'invalid_grant',
        error_description: 'The authorization code has expired',
      };

      expect(() => {
        tokenResponseSchema.parse(errorResponse);
      }).toThrow();
    });

    it('should validate token response with different token types', () => {
      const bearerResponse = {
        access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'Bearer',
        scope: 'openid email',
      };

      const macResponse = {
        access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'MAC',
        scope: 'openid email',
      };

      expect(() => {
        tokenResponseSchema.parse(bearerResponse);
      }).not.toThrow();

      expect(() => {
        tokenResponseSchema.parse(macResponse);
      }).not.toThrow();
    });

    it('should validate token response with various scope formats', () => {
      const singleScope = {
        access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'Bearer',
        scope: 'openid',
      };

      const multipleScopes = {
        access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'Bearer',
        scope: 'openid email profile address phone',
      };

      const customScopes = {
        access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'Bearer',
        scope: 'openid api:read api:write admin:manage',
      };

      expect(() => {
        tokenResponseSchema.parse(singleScope);
      }).not.toThrow();

      expect(() => {
        tokenResponseSchema.parse(multipleScopes);
      }).not.toThrow();

      expect(() => {
        tokenResponseSchema.parse(customScopes);
      }).not.toThrow();
    });

    it('should validate token response with numeric expires_in values', () => {
      const shortExpiry = {
        access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'Bearer',
        expires_in: 300,
      };

      const longExpiry = {
        access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'Bearer',
        expires_in: 86400,
      };

      expect(() => {
        tokenResponseSchema.parse(shortExpiry);
      }).not.toThrow();

      expect(() => {
        tokenResponseSchema.parse(longExpiry);
      }).not.toThrow();
    });
  });

  describe('TokenResponse type', () => {
    it('should have correct type inference', () => {
      const response: TokenResponse = {
        access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: 'refresh_token_value',
        id_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        scope: 'openid email profile',
      };

      expect(response.access_token).toBe(
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...'
      );
      expect(response.token_type).toBe('Bearer');
      expect(response.expires_in).toBe(3600);
      expect(response.refresh_token).toBe('refresh_token_value');
      expect(response.id_token).toBe('eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...');
      expect(response.scope).toBe('openid email profile');
    });

    it('should allow optional fields to be undefined', () => {
      const response: TokenResponse = {
        access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'Bearer',
      };

      expect(response.access_token).toBe(
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...'
      );
      expect(response.token_type).toBe('Bearer');
      expect(response.expires_in).toBeUndefined();
      expect(response.refresh_token).toBeUndefined();
      expect(response.id_token).toBeUndefined();
      expect(response.scope).toBeUndefined();
    });
  });
});
