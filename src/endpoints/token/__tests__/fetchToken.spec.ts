import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchToken } from '../fetchToken';
import { fetchJson } from '@/utils/fetchJson';
import { applyClientAuth } from '@/utils/applyClientAuth';

// Mock the fetchJson utility
vi.mock('@/utils/fetchJson', () => ({
  fetchJson: vi.fn(),
}));

// Mock the applyClientAuth utility
vi.mock('@/utils/applyClientAuth', () => ({
  applyClientAuth: vi.fn(),
}));

describe('fetchToken', () => {
  const mockFetchJson = vi.mocked(fetchJson);
  const mockApplyClientAuth = vi.mocked(applyClientAuth);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should successfully fetch token with client secret (Basic authentication)', async () => {
    const mockTokenResponse = {
      access_token: 'mock-access-token',
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'openid profile email',
    };

    mockFetchJson.mockResolvedValue(mockTokenResponse);

    const tokenResponse = await fetchToken({
      tokenEndpoint: 'https://example.com/token',
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      code: 'mock-authorization-code',
      codeVerifier: 'mock-code-verifier',
      redirectUri: 'https://example.com/callback',
      grantType: 'authorization_code',
    });

    // Verify applyClientAuth was called with correct parameters
    expect(mockApplyClientAuth).toHaveBeenCalledWith(
      expect.any(URLSearchParams),
      expect.objectContaining({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      {
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        clientAssertionType: undefined,
        clientAssertion: undefined,
      }
    );

    // Verify fetchJson was called with correct parameters
    expect(mockFetchJson).toHaveBeenCalledWith({
      url: 'https://example.com/token',
      schema: expect.any(Object),
      method: 'POST',
      headers: expect.objectContaining({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      body: expect.stringContaining('grant_type=authorization_code'),
    });

    expect(tokenResponse).toEqual(mockTokenResponse);
  });

  it('should successfully fetch token without client secret (client_id in body)', async () => {
    const mockTokenResponse = {
      access_token: 'mock-access-token',
      token_type: 'Bearer',
      expires_in: 3600,
    };

    mockFetchJson.mockResolvedValue(mockTokenResponse);

    const tokenResponse = await fetchToken({
      tokenEndpoint: 'https://example.com/token',
      clientId: 'test-client-id',
      code: 'mock-authorization-code',
      codeVerifier: 'mock-code-verifier',
      redirectUri: 'https://example.com/callback',
      grantType: 'authorization_code',
    });

    // Verify applyClientAuth was called with undefined clientSecret
    expect(mockApplyClientAuth).toHaveBeenCalledWith(
      expect.any(URLSearchParams),
      expect.objectContaining({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      {
        clientId: 'test-client-id',
        clientSecret: undefined,
        clientAssertionType: undefined,
        clientAssertion: undefined,
      }
    );

    // Verify fetchJson was called with correct parameters
    expect(mockFetchJson).toHaveBeenCalledWith({
      url: 'https://example.com/token',
      schema: expect.any(Object),
      method: 'POST',
      headers: expect.objectContaining({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      body: expect.stringContaining('grant_type=authorization_code'),
    });

    expect(tokenResponse).toEqual(mockTokenResponse);
  });

  it('should handle token request with additional parameters', async () => {
    const mockTokenResponse = {
      access_token: 'mock-access-token',
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'openid profile email',
    };

    mockFetchJson.mockResolvedValue(mockTokenResponse);

    const tokenResponse = await fetchToken({
      tokenEndpoint: 'https://example.com/token',
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      code: 'mock-authorization-code',
      codeVerifier: 'mock-code-verifier',
      redirectUri: 'https://example.com/callback',
      grantType: 'authorization_code',
      additionalParams: {
        scope: 'openid profile email',
      },
    });

    // Verify applyClientAuth was called with correct parameters
    expect(mockApplyClientAuth).toHaveBeenCalledWith(
      expect.any(URLSearchParams),
      expect.objectContaining({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      {
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        clientAssertionType: undefined,
        clientAssertion: undefined,
      }
    );

    // Verify fetchJson was called with correct parameters
    expect(mockFetchJson).toHaveBeenCalledWith({
      url: 'https://example.com/token',
      schema: expect.any(Object),
      method: 'POST',
      headers: expect.objectContaining({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      body: expect.stringContaining('grant_type=authorization_code'),
    });

    expect(tokenResponse).toEqual(mockTokenResponse);
  });

  it('should handle token request with client assertion', async () => {
    const mockTokenResponse = {
      access_token: 'mock-access-token',
      token_type: 'Bearer',
      expires_in: 3600,
    };

    mockFetchJson.mockResolvedValue(mockTokenResponse);

    const tokenResponse = await fetchToken({
      tokenEndpoint: 'https://example.com/token',
      clientId: 'test-client-id',
      clientAssertionType:
        'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      clientAssertion: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
      code: 'mock-authorization-code',
      codeVerifier: 'mock-code-verifier',
      redirectUri: 'https://example.com/callback',
      grantType: 'authorization_code',
    });

    // Verify applyClientAuth was called with client assertion parameters
    expect(mockApplyClientAuth).toHaveBeenCalledWith(
      expect.any(URLSearchParams),
      expect.objectContaining({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      {
        clientId: 'test-client-id',
        clientSecret: undefined,
        clientAssertionType:
          'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        clientAssertion: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
      }
    );

    expect(tokenResponse).toEqual(mockTokenResponse);
  });

  it('should handle fetch error', async () => {
    const mockError = new Error('Network error');
    mockFetchJson.mockRejectedValue(mockError);

    await expect(
      fetchToken({
        tokenEndpoint: 'https://example.com/token',
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        code: 'mock-authorization-code',
        codeVerifier: 'mock-code-verifier',
        redirectUri: 'https://example.com/callback',
        grantType: 'authorization_code',
      })
    ).rejects.toThrow('Network error');
  });

  it('should handle token endpoint with trailing slash', async () => {
    const mockTokenResponse = {
      access_token: 'mock-access-token',
      token_type: 'Bearer',
      expires_in: 3600,
    };

    mockFetchJson.mockResolvedValue(mockTokenResponse);

    const tokenResponse = await fetchToken({
      tokenEndpoint: 'https://example.com/token/',
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      code: 'mock-authorization-code',
      codeVerifier: 'mock-code-verifier',
      redirectUri: 'https://example.com/callback',
      grantType: 'authorization_code',
    });

    // Verify applyClientAuth was called
    expect(mockApplyClientAuth).toHaveBeenCalledWith(
      expect.any(URLSearchParams),
      expect.objectContaining({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      {
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        clientAssertionType: undefined,
        clientAssertion: undefined,
      }
    );

    // Verify fetchJson was called with correct URL
    expect(mockFetchJson).toHaveBeenCalledWith({
      url: 'https://example.com/token/',
      schema: expect.any(Object),
      method: 'POST',
      headers: expect.objectContaining({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      body: expect.stringContaining('grant_type=authorization_code'),
    });

    expect(tokenResponse).toEqual(mockTokenResponse);
  });

  it('should handle empty client secret', async () => {
    const mockTokenResponse = {
      access_token: 'mock-access-token',
      token_type: 'Bearer',
      expires_in: 3600,
    };

    mockFetchJson.mockResolvedValue(mockTokenResponse);

    const tokenResponse = await fetchToken({
      tokenEndpoint: 'https://example.com/token',
      clientId: 'test-client-id',
      clientSecret: '',
      code: 'mock-authorization-code',
      codeVerifier: 'mock-code-verifier',
      redirectUri: 'https://example.com/callback',
      grantType: 'authorization_code',
    });

    // Verify applyClientAuth was called with empty string clientSecret
    expect(mockApplyClientAuth).toHaveBeenCalledWith(
      expect.any(URLSearchParams),
      expect.objectContaining({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      {
        clientId: 'test-client-id',
        clientSecret: '',
        clientAssertionType: undefined,
        clientAssertion: undefined,
      }
    );

    expect(tokenResponse).toEqual(mockTokenResponse);
  });

  it('should handle null client secret', async () => {
    const mockTokenResponse = {
      access_token: 'mock-access-token',
      token_type: 'Bearer',
      expires_in: 3600,
    };

    mockFetchJson.mockResolvedValue(mockTokenResponse);

    const tokenResponse = await fetchToken({
      tokenEndpoint: 'https://example.com/token',
      clientId: 'test-client-id',
      clientSecret: null as any,
      code: 'mock-authorization-code',
      codeVerifier: 'mock-code-verifier',
      redirectUri: 'https://example.com/callback',
      grantType: 'authorization_code',
    });

    // Verify applyClientAuth was called with null clientSecret
    expect(mockApplyClientAuth).toHaveBeenCalledWith(
      expect.any(URLSearchParams),
      expect.objectContaining({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      {
        clientId: 'test-client-id',
        clientSecret: null,
        clientAssertionType: undefined,
        clientAssertion: undefined,
      }
    );

    expect(tokenResponse).toEqual(mockTokenResponse);
  });

  it('should handle all authentication methods together', async () => {
    const mockTokenResponse = {
      access_token: 'mock-access-token',
      token_type: 'Bearer',
      expires_in: 3600,
    };

    mockFetchJson.mockResolvedValue(mockTokenResponse);

    const tokenResponse = await fetchToken({
      tokenEndpoint: 'https://example.com/token',
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      clientAssertionType:
        'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      clientAssertion: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
      code: 'mock-authorization-code',
      codeVerifier: 'mock-code-verifier',
      redirectUri: 'https://example.com/callback',
      grantType: 'authorization_code',
    });

    // Verify applyClientAuth was called with all authentication parameters
    expect(mockApplyClientAuth).toHaveBeenCalledWith(
      expect.any(URLSearchParams),
      expect.objectContaining({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      {
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        clientAssertionType:
          'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        clientAssertion: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
      }
    );

    expect(tokenResponse).toEqual(mockTokenResponse);
  });
});
