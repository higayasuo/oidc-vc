import { describe, it, expect } from 'vitest';
import { prepareAuthorizationParams } from '../prepareAuthorizationParams';
import type { RandomBytes } from '@/types';

describe('prepareAuthorizationParams', () => {
  const mockRandomBytes: RandomBytes = (byteLength = 32) => {
    return new Uint8Array(byteLength).fill(255);
  };

  const baseParams = {
    redirectUri: 'https://myapp.com/callback',
  };

  it('should generate basic authorization parameters with default values', () => {
    const result = prepareAuthorizationParams(baseParams, mockRandomBytes);

    expect(result.params.get('response_type')).toBe('code');
    expect(result.params.get('redirect_uri')).toBe(
      'https://myapp.com/callback'
    );
    expect(result.params.get('scope')).toBe('openid');
    expect(result.params.get('state')).toBeDefined();
    expect(result.params.get('code_challenge')).toBeDefined();
    expect(result.params.get('code_challenge_method')).toBe('S256');
    expect(result.params.get('nonce')).toBeDefined();
    expect(result.codeVerifier).toBeDefined();
    expect(result.state).toBeDefined();
    expect(result.scope).toBe('openid');
    expect(result.nonce).toBeDefined();

    // Verify state is properly set and matches the URL parameter
    expect(result.state).toBe(result.params.get('state'));
    expect(result.state).toMatch(/^[A-Za-z0-9_-]+$/); // Base64URL format

    // Verify nonce is properly set and matches the URL parameter
    expect(result.nonce).toBe(result.params.get('nonce'));
    expect(result.nonce).toMatch(/^[A-Za-z0-9_-]+$/); // Base64URL format
  });

  it('should use custom response type', () => {
    const params = { ...baseParams, responseType: 'token' };
    const result = prepareAuthorizationParams(params, mockRandomBytes);

    expect(result.params.get('response_type')).toBe('token');
    expect(result.nonce).toBeDefined(); // openid scope is default
    expect(result.nonce).toBe(result.params.get('nonce'));
  });

  it('should use custom scope', () => {
    const params = { ...baseParams, scope: 'openid email profile' };
    const result = prepareAuthorizationParams(params, mockRandomBytes);

    expect(result.params.get('scope')).toBe('openid email profile');
    expect(result.scope).toBe('openid email profile');
    expect(result.nonce).toBeDefined();
    expect(result.nonce).toBe(result.params.get('nonce'));
  });

  it('should generate nonce when scope includes openid among other scopes', () => {
    const params = { ...baseParams, scope: 'openid email profile' };
    const result = prepareAuthorizationParams(params, mockRandomBytes);

    expect(result.params.get('scope')).toBe('openid email profile');
    expect(result.params.get('nonce')).toBeDefined();
    expect(result.nonce).toBeDefined();
    expect(result.nonce).toBe(result.params.get('nonce'));
    expect(result.nonce).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(result.scope).toBe('openid email profile');
  });

  it('should generate nonce when openid is not the first scope', () => {
    const params = { ...baseParams, scope: 'email openid profile' };
    const result = prepareAuthorizationParams(params, mockRandomBytes);

    expect(result.params.get('scope')).toBe('email openid profile');
    expect(result.params.get('nonce')).toBeDefined();
    expect(result.nonce).toBeDefined();
    expect(result.nonce).toBe(result.params.get('nonce'));
    expect(result.scope).toBe('email openid profile');
  });

  it('should not generate nonce when scope does not contain openid', () => {
    const params = { ...baseParams, scope: 'email profile address' };
    const result = prepareAuthorizationParams(params, mockRandomBytes);

    expect(result.params.get('scope')).toBe('email profile address');
    expect(result.params.get('nonce')).toBeNull();
    expect(result.nonce).toBeUndefined();
    expect(result.scope).toBe('email profile address');
  });

  it('should generate different nonce values for different calls', () => {
    let callCount = 0;
    const differentRandomBytes: RandomBytes = (byteLength = 32) => {
      const bytes = new Uint8Array(byteLength);
      bytes.fill(callCount++);
      return bytes;
    };

    const result1 = prepareAuthorizationParams(
      baseParams,
      differentRandomBytes
    );
    const result2 = prepareAuthorizationParams(
      baseParams,
      differentRandomBytes
    );

    expect(result1.nonce).toBeDefined();
    expect(result2.nonce).toBeDefined();
    expect(result1.nonce).not.toBe(result2.nonce);
    expect(result1.params.get('nonce')).not.toBe(result2.params.get('nonce'));
  });

  it('should generate consistent nonce with same random function', () => {
    const result1 = prepareAuthorizationParams(baseParams, mockRandomBytes);
    const result2 = prepareAuthorizationParams(baseParams, mockRandomBytes);

    expect(result1.nonce).toBe(result2.nonce);
    expect(result1.params.get('nonce')).toBe(result2.params.get('nonce'));
  });

  it('should properly encode nonce in URL parameters', () => {
    const params = { ...baseParams, scope: 'openid email profile' };
    const result = prepareAuthorizationParams(params, mockRandomBytes);

    const nonceParam = result.params.get('nonce');
    expect(nonceParam).toBeDefined();
    expect(nonceParam).toBe(result.nonce);

    // Verify the nonce is properly URL-encoded
    const paramsString = result.params.toString();
    expect(paramsString).toContain(
      `nonce=${encodeURIComponent(result.nonce!)}`
    );
  });

  it('should generate different state values for different calls', () => {
    let callCount = 0;
    const differentRandomBytes: RandomBytes = (byteLength = 32) => {
      const bytes = new Uint8Array(byteLength);
      bytes.fill(callCount++);
      return bytes;
    };

    const result1 = prepareAuthorizationParams(
      baseParams,
      differentRandomBytes
    );
    const result2 = prepareAuthorizationParams(
      baseParams,
      differentRandomBytes
    );

    expect(result1.state).toBeDefined();
    expect(result2.state).toBeDefined();
    expect(result1.state).not.toBe(result2.state);
    expect(result1.params.get('state')).not.toBe(result2.params.get('state'));
  });

  it('should generate consistent state with same random function', () => {
    const result1 = prepareAuthorizationParams(baseParams, mockRandomBytes);
    const result2 = prepareAuthorizationParams(baseParams, mockRandomBytes);

    expect(result1.state).toBe(result2.state);
    expect(result1.params.get('state')).toBe(result2.params.get('state'));
  });

  it('should properly encode state in URL parameters', () => {
    const result = prepareAuthorizationParams(baseParams, mockRandomBytes);

    const stateParam = result.params.get('state');
    expect(stateParam).toBeDefined();
    expect(stateParam).toBe(result.state);

    // Verify the state is properly URL-encoded
    const paramsString = result.params.toString();
    expect(paramsString).toContain(`state=${encodeURIComponent(result.state)}`);
  });

  it('should generate state even when nonce is not generated', () => {
    const params = { ...baseParams, scope: 'email profile' };
    const result = prepareAuthorizationParams(params, mockRandomBytes);

    expect(result.state).toBeDefined();
    expect(result.params.get('state')).toBeDefined();
    expect(result.state).toBe(result.params.get('state'));
    expect(result.nonce).toBeUndefined();
  });

  it('should generate consistent URLs with same input', () => {
    const result1 = prepareAuthorizationParams(baseParams, mockRandomBytes);
    const result2 = prepareAuthorizationParams(baseParams, mockRandomBytes);

    expect(result1.params.toString()).toBe(result2.params.toString());
    expect(result1.codeVerifier).toBe(result2.codeVerifier);
    expect(result1.nonce).toBe(result2.nonce);
    expect(result1.state).toBe(result2.state);
    expect(result1.scope).toBe(result2.scope);
  });

  it('should generate different URLs with different random values', () => {
    let callCount = 0;
    const differentRandomBytes: RandomBytes = (byteLength = 32) => {
      const bytes = new Uint8Array(byteLength);
      bytes.fill(callCount++);
      return bytes;
    };

    const result1 = prepareAuthorizationParams(
      baseParams,
      differentRandomBytes
    );
    const result2 = prepareAuthorizationParams(
      baseParams,
      differentRandomBytes
    );

    expect(result1.params.toString()).not.toBe(result2.params.toString());
    expect(result1.codeVerifier).not.toBe(result2.codeVerifier);
    expect(result1.nonce).not.toBe(result2.nonce);
    expect(result1.state).not.toBe(result2.state);
    // Scopes should be the same since they're based on the same input
    expect(result1.scope).toBe(result2.scope);
  });

  it('should properly encode URL parameters', () => {
    const params = {
      ...baseParams,
      redirectUri: 'https://myapp.com/callback?param=value&another=test',
      scope: 'openid email profile custom:scope',
    };
    const result = prepareAuthorizationParams(params, mockRandomBytes);

    expect(result.params.get('redirect_uri')).toBe(
      'https://myapp.com/callback?param=value&another=test'
    );
    expect(result.params.get('scope')).toBe(
      'openid email profile custom:scope'
    );
    expect(result.nonce).toBeDefined();
    expect(result.nonce).toBe(result.params.get('nonce'));
    expect(result.scope).toBe('openid email profile custom:scope');
  });

  describe('scope validation', () => {
    it('should handle single scope correctly', () => {
      const params = { ...baseParams, scope: 'openid' };
      const result = prepareAuthorizationParams(params, mockRandomBytes);

      expect(result.scope).toBe('openid');
    });

    it('should handle multiple scopes correctly', () => {
      const params = { ...baseParams, scope: 'openid email profile address' };
      const result = prepareAuthorizationParams(params, mockRandomBytes);

      expect(result.scope).toBe('openid email profile address');
    });

    it('should handle scopes with special characters', () => {
      const params = { ...baseParams, scope: 'openid custom:scope api:read' };
      const result = prepareAuthorizationParams(params, mockRandomBytes);

      expect(result.scope).toBe('openid custom:scope api:read');
    });

    it('should handle empty scope string', () => {
      const params = { ...baseParams, scope: '' };
      const result = prepareAuthorizationParams(params, mockRandomBytes);

      expect(result.scope).toBe('');
    });

    it('should handle scope with only whitespace', () => {
      const params = { ...baseParams, scope: '   ' };
      const result = prepareAuthorizationParams(params, mockRandomBytes);

      expect(result.scope).toBe('   ');
    });

    it('should handle scope with multiple spaces between scopes', () => {
      const params = { ...baseParams, scope: 'openid  email   profile' };
      const result = prepareAuthorizationParams(params, mockRandomBytes);

      expect(result.scope).toBe('openid  email   profile');
    });

    it('should handle scope with leading and trailing spaces', () => {
      const params = { ...baseParams, scope: '  openid email profile  ' };
      const result = prepareAuthorizationParams(params, mockRandomBytes);

      expect(result.scope).toBe('  openid email profile  ');
    });

    it('should handle scope with tabs and newlines', () => {
      const params = { ...baseParams, scope: 'openid\temail\nprofile' };
      const result = prepareAuthorizationParams(params, mockRandomBytes);

      expect(result.scope).toBe('openid\temail\nprofile');
    });
  });

  describe('nonce validation', () => {
    it('should generate nonce with correct length', () => {
      const result = prepareAuthorizationParams(baseParams, mockRandomBytes);

      expect(result.nonce).toBeDefined();
      // Base64URL encoding of 32 bytes should be 43 characters
      expect(result.nonce!.length).toBe(43);
    });

    it('should generate nonce with correct format', () => {
      const result = prepareAuthorizationParams(baseParams, mockRandomBytes);

      expect(result.nonce).toMatch(/^[A-Za-z0-9_-]+$/);
      // Should not contain any URL-unsafe characters
      expect(result.nonce).not.toContain('+');
      expect(result.nonce).not.toContain('/');
      expect(result.nonce).not.toContain('=');
    });

    it('should handle nonce generation with different byte lengths', () => {
      const customRandomBytes: RandomBytes = (byteLength = 32) => {
        return new Uint8Array(byteLength).fill(128);
      };

      const result = prepareAuthorizationParams(baseParams, customRandomBytes);

      expect(result.nonce).toBeDefined();
      expect(result.nonce).toMatch(/^[A-Za-z0-9_-]+$/);
    });
  });

  describe('state validation', () => {
    it('should generate state with correct length', () => {
      const result = prepareAuthorizationParams(baseParams, mockRandomBytes);

      expect(result.state).toBeDefined();
      // Base64URL encoding of 32 bytes should be 43 characters
      expect(result.state.length).toBe(43);
    });

    it('should generate state with correct format', () => {
      const result = prepareAuthorizationParams(baseParams, mockRandomBytes);

      expect(result.state).toMatch(/^[A-Za-z0-9_-]+$/);
      // Should not contain any URL-unsafe characters
      expect(result.state).not.toContain('+');
      expect(result.state).not.toContain('/');
      expect(result.state).not.toContain('=');
    });

    it('should generate different state values for different calls', () => {
      let callCount = 0;
      const differentRandomBytes: RandomBytes = (byteLength = 32) => {
        const bytes = new Uint8Array(byteLength);
        bytes.fill(callCount++);
        return bytes;
      };

      const result1 = prepareAuthorizationParams(
        baseParams,
        differentRandomBytes
      );
      const result2 = prepareAuthorizationParams(
        baseParams,
        differentRandomBytes
      );

      expect(result1.state).toBeDefined();
      expect(result2.state).toBeDefined();
      expect(result1.state).not.toBe(result2.state);
      expect(result1.params.get('state')).not.toBe(result2.params.get('state'));
    });

    it('should generate consistent state with same random function', () => {
      const result1 = prepareAuthorizationParams(baseParams, mockRandomBytes);
      const result2 = prepareAuthorizationParams(baseParams, mockRandomBytes);

      expect(result1.state).toBe(result2.state);
      expect(result1.params.get('state')).toBe(result2.params.get('state'));
    });

    it('should properly encode state in URL parameters', () => {
      const result = prepareAuthorizationParams(baseParams, mockRandomBytes);

      const stateParam = result.params.get('state');
      expect(stateParam).toBeDefined();
      expect(stateParam).toBe(result.state);

      // Verify the state is properly URL-encoded
      const paramsString = result.params.toString();
      expect(paramsString).toContain(
        `state=${encodeURIComponent(result.state)}`
      );
    });

    it('should generate state even when nonce is not generated', () => {
      const params = { ...baseParams, scope: 'email profile' };
      const result = prepareAuthorizationParams(params, mockRandomBytes);

      expect(result.state).toBeDefined();
      expect(result.params.get('state')).toBeDefined();
      expect(result.state).toBe(result.params.get('state'));
      expect(result.nonce).toBeUndefined();
    });
  });

  describe('PKCE validation', () => {
    it('should generate code verifier with correct length', () => {
      const result = prepareAuthorizationParams(baseParams, mockRandomBytes);

      expect(result.codeVerifier).toBeDefined();
      // Base64URL encoding of 32 bytes should be 43 characters
      expect(result.codeVerifier.length).toBe(43);
    });

    it('should generate code verifier with correct format', () => {
      const result = prepareAuthorizationParams(baseParams, mockRandomBytes);

      expect(result.codeVerifier).toMatch(/^[A-Za-z0-9_-]+$/);
      // Should not contain any URL-unsafe characters
      expect(result.codeVerifier).not.toContain('+');
      expect(result.codeVerifier).not.toContain('/');
      expect(result.codeVerifier).not.toContain('=');
    });

    it('should generate code challenge with correct format', () => {
      const result = prepareAuthorizationParams(baseParams, mockRandomBytes);

      const codeChallenge = result.params.get('code_challenge');
      expect(codeChallenge).toBeDefined();
      expect(codeChallenge).toMatch(/^[A-Za-z0-9_-]+$/);
      // Should not contain any URL-unsafe characters
      expect(codeChallenge).not.toContain('+');
      expect(codeChallenge).not.toContain('/');
      expect(codeChallenge).not.toContain('=');
    });

    it('should set code challenge method to S256', () => {
      const result = prepareAuthorizationParams(baseParams, mockRandomBytes);

      expect(result.params.get('code_challenge_method')).toBe('S256');
    });

    it('should generate different code verifiers for different calls', () => {
      let callCount = 0;
      const differentRandomBytes: RandomBytes = (byteLength = 32) => {
        const bytes = new Uint8Array(byteLength);
        bytes.fill(callCount++);
        return bytes;
      };

      const result1 = prepareAuthorizationParams(
        baseParams,
        differentRandomBytes
      );
      const result2 = prepareAuthorizationParams(
        baseParams,
        differentRandomBytes
      );

      expect(result1.codeVerifier).toBeDefined();
      expect(result2.codeVerifier).toBeDefined();
      expect(result1.codeVerifier).not.toBe(result2.codeVerifier);
      expect(result1.params.get('code_challenge')).not.toBe(
        result2.params.get('code_challenge')
      );
    });

    it('should generate consistent code verifier with same random function', () => {
      const result1 = prepareAuthorizationParams(baseParams, mockRandomBytes);
      const result2 = prepareAuthorizationParams(baseParams, mockRandomBytes);

      expect(result1.codeVerifier).toBe(result2.codeVerifier);
      expect(result1.params.get('code_challenge')).toBe(
        result2.params.get('code_challenge')
      );
    });
  });

  describe('edge cases', () => {
    it('should handle very long redirect URI', () => {
      const longRedirectUri =
        'https://myapp.com/callback?' + 'param='.repeat(1000);
      const params = { ...baseParams, redirectUri: longRedirectUri };
      const result = prepareAuthorizationParams(params, mockRandomBytes);

      expect(result.params.get('redirect_uri')).toBe(longRedirectUri);
    });

    it('should handle redirect URI with special characters', () => {
      const redirectUri =
        'https://myapp.com/callback?param=value with spaces&another=test@example.com';
      const params = { ...baseParams, redirectUri };
      const result = prepareAuthorizationParams(params, mockRandomBytes);

      expect(result.params.get('redirect_uri')).toBe(redirectUri);
    });

    it('should handle Unicode characters in scope', () => {
      const params = { ...baseParams, scope: 'openid 🚀 custom:scope 🌟' };
      const result = prepareAuthorizationParams(params, mockRandomBytes);

      expect(result.scope).toBe('openid 🚀 custom:scope 🌟');
      expect(result.params.get('scope')).toBe('openid 🚀 custom:scope 🌟');
    });

    it('should handle empty redirect URI', () => {
      const params = { ...baseParams, redirectUri: '' };
      const result = prepareAuthorizationParams(params, mockRandomBytes);

      expect(result.params.get('redirect_uri')).toBe('');
    });

    it('should handle undefined response type', () => {
      const params = { ...baseParams, responseType: undefined };
      const result = prepareAuthorizationParams(params, mockRandomBytes);

      expect(result.params.get('response_type')).toBe('code'); // Should use default
    });
  });
});
