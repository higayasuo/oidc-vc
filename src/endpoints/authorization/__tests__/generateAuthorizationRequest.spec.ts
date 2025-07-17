import { describe, it, expect } from 'vitest';
import { generateAuthorizationRequest } from '../generateAuthorizationRequest';
import type { RandomBytes } from '@/types';

const issuer = process.env.ISSUER!;
const clientId = process.env.CLIENT_ID!;
const redirectUri = process.env.REDIRECT_URI!;

describe('generateAuthorizationRequest', () => {
  const mockRandomBytes: RandomBytes = (byteLength = 32) => {
    return new Uint8Array(byteLength).fill(255);
  };

  const baseConfig = {
    authorizationEndpoint: `${issuer}/api/authorization`,
    clientId,
    redirectUri,
  };

  it('should generate basic authorization request URL with nonce for openid scope', () => {
    const result = generateAuthorizationRequest(baseConfig, mockRandomBytes);

    expect(result.url.href).toContain(`${issuer}/api/authorization`);
    expect(result.url.searchParams.get('response_type')).toBe('code');
    expect(result.url.searchParams.get('client_id')).toBe(clientId);
    expect(result.url.searchParams.get('redirect_uri')).toBe(redirectUri);
    expect(result.url.searchParams.get('scope')).toBe('openid');
    expect(result.url.searchParams.get('state')).toBeDefined();
    expect(result.url.searchParams.get('code_challenge')).toBeDefined();
    expect(result.url.searchParams.get('code_challenge_method')).toBe('S256');
    expect(result.url.searchParams.get('nonce')).toBeDefined();
    expect(result.codeVerifier).toBeDefined();
    expect(result.nonce).toBeDefined();
  });

  it('should not generate nonce when scope does not include openid', () => {
    const config = { ...baseConfig, scope: 'email profile' };
    const result = generateAuthorizationRequest(config, mockRandomBytes);

    expect(result.url.searchParams.get('scope')).toBe('email profile');
    expect(result.url.searchParams.get('nonce')).toBeNull();
    expect(result.nonce).toBeUndefined();
  });

  it('should generate nonce when scope includes openid among other scopes', () => {
    const config = { ...baseConfig, scope: 'openid email profile' };
    const result = generateAuthorizationRequest(config, mockRandomBytes);

    expect(result.url.searchParams.get('scope')).toBe('openid email profile');
    expect(result.url.searchParams.get('nonce')).toBeDefined();
    expect(result.nonce).toBeDefined();
  });

  it('should use custom response type', () => {
    const config = { ...baseConfig, responseType: 'token' };
    const result = generateAuthorizationRequest(config, mockRandomBytes);

    expect(result.url.searchParams.get('response_type')).toBe('token');
    expect(result.nonce).toBeDefined(); // openid scope is default
  });

  it('should include additional parameters', () => {
    const config = {
      ...baseConfig,
      additionalParams: {
        prompt: 'consent',
        access_type: 'offline',
        include_granted_scopes: 'true',
      },
    };
    const result = generateAuthorizationRequest(config, mockRandomBytes);

    expect(result.url.searchParams.get('prompt')).toBe('consent');
    expect(result.url.searchParams.get('access_type')).toBe('offline');
    expect(result.url.searchParams.get('include_granted_scopes')).toBe('true');
    expect(result.nonce).toBeDefined(); // openid scope is default
  });

  it('should generate consistent URLs with same input', () => {
    const result1 = generateAuthorizationRequest(baseConfig, mockRandomBytes);
    const result2 = generateAuthorizationRequest(baseConfig, mockRandomBytes);

    expect(result1.url.href).toBe(result2.url.href);
    expect(result1.codeVerifier).toBe(result2.codeVerifier);
    expect(result1.nonce).toBe(result2.nonce);
  });

  it('should generate different URLs with different random values', () => {
    let callCount = 0;
    const differentRandomBytes: RandomBytes = (byteLength = 32) => {
      const bytes = new Uint8Array(byteLength);
      bytes.fill(callCount++);
      return bytes;
    };

    const result1 = generateAuthorizationRequest(
      baseConfig,
      differentRandomBytes
    );
    const result2 = generateAuthorizationRequest(
      baseConfig,
      differentRandomBytes
    );

    expect(result1.url.href).not.toBe(result2.url.href);
    expect(result1.codeVerifier).not.toBe(result2.codeVerifier);
    expect(result1.nonce).not.toBe(result2.nonce);
  });

  it('should properly encode URL parameters', () => {
    const config = {
      ...baseConfig,
      redirectUri: 'https://myapp.com/callback?param=value&another=test',
      scope: 'openid email profile custom:scope',
    };
    const result = generateAuthorizationRequest(config, mockRandomBytes);

    expect(result.url.searchParams.get('redirect_uri')).toBe(
      'https://myapp.com/callback?param=value&another=test'
    );
    expect(result.url.searchParams.get('scope')).toBe(
      'openid email profile custom:scope'
    );
    expect(result.nonce).toBeDefined();
  });

  it('should handle empty additional parameters', () => {
    const config = { ...baseConfig, additionalParams: {} };
    const result = generateAuthorizationRequest(config, mockRandomBytes);

    // Should not contain any unexpected parameters
    const expectedParams = [
      'response_type',
      'client_id',
      'redirect_uri',
      'scope',
      'state',
      'code_challenge',
      'code_challenge_method',
      'nonce', // openid scope is default
    ];

    expectedParams.forEach((param) => {
      expect(result.url.searchParams.has(param)).toBe(true);
    });
  });

  it('should handle empty additional parameters without nonce for non-openid scope', () => {
    const config = {
      ...baseConfig,
      scope: 'email profile',
      additionalParams: {},
    };
    const result = generateAuthorizationRequest(config, mockRandomBytes);

    // Should not contain nonce parameter
    const expectedParams = [
      'response_type',
      'client_id',
      'redirect_uri',
      'scope',
      'state',
      'code_challenge',
      'code_challenge_method',
    ];

    expectedParams.forEach((param) => {
      expect(result.url.searchParams.has(param)).toBe(true);
    });

    expect(result.url.searchParams.has('nonce')).toBe(false);
    expect(result.nonce).toBeUndefined();
  });
});
