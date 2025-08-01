import { describe, it, expect } from 'vitest';
import { parResponseSchema } from '../ParResponse';

describe('ParResponse', () => {
  describe('valid responses', () => {
    it('should validate a complete successful response', () => {
      const validResponse = {
        request_uri: 'urn:ietf:params:oauth:request_uri:tAoERFdTd5CSra2HLyfmMw',
        expires_in: 3600,
      };

      const result = parResponseSchema.parse(validResponse);
      expect(result).toEqual(validResponse);
    });

    it('should validate a minimal successful response with only request_uri', () => {
      const minimalResponse = {
        request_uri: 'urn:ietf:params:oauth:request_uri:tAoERFdTd5CSra2HLyfmMw',
      };

      const result = parResponseSchema.parse(minimalResponse);
      expect(result).toEqual(minimalResponse);
    });

    it('should validate a response with only expires_in', () => {
      const responseWithExpires = {
        expires_in: 1800,
      };

      const result = parResponseSchema.parse(responseWithExpires);
      expect(result).toEqual(responseWithExpires);
    });

    it('should validate an empty response', () => {
      const emptyResponse = {};

      const result = parResponseSchema.parse(emptyResponse);
      expect(result).toEqual(emptyResponse);
    });

    it('should validate a response with all optional fields', () => {
      const completeResponse = {
        request_uri: 'urn:ietf:params:oauth:request_uri:tAoERFdTd5CSra2HLyfmMw',
        expires_in: 3600,
        error: 'invalid_request',
        error_description: 'The request is missing a required parameter',
      };

      const result = parResponseSchema.parse(completeResponse);
      expect(result).toEqual(completeResponse);
    });
  });

  describe('error responses', () => {
    it('should validate an error response with error only', () => {
      const errorResponse = {
        error: 'invalid_request',
      };

      const result = parResponseSchema.parse(errorResponse);
      expect(result).toEqual(errorResponse);
    });

    it('should validate an error response with error and description', () => {
      const errorResponse = {
        error: 'invalid_client',
        error_description: 'Client authentication failed',
      };

      const result = parResponseSchema.parse(errorResponse);
      expect(result).toEqual(errorResponse);
    });

    it('should validate an error response with description only', () => {
      const errorResponse = {
        error_description: 'An error occurred',
      };

      const result = parResponseSchema.parse(errorResponse);
      expect(result).toEqual(errorResponse);
    });
  });

  describe('request_uri validation', () => {
    it('should accept valid URN request URIs', () => {
      const validURNs = [
        'urn:ietf:params:oauth:request_uri:tAoERFdTd5CSra2HLyfmMw',
        'urn:ietf:params:oauth:request_uri:abc123',
        'urn:ietf:params:oauth:request_uri:xyz789',
      ];

      validURNs.forEach((uri) => {
        const response = { request_uri: uri };
        const result = parResponseSchema.parse(response);
        expect(result.request_uri).toBe(uri);
      });
    });

    it('should accept HTTP/HTTPS request URIs', () => {
      const validURLs = [
        'https://example.com/request/abc123',
        'http://localhost:3000/request/xyz789',
        'https://api.example.com/par/request/def456',
      ];

      validURLs.forEach((uri) => {
        const response = { request_uri: uri };
        const result = parResponseSchema.parse(response);
        expect(result.request_uri).toBe(uri);
      });
    });

    it('should accept empty string request_uri', () => {
      const response = { request_uri: '' };
      const result = parResponseSchema.parse(response);
      expect(result.request_uri).toBe('');
    });
  });

  describe('expires_in validation', () => {
    it('should accept positive integers', () => {
      const validExpires = [1, 60, 3600, 86400, 604800];

      validExpires.forEach((expires) => {
        const response = { expires_in: expires };
        const result = parResponseSchema.parse(response);
        expect(result.expires_in).toBe(expires);
      });
    });

    it('should accept zero', () => {
      const response = { expires_in: 0 };
      const result = parResponseSchema.parse(response);
      expect(result.expires_in).toBe(0);
    });

    it('should accept negative numbers', () => {
      const response = { expires_in: -1 };
      const result = parResponseSchema.parse(response);
      expect(result.expires_in).toBe(-1);
    });
  });

  describe('error validation', () => {
    it('should accept standard OAuth error codes', () => {
      const standardErrors = [
        'invalid_request',
        'invalid_client',
        'invalid_grant',
        'unauthorized_client',
        'unsupported_grant_type',
        'invalid_scope',
        'access_denied',
        'server_error',
        'temporarily_unavailable',
      ];

      standardErrors.forEach((error) => {
        const response = { error };
        const result = parResponseSchema.parse(response);
        expect(result.error).toBe(error);
      });
    });

    it('should accept custom error codes', () => {
      const customErrors = [
        'custom_error',
        'par_error',
        'request_too_large',
        'too_many_requests',
      ];

      customErrors.forEach((error) => {
        const response = { error };
        const result = parResponseSchema.parse(response);
        expect(result.error).toBe(error);
      });
    });

    it('should accept empty string error', () => {
      const response = { error: '' };
      const result = parResponseSchema.parse(response);
      expect(result.error).toBe('');
    });
  });

  describe('error_description validation', () => {
    it('should accept descriptive error messages', () => {
      const descriptions = [
        'The request is missing a required parameter',
        'Client authentication failed',
        'The authorization grant is invalid',
        'The client is not authorized to use this grant type',
        'The requested scope is invalid',
        'The resource owner denied the request',
        'The authorization server encountered an error',
        'The authorization server is temporarily unavailable',
      ];

      descriptions.forEach((description) => {
        const response = { error_description: description };
        const result = parResponseSchema.parse(response);
        expect(result.error_description).toBe(description);
      });
    });

    it('should accept empty string error_description', () => {
      const response = { error_description: '' };
      const result = parResponseSchema.parse(response);
      expect(result.error_description).toBe('');
    });
  });

  describe('type validation', () => {
    it('should reject invalid request_uri type', () => {
      const invalidResponses = [
        { request_uri: 123 },
        { request_uri: true },
        { request_uri: {} },
        { request_uri: [] },
      ];

      invalidResponses.forEach((response) => {
        expect(() => parResponseSchema.parse(response)).toThrow();
      });
    });

    it('should reject invalid expires_in type', () => {
      const invalidResponses = [
        { expires_in: '3600' },
        { expires_in: true },
        { expires_in: {} },
        { expires_in: [] },
      ];

      invalidResponses.forEach((response) => {
        expect(() => parResponseSchema.parse(response)).toThrow();
      });
    });

    it('should reject invalid error type', () => {
      const invalidResponses = [
        { error: 123 },
        { error: true },
        { error: {} },
        { error: [] },
      ];

      invalidResponses.forEach((response) => {
        expect(() => parResponseSchema.parse(response)).toThrow();
      });
    });

    it('should reject invalid error_description type', () => {
      const invalidResponses = [
        { error_description: 123 },
        { error_description: true },
        { error_description: {} },
        { error_description: [] },
      ];

      invalidResponses.forEach((response) => {
        expect(() => parResponseSchema.parse(response)).toThrow();
      });
    });

    it('should accept undefined for optional fields', () => {
      const validResponses = [
        { request_uri: undefined },
        { expires_in: undefined },
        { error: undefined },
        { error_description: undefined },
      ];

      validResponses.forEach((response) => {
        expect(() => parResponseSchema.parse(response)).not.toThrow();
      });
    });

    it('should reject null for optional fields', () => {
      const invalidResponses = [
        { request_uri: null },
        { expires_in: null },
        { error: null },
        { error_description: null },
      ];

      invalidResponses.forEach((response) => {
        expect(() => parResponseSchema.parse(response)).toThrow();
      });
    });
  });

  describe('additional properties', () => {
    it('should allow additional properties', () => {
      const responseWithExtra = {
        request_uri: 'urn:ietf:params:oauth:request_uri:tAoERFdTd5CSra2HLyfmMw',
        expires_in: 3600,
        extra_field: 'extra_value',
        another_field: 123,
      };

      const result = parResponseSchema.parse(responseWithExtra);
      expect(result).toEqual(responseWithExtra);
    });

    it('should allow nested objects as additional properties', () => {
      const responseWithNested = {
        request_uri: 'urn:ietf:params:oauth:request_uri:tAoERFdTd5CSra2HLyfmMw',
        metadata: {
          created_at: '2023-01-01T00:00:00Z',
          version: '1.0',
        },
      };

      const result = parResponseSchema.parse(responseWithNested);
      expect(result).toEqual(responseWithNested);
    });
  });

  describe('edge cases', () => {
    it('should handle very long request URIs', () => {
      const longUri = 'urn:ietf:params:oauth:request_uri:' + 'a'.repeat(1000);
      const response = { request_uri: longUri };
      const result = parResponseSchema.parse(response);
      expect(result.request_uri).toBe(longUri);
    });

    it('should handle very long error descriptions', () => {
      const longDescription = 'A'.repeat(1000);
      const response = { error_description: longDescription };
      const result = parResponseSchema.parse(response);
      expect(result.error_description).toBe(longDescription);
    });

    it('should handle very large expires_in values', () => {
      const largeExpires = Number.MAX_SAFE_INTEGER;
      const response = { expires_in: largeExpires };
      const result = parResponseSchema.parse(response);
      expect(result.expires_in).toBe(largeExpires);
    });

    it('should handle very small expires_in values', () => {
      const smallExpires = Number.MIN_SAFE_INTEGER;
      const response = { expires_in: smallExpires };
      const result = parResponseSchema.parse(response);
      expect(result.expires_in).toBe(smallExpires);
    });
  });
});
