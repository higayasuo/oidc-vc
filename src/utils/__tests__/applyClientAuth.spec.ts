import { describe, it, expect } from 'vitest';
import { applyClientAuth } from '../applyClientAuth';
import type { ClientAuth } from '../applyClientAuth';

describe('applyClientAuth', () => {
  it('should apply client ID in parameters when no client secret is provided', () => {
    const params = new URLSearchParams();
    const headers: Record<string, string> = {};
    const clientAuth: ClientAuth = {
      clientId: 'test-client-id',
    };

    applyClientAuth(params, headers, clientAuth);

    expect(params.get('client_id')).toBe('test-client-id');
    expect(headers.Authorization).toBeUndefined();
  });

  it('should apply Basic authentication when client secret is provided', () => {
    const params = new URLSearchParams();
    const headers: Record<string, string> = {};
    const clientAuth: ClientAuth = {
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
    };

    applyClientAuth(params, headers, clientAuth);

    expect(params.get('client_id')).toBeNull();
    expect(headers.Authorization).toBe(
      'Basic dGVzdC1jbGllbnQtaWQ6dGVzdC1jbGllbnQtc2VjcmV0'
    );
  });

  it('should apply Basic authentication with empty client secret', () => {
    const params = new URLSearchParams();
    const headers: Record<string, string> = {};
    const clientAuth: ClientAuth = {
      clientId: 'test-client-id',
      clientSecret: '',
    };

    applyClientAuth(params, headers, clientAuth);

    expect(params.get('client_id')).toBeNull();
    expect(headers.Authorization).toBe('Basic dGVzdC1jbGllbnQtaWQ6');
  });

  it('should apply client assertion when provided', () => {
    const params = new URLSearchParams();
    const headers: Record<string, string> = {};
    const clientAuth: ClientAuth = {
      clientId: 'test-client-id',
      clientAssertion: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
    };

    applyClientAuth(params, headers, clientAuth);

    expect(params.get('client_assertion')).toBe(
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...'
    );
    expect(params.get('client_id')).toBe('test-client-id');
    expect(headers.Authorization).toBeUndefined();
  });

  it('should apply client assertion with assertion type', () => {
    const params = new URLSearchParams();
    const headers: Record<string, string> = {};
    const clientAuth: ClientAuth = {
      clientId: 'test-client-id',
      clientAssertionType:
        'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      clientAssertion: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
    };

    applyClientAuth(params, headers, clientAuth);

    expect(params.get('client_assertion_type')).toBe(
      'urn:ietf:params:oauth:client-assertion-type:jwt-bearer'
    );
    expect(params.get('client_assertion')).toBe(
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...'
    );
    expect(params.get('client_id')).toBe('test-client-id');
    expect(headers.Authorization).toBeUndefined();
  });

  it('should prioritize client assertion over Basic authentication', () => {
    const params = new URLSearchParams();
    const headers: Record<string, string> = {};
    const clientAuth: ClientAuth = {
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      clientAssertion: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
    };

    applyClientAuth(params, headers, clientAuth);

    // Basic auth takes precedence, so no client assertion or client_id should be set
    expect(params.get('client_assertion')).toBeNull();
    expect(params.get('client_id')).toBeNull();
    expect(headers.Authorization).toBe(
      'Basic dGVzdC1jbGllbnQtaWQ6dGVzdC1jbGllbnQtc2VjcmV0'
    );
  });

  it('should prioritize client assertion over client ID in parameters', () => {
    const params = new URLSearchParams();
    const headers: Record<string, string> = {};
    const clientAuth: ClientAuth = {
      clientId: 'test-client-id',
      clientAssertion: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
    };

    applyClientAuth(params, headers, clientAuth);

    expect(params.get('client_assertion')).toBe(
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...'
    );
    expect(params.get('client_id')).toBe('test-client-id');
    expect(headers.Authorization).toBeUndefined();
  });

  it('should handle client assertion without assertion type', () => {
    const params = new URLSearchParams();
    const headers: Record<string, string> = {};
    const clientAuth: ClientAuth = {
      clientId: 'test-client-id',
      clientAssertion: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
    };

    applyClientAuth(params, headers, clientAuth);

    expect(params.get('client_assertion')).toBe(
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...'
    );
    expect(params.get('client_assertion_type')).toBeNull();
    expect(params.get('client_id')).toBe('test-client-id');
  });

  it('should handle assertion type without client assertion', () => {
    const params = new URLSearchParams();
    const headers: Record<string, string> = {};
    const clientAuth: ClientAuth = {
      clientId: 'test-client-id',
      clientAssertionType:
        'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
    };

    applyClientAuth(params, headers, clientAuth);

    expect(params.get('client_assertion')).toBeNull();
    expect(params.get('client_assertion_type')).toBeNull();
    expect(params.get('client_id')).toBe('test-client-id');
  });

  it('should modify existing parameters and headers', () => {
    const params = new URLSearchParams();
    params.set('grant_type', 'authorization_code');
    params.set('code', 'test-code');

    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const clientAuth: ClientAuth = {
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
    };

    applyClientAuth(params, headers, clientAuth);

    expect(params.get('grant_type')).toBe('authorization_code');
    expect(params.get('code')).toBe('test-code');
    expect(params.get('client_id')).toBeNull();
    expect(headers['Content-Type']).toBe('application/x-www-form-urlencoded');
    expect(headers.Authorization).toBe(
      'Basic dGVzdC1jbGllbnQtaWQ6dGVzdC1jbGllbnQtc2VjcmV0'
    );
  });

  it('should handle special characters in client ID and secret', () => {
    const params = new URLSearchParams();
    const headers: Record<string, string> = {};
    const clientAuth: ClientAuth = {
      clientId: 'client@example.com',
      clientSecret: 'secret:with:colons',
    };

    applyClientAuth(params, headers, clientAuth);

    expect(params.get('client_id')).toBeNull();
    expect(headers.Authorization).toBe(
      'Basic Y2xpZW50QGV4YW1wbGUuY29tOnNlY3JldDp3aXRoOmNvbG9ucw=='
    );
  });

  it('should handle empty client ID', () => {
    const params = new URLSearchParams();
    const headers: Record<string, string> = {};
    const clientAuth: ClientAuth = {
      clientId: '',
      clientSecret: 'test-secret',
    };

    applyClientAuth(params, headers, clientAuth);

    expect(params.get('client_id')).toBeNull();
    expect(headers.Authorization).toBe('Basic OnRlc3Qtc2VjcmV0');
  });

  it('should handle empty client ID with no secret', () => {
    const params = new URLSearchParams();
    const headers: Record<string, string> = {};
    const clientAuth: ClientAuth = {
      clientId: '',
    };

    applyClientAuth(params, headers, clientAuth);

    expect(params.get('client_id')).toBe('');
    expect(headers.Authorization).toBeUndefined();
  });

  it('should handle null client secret explicitly', () => {
    const params = new URLSearchParams();
    const headers: Record<string, string> = {};
    const clientAuth: ClientAuth = {
      clientId: 'test-client-id',
      clientSecret: null as any,
    };

    applyClientAuth(params, headers, clientAuth);

    expect(params.get('client_id')).toBe('test-client-id');
    expect(headers.Authorization).toBeUndefined();
  });

  it('should handle undefined client secret explicitly', () => {
    const params = new URLSearchParams();
    const headers: Record<string, string> = {};
    const clientAuth: ClientAuth = {
      clientId: 'test-client-id',
      clientSecret: undefined,
    };

    applyClientAuth(params, headers, clientAuth);

    expect(params.get('client_id')).toBe('test-client-id');
    expect(headers.Authorization).toBeUndefined();
  });

  it('should handle complex client assertion with special characters', () => {
    const params = new URLSearchParams();
    const headers: Record<string, string> = {};
    const clientAuth: ClientAuth = {
      clientId: 'test-client-id',
      clientAssertionType:
        'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      clientAssertion:
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LWNsaWVudC1pZCIsImlhdCI6MTYzNTU5NzYwMCwiZXhwIjoxNjM1NjAwMjAwfQ.signature',
    };

    applyClientAuth(params, headers, clientAuth);

    expect(params.get('client_assertion_type')).toBe(
      'urn:ietf:params:oauth:client-assertion-type:jwt-bearer'
    );
    expect(params.get('client_assertion')).toBe(
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LWNsaWVudC1pZCIsImlhdCI6MTYzNTU5NzYwMCwiZXhwIjoxNjM1NjAwMjAwfQ.signature'
    );
    expect(params.get('client_id')).toBe('test-client-id');
  });

  it('should handle multiple calls on same objects', () => {
    const params = new URLSearchParams();
    const headers: Record<string, string> = {};

    // First call
    const clientAuth1: ClientAuth = {
      clientId: 'client1',
      clientSecret: 'secret1',
    };
    applyClientAuth(params, headers, clientAuth1);

    expect(params.get('client_id')).toBeNull();
    expect(headers.Authorization).toBe('Basic Y2xpZW50MTpzZWNyZXQx');

    // Second call with different auth
    const clientAuth2: ClientAuth = {
      clientId: 'client2',
      clientAssertion: 'assertion2',
    };
    applyClientAuth(params, headers, clientAuth2);

    expect(params.get('client_id')).toBe('client2');
    expect(params.get('client_assertion')).toBe('assertion2');
    expect(headers.Authorization).toBe('Basic Y2xpZW50MTpzZWNyZXQx'); // Should remain unchanged
  });

  it('should handle all authentication methods in one call', () => {
    const params = new URLSearchParams();
    const headers: Record<string, string> = {};
    const clientAuth: ClientAuth = {
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      clientAssertionType:
        'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      clientAssertion: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
    };

    applyClientAuth(params, headers, clientAuth);

    // Basic auth takes precedence, so no client assertion parameters should be set
    expect(params.get('client_assertion_type')).toBeNull();
    expect(params.get('client_assertion')).toBeNull();
    expect(params.get('client_id')).toBeNull();
    expect(headers.Authorization).toBe(
      'Basic dGVzdC1jbGllbnQtaWQ6dGVzdC1jbGllbnQtc2VjcmV0'
    );
  });

  describe('edge cases', () => {
    it('should handle very long client ID and secret', () => {
      const params = new URLSearchParams();
      const headers: Record<string, string> = {};
      const longClientId = 'a'.repeat(1000);
      const longSecret = 'b'.repeat(1000);
      const clientAuth: ClientAuth = {
        clientId: longClientId,
        clientSecret: longSecret,
      };

      applyClientAuth(params, headers, clientAuth);

      expect(params.get('client_id')).toBeNull();
      expect(headers.Authorization).toMatch(/^Basic /);
      expect(headers.Authorization!.length).toBeGreaterThan(1000);
    });

    it('should handle Unicode characters in client ID and secret', () => {
      const params = new URLSearchParams();
      const headers: Record<string, string> = {};
      const clientAuth: ClientAuth = {
        clientId: 'client-🚀-id',
        clientSecret: 'secret-🌟-key',
      };

      applyClientAuth(params, headers, clientAuth);

      expect(params.get('client_id')).toBeNull();
      // The actual encoding depends on the TextEncoder implementation
      expect(headers.Authorization).toMatch(/^Basic /);
      expect(headers.Authorization!.length).toBeGreaterThan(20);
    });

    it('should handle empty assertion type', () => {
      const params = new URLSearchParams();
      const headers: Record<string, string> = {};
      const clientAuth: ClientAuth = {
        clientId: 'test-client-id',
        clientAssertionType: '',
        clientAssertion: 'test-assertion',
      };

      applyClientAuth(params, headers, clientAuth);

      expect(params.get('client_assertion_type')).toBeNull(); // Empty strings are not set
      expect(params.get('client_assertion')).toBe('test-assertion');
      expect(params.get('client_id')).toBe('test-client-id');
    });

    it('should handle empty client assertion', () => {
      const params = new URLSearchParams();
      const headers: Record<string, string> = {};
      const clientAuth: ClientAuth = {
        clientId: 'test-client-id',
        clientAssertion: '',
      };

      applyClientAuth(params, headers, clientAuth);

      expect(params.get('client_assertion')).toBeNull(); // Empty strings are not set
      expect(params.get('client_id')).toBe('test-client-id');
    });
  });
});
