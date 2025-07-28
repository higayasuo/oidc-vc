import { describe, it, expect } from 'vitest';
import { openIdConfigurationResponseSchema } from '../OpenIdConfigurationResponse';

describe('openIdConfigurationResponseSchema', () => {
  it('should validate a complete OpenID configuration response', () => {
    const validConfig = {
      issuer: 'https://example.com',
      authorization_endpoint: 'https://example.com/auth',
      token_endpoint: 'https://example.com/token',
      userinfo_endpoint: 'https://example.com/userinfo',
      jwks_uri: 'https://example.com/jwks',
      pushed_authorization_request_endpoint: 'https://example.com/par',
      revocation_endpoint: 'https://example.com/revoke',
      introspection_endpoint: 'https://example.com/introspect',
      response_types_supported: ['code', 'token'],
      subject_types_supported: ['public'],
      id_token_signing_alg_values_supported: ['RS256'],
    };

    const result = openIdConfigurationResponseSchema.parse(validConfig);
    expect(result).toEqual(validConfig);
  });

  it('should validate a minimal OpenID configuration response', () => {
    const minimalConfig = {
      issuer: 'https://example.com',
      authorization_endpoint: 'https://example.com/auth',
      token_endpoint: 'https://example.com/token',
      jwks_uri: 'https://example.com/jwks',
    };

    const result = openIdConfigurationResponseSchema.parse(minimalConfig);
    expect(result).toEqual(minimalConfig);
  });

  it('should validate configuration with original_issuer', () => {
    const configWithOriginalIssuer = {
      issuer: 'https://example.com',
      original_issuer: 'https://original-issuer.com',
      authorization_endpoint: 'https://example.com/auth',
      token_endpoint: 'https://example.com/token',
      jwks_uri: 'https://example.com/jwks',
    };

    const result = openIdConfigurationResponseSchema.parse(
      configWithOriginalIssuer
    );
    expect(result).toEqual(configWithOriginalIssuer);
  });

  it('should validate configuration with null optional fields', () => {
    const configWithNulls = {
      issuer: 'https://example.com',
      authorization_endpoint: 'https://example.com/auth',
      token_endpoint: 'https://example.com/token',
      userinfo_endpoint: null,
      jwks_uri: 'https://example.com/jwks',
      pushed_authorization_request_endpoint: null,
      revocation_endpoint: null,
      introspection_endpoint: null,
    };

    const result = openIdConfigurationResponseSchema.parse(configWithNulls);
    expect(result).toEqual(configWithNulls);
  });

  it('should validate configuration with undefined optional fields', () => {
    const configWithUndefined = {
      issuer: 'https://example.com',
      authorization_endpoint: 'https://example.com/auth',
      token_endpoint: 'https://example.com/token',
      jwks_uri: 'https://example.com/jwks',
    };

    const result = openIdConfigurationResponseSchema.parse(configWithUndefined);
    expect(result).toEqual(configWithUndefined);
  });

  it('should allow additional properties due to passthrough', () => {
    const configWithExtras = {
      issuer: 'https://example.com',
      authorization_endpoint: 'https://example.com/auth',
      token_endpoint: 'https://example.com/token',
      jwks_uri: 'https://example.com/jwks',
      response_types_supported: ['code', 'token'],
      subject_types_supported: ['public'],
      id_token_signing_alg_values_supported: ['RS256'],
      scopes_supported: ['openid', 'profile', 'email'],
      token_endpoint_auth_methods_supported: ['client_secret_basic'],
      claims_supported: ['sub', 'iss', 'name', 'email'],
      custom_property: 'custom_value',
    };

    const result = openIdConfigurationResponseSchema.parse(configWithExtras);
    expect(result).toEqual(configWithExtras);
  });

  it('should reject invalid issuer URL', () => {
    const invalidConfig = {
      issuer: 'not-a-url',
      authorization_endpoint: 'https://example.com/auth',
      token_endpoint: 'https://example.com/token',
      jwks_uri: 'https://example.com/jwks',
    };

    expect(() =>
      openIdConfigurationResponseSchema.parse(invalidConfig)
    ).toThrow('Invalid url');
  });

  it('should reject invalid authorization_endpoint URL', () => {
    const invalidConfig = {
      issuer: 'https://example.com',
      authorization_endpoint: 'not-a-url',
      token_endpoint: 'https://example.com/token',
      jwks_uri: 'https://example.com/jwks',
    };

    expect(() =>
      openIdConfigurationResponseSchema.parse(invalidConfig)
    ).toThrow('Invalid url');
  });

  it('should reject invalid token_endpoint URL', () => {
    const invalidConfig = {
      issuer: 'https://example.com',
      authorization_endpoint: 'https://example.com/auth',
      token_endpoint: 'not-a-url',
      jwks_uri: 'https://example.com/jwks',
    };

    expect(() =>
      openIdConfigurationResponseSchema.parse(invalidConfig)
    ).toThrow('Invalid url');
  });

  it('should reject invalid jwks_uri URL', () => {
    const invalidConfig = {
      issuer: 'https://example.com',
      authorization_endpoint: 'https://example.com/auth',
      token_endpoint: 'https://example.com/token',
      jwks_uri: 'not-a-url',
    };

    expect(() =>
      openIdConfigurationResponseSchema.parse(invalidConfig)
    ).toThrow('Invalid url');
  });

  it('should reject invalid original_issuer URL', () => {
    const invalidConfig = {
      issuer: 'https://example.com',
      original_issuer: 'not-a-url',
      authorization_endpoint: 'https://example.com/auth',
      token_endpoint: 'https://example.com/token',
      jwks_uri: 'https://example.com/jwks',
    };

    expect(() =>
      openIdConfigurationResponseSchema.parse(invalidConfig)
    ).toThrow('Invalid url');
  });

  it('should reject missing required issuer field', () => {
    const invalidConfig = {
      authorization_endpoint: 'https://example.com/auth',
      token_endpoint: 'https://example.com/token',
      jwks_uri: 'https://example.com/jwks',
    };

    expect(() =>
      openIdConfigurationResponseSchema.parse(invalidConfig)
    ).toThrow('Required');
  });

  it('should reject missing required authorization_endpoint field', () => {
    const invalidConfig = {
      issuer: 'https://example.com',
      token_endpoint: 'https://example.com/token',
      jwks_uri: 'https://example.com/jwks',
    };

    expect(() =>
      openIdConfigurationResponseSchema.parse(invalidConfig)
    ).toThrow('Required');
  });

  it('should reject missing required token_endpoint field', () => {
    const invalidConfig = {
      issuer: 'https://example.com',
      authorization_endpoint: 'https://example.com/auth',
      jwks_uri: 'https://example.com/jwks',
    };

    expect(() =>
      openIdConfigurationResponseSchema.parse(invalidConfig)
    ).toThrow('Required');
  });

  it('should reject missing required jwks_uri field', () => {
    const invalidConfig = {
      issuer: 'https://example.com',
      authorization_endpoint: 'https://example.com/auth',
      token_endpoint: 'https://example.com/token',
    };

    expect(() =>
      openIdConfigurationResponseSchema.parse(invalidConfig)
    ).toThrow('Required');
  });

  it('should validate URLs with different protocols', () => {
    const configWithDifferentProtocols = {
      issuer: 'https://example.com',
      authorization_endpoint: 'https://example.com/auth',
      token_endpoint: 'http://example.com/token',
      jwks_uri: 'https://example.com/jwks',
    };

    const result = openIdConfigurationResponseSchema.parse(
      configWithDifferentProtocols
    );
    expect(result).toEqual(configWithDifferentProtocols);
  });

  it('should validate URLs with query parameters', () => {
    const configWithQueryParams = {
      issuer: 'https://example.com',
      authorization_endpoint: 'https://example.com/auth?param=value',
      token_endpoint: 'https://example.com/token?client_id=123',
      jwks_uri: 'https://example.com/jwks',
    };

    const result = openIdConfigurationResponseSchema.parse(
      configWithQueryParams
    );
    expect(result).toEqual(configWithQueryParams);
  });

  it('should validate URLs with fragments', () => {
    const configWithFragments = {
      issuer: 'https://example.com',
      authorization_endpoint: 'https://example.com/auth#fragment',
      token_endpoint: 'https://example.com/token',
      jwks_uri: 'https://example.com/jwks',
    };

    const result = openIdConfigurationResponseSchema.parse(configWithFragments);
    expect(result).toEqual(configWithFragments);
  });
});
