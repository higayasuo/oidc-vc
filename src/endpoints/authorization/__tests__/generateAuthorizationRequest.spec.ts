import { describe, it, expect } from 'vitest';
import { generateAuthorizationRequest } from '../generateAuthorizationRequest';
import type { RandomBytes } from '@/types';
import {
  TEST_CLIENT_ID,
  TEST_ISSUER,
  TEST_REDIRECT_URI,
} from '@/testing/constants';

describe('generateAuthorizationRequest', () => {
  const mockRandomBytes: RandomBytes = (byteLength = 32) => {
    return new Uint8Array(byteLength).fill(255);
  };

  const baseConfig = {
    authorizationEndpoint: `${TEST_ISSUER}/api/authorization`,
    clientId: TEST_CLIENT_ID,
    redirectUri: TEST_REDIRECT_URI,
  };

  it('should generate basic authorization request URL', () => {
    const result = generateAuthorizationRequest(baseConfig, mockRandomBytes);

    expect(result.url.href).toContain(`${TEST_ISSUER}/api/authorization`);
    expect(result.url.searchParams.get('response_type')).toBe('code');
    expect(result.url.searchParams.get('client_id')).toBe(TEST_CLIENT_ID);
    expect(result.url.searchParams.get('redirect_uri')).toBe(TEST_REDIRECT_URI);
    expect(result.url.searchParams.get('scope')).toBe('openid');
    expect(result.url.searchParams.get('state')).toBeDefined();
    expect(result.url.searchParams.get('code_challenge')).toBeDefined();
    expect(result.url.searchParams.get('code_challenge_method')).toBe('S256');
    expect(result.codeVerifier).toBeDefined();
  });

  it('should use custom response type', () => {
    const config = { ...baseConfig, responseType: 'token' };
    const result = generateAuthorizationRequest(config, mockRandomBytes);

    expect(result.url.searchParams.get('response_type')).toBe('token');
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
  });

  it('should generate consistent URLs with same input', () => {
    const result1 = generateAuthorizationRequest(baseConfig, mockRandomBytes);
    const result2 = generateAuthorizationRequest(baseConfig, mockRandomBytes);

    expect(result1.url.href).toBe(result2.url.href);
    expect(result1.codeVerifier).toBe(result2.codeVerifier);
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
    ];

    expectedParams.forEach((param) => {
      expect(result.url.searchParams.has(param)).toBe(true);
    });
  });

  it('should generate valid URL structure', () => {
    const result = generateAuthorizationRequest(baseConfig, mockRandomBytes);

    // Should be a valid URL
    expect(result.url).toBeInstanceOf(URL);
    expect(result.url.protocol).toBe('https:');
    expect(result.url.hostname).toBe('vc-issuer.g-trustedweb.workers.dev');
    expect(result.url.pathname).toBe('/api/authorization');
  });
});
