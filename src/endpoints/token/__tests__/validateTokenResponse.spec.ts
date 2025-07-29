import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateTokenResponse } from '../validateTokenResponse';
import { validateGrantedScope } from '../validateGrantedScope';
import { validateIdToken } from '../validateIdToken';
import { TokenResponse } from '../TokenResponse';
import { Jwk } from '../../jwks/JwksResponse';

// Mock the dependencies
vi.mock('../validateGrantedScope');
vi.mock('../validateIdToken');

const mockValidateGrantedScope = vi.mocked(validateGrantedScope);
const mockValidateIdToken = vi.mocked(validateIdToken);

describe('validateTokenResponse', () => {
  const mockJwks: Jwk[] = [
    {
      kid: 'test-kid',
      kty: 'RSA',
      n: 'test-n',
      e: 'AQAB',
    },
  ];
  const baseParams = {
    tokenResponse: {
      access_token: 'test-access-token',
      token_type: 'Bearer',
      expires_in: 3600,
    } as TokenResponse,
    requestedScope: 'openid profile email',
    jwks: mockJwks,
    issuer: 'https://example.com',
    audience: 'test-client',
    nonce: 'test-nonce',
    state: 'test-state',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock implementations to default behavior
    mockValidateGrantedScope.mockImplementation(() => {});
    mockValidateIdToken.mockResolvedValue({
      payload: { sub: 'test-sub', nonce: 'test-nonce' },
      protectedHeader: { alg: 'RS256' },
    });
  });

  describe('scope validation', () => {
    it('should validate scope when scope is present in token response', async () => {
      const params = {
        ...baseParams,
        tokenResponse: {
          ...baseParams.tokenResponse,
          scope: 'openid profile',
        } as TokenResponse,
      };

      await validateTokenResponse(params);

      expect(mockValidateGrantedScope).toHaveBeenCalledWith({
        requested: 'openid profile email',
        granted: 'openid profile',
      });
    });

    it('should not validate scope when scope is not present in token response', async () => {
      const params = {
        ...baseParams,
        tokenResponse: {
          ...baseParams.tokenResponse,
          scope: undefined,
        } as TokenResponse,
      };

      await validateTokenResponse(params);

      expect(mockValidateGrantedScope).not.toHaveBeenCalled();
    });

    it('should throw error when scope validation fails', async () => {
      const params = {
        ...baseParams,
        tokenResponse: {
          ...baseParams.tokenResponse,
          scope: 'openid profile admin',
        } as TokenResponse,
      };

      mockValidateGrantedScope.mockImplementation(() => {
        throw new Error(
          'Granted scope contains scopes not in requested scope: admin'
        );
      });

      await expect(validateTokenResponse(params)).rejects.toThrow(
        'Granted scope contains scopes not in requested scope: admin'
      );
    });
  });

  describe('ID token validation', () => {
    it('should validate ID token when id_token is present', async () => {
      const mockValidationResult = {
        payload: { sub: 'test-sub', nonce: 'test-nonce' },
        protectedHeader: { alg: 'RS256' },
      };

      const params = {
        ...baseParams,
        tokenResponse: {
          ...baseParams.tokenResponse,
          id_token: 'test-id-token',
        } as TokenResponse,
      };

      mockValidateIdToken.mockResolvedValue(mockValidationResult);

      const result = await validateTokenResponse(params);

      expect(mockValidateIdToken).toHaveBeenCalledWith({
        idToken: 'test-id-token',
        jwks: mockJwks,
        issuer: 'https://example.com',
        audience: 'test-client',
        nonce: 'test-nonce',
        state: 'test-state',
        clockTolerance: undefined,
      });

      expect(result).toEqual(mockValidationResult);
    });

    it('should not validate ID token when id_token is not present', async () => {
      const params = {
        ...baseParams,
        tokenResponse: {
          ...baseParams.tokenResponse,
          id_token: undefined,
        } as TokenResponse,
      };

      const result = await validateTokenResponse(params);

      expect(mockValidateIdToken).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should throw error when ID token validation fails', async () => {
      const params = {
        ...baseParams,
        tokenResponse: {
          ...baseParams.tokenResponse,
          id_token: 'invalid-id-token',
        } as TokenResponse,
      };

      mockValidateIdToken.mockRejectedValue(
        new Error('ID token signature verification failed')
      );

      await expect(validateTokenResponse(params)).rejects.toThrow(
        'ID token signature verification failed'
      );
    });

    it('should pass clockTolerance to validateIdToken when provided', async () => {
      const params = {
        ...baseParams,
        tokenResponse: {
          ...baseParams.tokenResponse,
          id_token: 'test-id-token',
        } as TokenResponse,
        clockTolerance: 60,
      };

      mockValidateIdToken.mockResolvedValue({
        payload: { sub: 'test-sub', nonce: 'test-nonce' },
        protectedHeader: { alg: 'RS256' },
      });

      await validateTokenResponse(params);

      expect(mockValidateIdToken).toHaveBeenCalledWith({
        idToken: 'test-id-token',
        jwks: mockJwks,
        issuer: 'https://example.com',
        audience: 'test-client',
        nonce: 'test-nonce',
        state: 'test-state',
        clockTolerance: 60,
      });
    });
  });

  describe('combined validation', () => {
    it('should validate both scope and ID token when both are present', async () => {
      const mockValidationResult = {
        payload: { sub: 'test-sub', nonce: 'test-nonce' },
        protectedHeader: { alg: 'RS256' },
      };

      const params = {
        ...baseParams,
        tokenResponse: {
          ...baseParams.tokenResponse,
          scope: 'openid profile',
          id_token: 'test-id-token',
        } as TokenResponse,
      };

      mockValidateIdToken.mockResolvedValue(mockValidationResult);

      const result = await validateTokenResponse(params);

      expect(mockValidateGrantedScope).toHaveBeenCalledWith({
        requested: 'openid profile email',
        granted: 'openid profile',
      });

      expect(mockValidateIdToken).toHaveBeenCalledWith({
        idToken: 'test-id-token',
        jwks: mockJwks,
        issuer: 'https://example.com',
        audience: 'test-client',
        nonce: 'test-nonce',
        state: 'test-state',
        clockTolerance: undefined,
      });

      expect(result).toEqual(mockValidationResult);
    });

    it('should validate scope but not ID token when only scope is present', async () => {
      const params = {
        ...baseParams,
        tokenResponse: {
          ...baseParams.tokenResponse,
          scope: 'openid profile',
          id_token: undefined,
        } as TokenResponse,
      };

      const result = await validateTokenResponse(params);

      expect(mockValidateGrantedScope).toHaveBeenCalledWith({
        requested: 'openid profile email',
        granted: 'openid profile',
      });

      expect(mockValidateIdToken).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should validate ID token but not scope when only id_token is present', async () => {
      const mockValidationResult = {
        payload: { sub: 'test-sub', nonce: 'test-nonce' },
        protectedHeader: { alg: 'RS256' },
      };

      const params = {
        ...baseParams,
        tokenResponse: {
          ...baseParams.tokenResponse,
          scope: undefined,
          id_token: 'test-id-token',
        } as TokenResponse,
      };

      mockValidateIdToken.mockResolvedValue(mockValidationResult);

      const result = await validateTokenResponse(params);

      expect(mockValidateGrantedScope).not.toHaveBeenCalled();

      expect(mockValidateIdToken).toHaveBeenCalledWith({
        idToken: 'test-id-token',
        jwks: mockJwks,
        issuer: 'https://example.com',
        audience: 'test-client',
        nonce: 'test-nonce',
        state: 'test-state',
        clockTolerance: undefined,
      });

      expect(result).toEqual(mockValidationResult);
    });
  });
});
