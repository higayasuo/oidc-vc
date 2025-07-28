import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchToken } from '../fetchToken';
import { fetchJson } from '@/utils/fetchJson';

// Mock the fetchJson utility
vi.mock('@/utils/fetchJson', () => ({
  fetchJson: vi.fn(),
}));

describe('fetchToken', () => {
  const mockFetchJson = vi.mocked(fetchJson);

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

    expect(mockFetchJson).toHaveBeenCalledWith({
      url: 'https://example.com/token',
      schema: expect.any(Object),
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic dGVzdC1jbGllbnQtaWQ6dGVzdC1jbGllbnQtc2VjcmV0',
      },
      body: 'grant_type=authorization_code&code=mock-authorization-code&code_verifier=mock-code-verifier&redirect_uri=https%3A%2F%2Fexample.com%2Fcallback',
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

    expect(mockFetchJson).toHaveBeenCalledWith({
      url: 'https://example.com/token',
      schema: expect.any(Object),
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=authorization_code&code=mock-authorization-code&code_verifier=mock-code-verifier&redirect_uri=https%3A%2F%2Fexample.com%2Fcallback&client_id=test-client-id',
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

    expect(mockFetchJson).toHaveBeenCalledWith({
      url: 'https://example.com/token',
      schema: expect.any(Object),
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic dGVzdC1jbGllbnQtaWQ6dGVzdC1jbGllbnQtc2VjcmV0',
      },
      body: 'grant_type=authorization_code&code=mock-authorization-code&code_verifier=mock-code-verifier&redirect_uri=https%3A%2F%2Fexample.com%2Fcallback&scope=openid+profile+email',
    });

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

    expect(mockFetchJson).toHaveBeenCalledWith({
      url: 'https://example.com/token/',
      schema: expect.any(Object),
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic dGVzdC1jbGllbnQtaWQ6dGVzdC1jbGllbnQtc2VjcmV0',
      },
      body: 'grant_type=authorization_code&code=mock-authorization-code&code_verifier=mock-code-verifier&redirect_uri=https%3A%2F%2Fexample.com%2Fcallback',
    });

    expect(tokenResponse).toEqual(mockTokenResponse);
  });

  it('should handle empty client secret (Basic auth with empty password)', async () => {
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

    expect(mockFetchJson).toHaveBeenCalledWith({
      url: 'https://example.com/token',
      schema: expect.any(Object),
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic dGVzdC1jbGllbnQtaWQ6',
      },
      body: 'grant_type=authorization_code&code=mock-authorization-code&code_verifier=mock-code-verifier&redirect_uri=https%3A%2F%2Fexample.com%2Fcallback',
    });

    expect(tokenResponse).toEqual(mockTokenResponse);
  });

  it('should handle null client secret (client_id in body)', async () => {
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

    expect(mockFetchJson).toHaveBeenCalledWith({
      url: 'https://example.com/token',
      schema: expect.any(Object),
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=authorization_code&code=mock-authorization-code&code_verifier=mock-code-verifier&redirect_uri=https%3A%2F%2Fexample.com%2Fcallback&client_id=test-client-id',
    });

    expect(tokenResponse).toEqual(mockTokenResponse);
  });
});
