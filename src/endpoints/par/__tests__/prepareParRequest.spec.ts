import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prepareParRequest } from '../prepareParRequest';
import type { RandomBytes } from '@/types';

// Mock randomBytes function
const mockRandomBytes: RandomBytes = vi.fn((size: number) => {
  const bytes = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    bytes[i] = i % 256;
  }
  return bytes;
}) as RandomBytes;

describe('prepareParRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should prepare PAR request with basic parameters', async () => {
    const params = {
      clientId: 'test-client',
      redirectUri: 'https://example.com/callback',
    };

    const result = await prepareParRequest(params, mockRandomBytes);

    expect(result.body.get('client_id')).toBe('test-client');
    expect(result.body.get('redirect_uri')).toBe(
      'https://example.com/callback'
    );
    expect(result.body.get('response_type')).toBe('code');
    expect(result.body.get('scope')).toBe('openid');
    expect(result.headers['Content-Type']).toBe(
      'application/x-www-form-urlencoded'
    );
    expect(result.codeVerifier).toBeDefined();
    expect(result.state).toBeDefined();
    expect(result.scope).toBe('openid');
  });

  it('should prepare PAR request with client secret for Basic authentication', async () => {
    const params = {
      clientId: 'test-client',
      clientSecret: 'test-secret',
      redirectUri: 'https://example.com/callback',
    };

    const result = await prepareParRequest(params, mockRandomBytes);

    expect(result.body.get('client_id')).toBeNull(); // client_id should not be in body for Basic auth
    expect(result.headers.Authorization).toBeDefined();
    expect(result.headers.Authorization).toMatch(/^Basic /);
  });

  it('should prepare PAR request with client assertion', async () => {
    const params = {
      clientId: 'test-client',
      clientAssertion: 'test-assertion',
      clientAssertionType:
        'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      redirectUri: 'https://example.com/callback',
    };

    const result = await prepareParRequest(params, mockRandomBytes);

    expect(result.body.get('client_id')).toBe('test-client');
    expect(result.body.get('client_assertion')).toBe('test-assertion');
    expect(result.body.get('client_assertion_type')).toBe(
      'urn:ietf:params:oauth:client-assertion-type:jwt-bearer'
    );
    expect(result.headers.Authorization).toBeUndefined();
  });

  it('should prepare PAR request with additional parameters', async () => {
    const params = {
      clientId: 'test-client',
      redirectUri: 'https://example.com/callback',
      additionalParams: {
        custom_param: 'custom_value',
        another_param: 'another_value',
      },
    };

    const result = await prepareParRequest(params, mockRandomBytes);

    expect(result.body.get('custom_param')).toBe('custom_value');
    expect(result.body.get('another_param')).toBe('another_value');
  });

  it('should prepare PAR request with custom response type', async () => {
    const params = {
      clientId: 'test-client',
      redirectUri: 'https://example.com/callback',
      responseType: 'code id_token',
    };

    const result = await prepareParRequest(params, mockRandomBytes);

    expect(result.body.get('response_type')).toBe('code id_token');
  });

  it('should prepare PAR request with custom scope', async () => {
    const params = {
      clientId: 'test-client',
      redirectUri: 'https://example.com/callback',
      scope: 'openid profile email',
    };

    const result = await prepareParRequest(params, mockRandomBytes);

    expect(result.body.get('scope')).toBe('openid profile email');
    expect(result.scope).toBe('openid profile email');
  });

  it('should prioritize client secret over client assertion', async () => {
    const params = {
      clientId: 'test-client',
      clientSecret: 'test-secret',
      clientAssertion: 'test-assertion',
      clientAssertionType:
        'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      redirectUri: 'https://example.com/callback',
    };

    const result = await prepareParRequest(params, mockRandomBytes);

    // Client secret takes precedence over client assertion
    expect(result.body.get('client_id')).toBeNull(); // client_id not in body when using Basic auth
    expect(result.body.get('client_assertion')).toBeNull(); // client assertion not applied when Basic auth is used
    expect(result.body.get('client_assertion_type')).toBeNull();
    expect(result.headers.Authorization).toBeDefined(); // Basic auth is used
    expect(result.headers.Authorization).toMatch(/^Basic /);
  });

  it('should include PKCE parameters', async () => {
    const params = {
      clientId: 'test-client',
      redirectUri: 'https://example.com/callback',
    };

    const result = await prepareParRequest(params, mockRandomBytes);

    expect(result.body.get('code_challenge')).toBeDefined();
    expect(result.body.get('code_challenge_method')).toBe('S256');
    expect(result.codeVerifier).toBeDefined();
  });

  it('should include state parameter', async () => {
    const params = {
      clientId: 'test-client',
      redirectUri: 'https://example.com/callback',
    };

    const result = await prepareParRequest(params, mockRandomBytes);

    expect(result.body.get('state')).toBeDefined();
    expect(result.state).toBeDefined();
  });

  it('should include nonce parameter for OpenID Connect', async () => {
    const params = {
      clientId: 'test-client',
      redirectUri: 'https://example.com/callback',
      scope: 'openid',
    };

    const result = await prepareParRequest(params, mockRandomBytes);

    expect(result.body.get('nonce')).toBeDefined();
    expect(result.nonce).toBeDefined();
  });

  it('should not include nonce parameter when scope does not include openid', async () => {
    const params = {
      clientId: 'test-client',
      redirectUri: 'https://example.com/callback',
      scope: 'profile email',
    };

    const result = await prepareParRequest(params, mockRandomBytes);

    expect(result.body.get('nonce')).toBeNull();
    expect(result.nonce).toBeUndefined();
  });

  it('should handle empty additional parameters', async () => {
    const params = {
      clientId: 'test-client',
      redirectUri: 'https://example.com/callback',
      additionalParams: {},
    };

    const result = await prepareParRequest(params, mockRandomBytes);

    expect(result.body.get('client_id')).toBe('test-client');
    expect(result.body.get('redirect_uri')).toBe(
      'https://example.com/callback'
    );
  });
});
