import { describe, it, expect } from 'vitest';
import { verifyAuthorizationResponse } from '../verifyAuthorizationResponse';

describe('verifyAuthorizationResponse', () => {
  const validExpected = {
    state: 'test-state-123',
    issuer: 'https://example.com',
    clientId: 'test-client-id',
    redirectUri: 'https://client.com/callback',
  };

  it('should return authorization code for valid response', () => {
    const validLocation =
      'https://client.com/callback?code=test-auth-code&state=test-state-123';

    const result = verifyAuthorizationResponse(validLocation, validExpected);

    expect(result).toBe('test-auth-code');
  });

  it('should validate state parameter matches expected', () => {
    const locationWithMismatchedState =
      'https://client.com/callback?code=test-auth-code&state=wrong-state';

    expect(() =>
      verifyAuthorizationResponse(locationWithMismatchedState, validExpected)
    ).toThrow(
      'State mismatch: received "wrong-state" but expected "test-state-123"'
    );
  });

  it('should validate client ID when present', () => {
    const locationWithClientId =
      'https://client.com/callback?code=test-auth-code&state=test-state-123&client_id=wrong-client-id';

    expect(() =>
      verifyAuthorizationResponse(locationWithClientId, validExpected)
    ).toThrow(
      'Client ID mismatch: received "wrong-client-id" but expected "test-client-id"'
    );
  });

  it('should validate issuer when present', () => {
    const locationWithIssuer =
      'https://client.com/callback?code=test-auth-code&state=test-state-123&iss=https://wrong-issuer.com';

    expect(() =>
      verifyAuthorizationResponse(locationWithIssuer, validExpected)
    ).toThrow(
      'Issuer mismatch: received "https://wrong-issuer.com" but expected "https://example.com"'
    );
  });

  it('should validate redirect URI origin and pathname', () => {
    const locationWithWrongOrigin =
      'https://wrong-client.com/callback?code=test-auth-code&state=test-state-123';

    expect(() =>
      verifyAuthorizationResponse(locationWithWrongOrigin, validExpected)
    ).toThrow(
      'Redirect URI mismatch: received "https://wrong-client.com/callback" but expected "https://client.com/callback"'
    );
  });

  it('should validate redirect URI pathname', () => {
    const locationWithWrongPath =
      'https://client.com/wrong-path?code=test-auth-code&state=test-state-123';

    expect(() =>
      verifyAuthorizationResponse(locationWithWrongPath, validExpected)
    ).toThrow(
      'Redirect URI mismatch: received "https://client.com/wrong-path" but expected "https://client.com/callback"'
    );
  });

  it('should throw error when state is missing', () => {
    const locationWithoutState =
      'https://client.com/callback?code=test-auth-code';

    expect(() =>
      verifyAuthorizationResponse(locationWithoutState, validExpected)
    ).toThrow('State is missing in the authorization response');
  });

  it('should throw error when code is missing', () => {
    const locationWithoutCode =
      'https://client.com/callback?state=test-state-123';

    expect(() =>
      verifyAuthorizationResponse(locationWithoutCode, validExpected)
    ).toThrow('Code is missing in the authorization response');
  });

  it('should throw error for authorization error response', () => {
    const errorLocation =
      'https://client.com/callback?error=access_denied&error_description=User%20denied%20access';

    expect(() =>
      verifyAuthorizationResponse(errorLocation, validExpected)
    ).toThrow('Authorization error: access_denied User denied access');
  });

  it('should throw error for authorization error without description', () => {
    const errorLocationWithoutDescription =
      'https://client.com/callback?error=access_denied';

    expect(() =>
      verifyAuthorizationResponse(
        errorLocationWithoutDescription,
        validExpected
      )
    ).toThrow('Authorization error: access_denied null');
  });

  it('should throw error for invalid location URL', () => {
    const invalidLocation = 'not-a-valid-url';

    expect(() =>
      verifyAuthorizationResponse(invalidLocation, validExpected)
    ).toThrow('Invalid location URL: not-a-valid-url');
  });

  it('should throw error for invalid expected redirect URI', () => {
    const invalidExpected = {
      ...validExpected,
      redirectUri: 'not-a-valid-url',
    };

    const validLocation =
      'https://client.com/callback?code=test-auth-code&state=test-state-123';

    expect(() =>
      verifyAuthorizationResponse(validLocation, invalidExpected)
    ).toThrow('Invalid expected redirect URI: not-a-valid-url');
  });

  it('should accept URLs with query parameters in redirect URI', () => {
    const expectedWithQueryParams = {
      ...validExpected,
      redirectUri: 'https://client.com/callback?param=value',
    };

    const locationWithQueryParams =
      'https://client.com/callback?param=value&code=test-auth-code&state=test-state-123';

    const result = verifyAuthorizationResponse(
      locationWithQueryParams,
      expectedWithQueryParams
    );

    expect(result).toBe('test-auth-code');
  });

  it('should accept URLs with fragments in redirect URI', () => {
    const expectedWithFragment = {
      ...validExpected,
      redirectUri: 'https://client.com/callback#section',
    };

    const locationWithFragment =
      'https://client.com/callback?code=test-auth-code&state=test-state-123#section';

    const result = verifyAuthorizationResponse(
      locationWithFragment,
      expectedWithFragment
    );

    expect(result).toBe('test-auth-code');
  });

  it('should handle issuer with trailing slash normalization', () => {
    const expectedWithTrailingSlash = {
      ...validExpected,
      issuer: 'https://example.com/',
    };

    const locationWithIssuer =
      'https://client.com/callback?code=test-auth-code&state=test-state-123&iss=https://example.com';

    const result = verifyAuthorizationResponse(
      locationWithIssuer,
      expectedWithTrailingSlash
    );

    expect(result).toBe('test-auth-code');
  });

  it('should handle issuer with multiple trailing slashes', () => {
    const expectedWithMultipleSlashes = {
      ...validExpected,
      issuer: 'https://example.com//',
    };

    const locationWithIssuer =
      'https://client.com/callback?code=test-auth-code&state=test-state-123&iss=https://example.com//';

    const result = verifyAuthorizationResponse(
      locationWithIssuer,
      expectedWithMultipleSlashes
    );

    expect(result).toBe('test-auth-code');
  });

  it('should ignore query parameters and fragments when comparing redirect URI', () => {
    const locationWithExtraParams =
      'https://client.com/callback?code=test-auth-code&state=test-state-123&extra=param#fragment';

    const result = verifyAuthorizationResponse(
      locationWithExtraParams,
      validExpected
    );

    expect(result).toBe('test-auth-code');
  });
});
