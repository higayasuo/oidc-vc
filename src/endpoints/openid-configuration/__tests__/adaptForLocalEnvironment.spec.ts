import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { adaptForLocalEnvironment } from '../adaptForLocalEnvironment';
import { isLocalEnvironment } from '../isLocalEnvironment';

// Mock the isLocalEnvironment function
vi.mock('../isLocalEnvironment');
const mockIsLocalEnvironment = vi.mocked(isLocalEnvironment);

describe('adaptForLocalEnvironment', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  const sampleOpenIdConfig = {
    issuer: 'https://example.com',
    authorization_endpoint: 'https://example.com/oauth/authorize',
    token_endpoint: 'https://example.com/oauth/token',
    jwks_uri: 'https://example.com/.well-known/jwks.json',
    userinfo_endpoint: 'https://example.com/userinfo',
    end_session_endpoint: 'https://example.com/logout',
    introspection_endpoint: 'https://example.com/introspect',
    revocation_endpoint: 'https://example.com/revoke',
    device_authorization_endpoint: 'https://example.com/device',
    backchannel_authentication_endpoint: 'https://example.com/backchannel',
    pushed_authorization_request_endpoint: 'https://example.com/par',
    check_session_iframe: 'https://example.com/session',
    frontchannel_logout_uri: 'https://example.com/frontchannel',
    backchannel_logout_uri: 'https://example.com/backchannel-logout',
    registration_endpoint: 'https://example.com/register',
    acr_values_supported: ['urn:example:acr:basic'],
    subject_types_supported: ['public'],
    id_token_signing_alg_values_supported: ['RS256'],
    scopes_supported: ['openid', 'profile', 'email'],
    token_endpoint_auth_methods_supported: ['client_secret_basic'],
    claims_supported: ['sub', 'name', 'email'],
    code_challenge_methods_supported: ['S256'],
    grant_types_supported: ['authorization_code'],
    response_types_supported: ['code'],
    response_modes_supported: ['query'],
    display_values_supported: ['page'],
    claim_types_supported: ['normal'],
    service_documentation: 'https://example.com/docs',
    op_policy_uri: 'https://example.com/policy',
    op_tos_uri: 'https://example.com/tos',
    ui_locales_supported: ['en'],
    claims_locales_supported: ['en'],
    request_parameter_supported: true,
    request_uri_parameter_supported: true,
    require_request_uri_registration: false,
    tls_client_certificate_bound_access_tokens: false,
    mtls_endpoint_aliases: {
      token_endpoint: 'https://example.com/mtls/token',
      revocation_endpoint: 'https://example.com/mtls/revoke',
    },
  };

  describe('when isLocalEnvironment returns true', () => {
    beforeEach(() => {
      mockIsLocalEnvironment.mockReturnValue(true);
    });

    it('should adapt endpoints to local environment', () => {
      const localIssuer = 'http://localhost:3000';
      const result = adaptForLocalEnvironment(sampleOpenIdConfig, localIssuer);

      expect(result.authorization_endpoint).toBe(
        'http://localhost:3000/oauth/authorize'
      );
      expect(result.token_endpoint).toBe('http://localhost:3000/oauth/token');
      expect(result.jwks_uri).toBe(
        'http://localhost:3000/.well-known/jwks.json'
      );
      expect(result.userinfo_endpoint).toBe('http://localhost:3000/userinfo');
      expect(result.end_session_endpoint).toBe('http://localhost:3000/logout');
      expect(result.introspection_endpoint).toBe(
        'http://localhost:3000/introspect'
      );
      expect(result.revocation_endpoint).toBe('http://localhost:3000/revoke');
      expect(result.device_authorization_endpoint).toBe(
        'http://localhost:3000/device'
      );
      expect(result.backchannel_authentication_endpoint).toBe(
        'http://localhost:3000/backchannel'
      );
      expect(result.pushed_authorization_request_endpoint).toBe(
        'http://localhost:3000/par'
      );
      expect(result.check_session_iframe).toBe('https://example.com/session'); // _iframe not _endpoint or _uri
      expect(result.frontchannel_logout_uri).toBe(
        'http://localhost:3000/frontchannel'
      );
      expect(result.backchannel_logout_uri).toBe(
        'http://localhost:3000/backchannel-logout'
      );
      expect(result.registration_endpoint).toBe(
        'http://localhost:3000/register'
      );
    });

    it('should update issuer to local issuer', () => {
      const localIssuer = 'http://localhost:3000';
      const result = adaptForLocalEnvironment(sampleOpenIdConfig, localIssuer);

      expect(result.issuer).toBe(localIssuer);
    });

    it('should preserve original_issuer when issuer differs', () => {
      const localIssuer = 'http://localhost:3000';
      const result = adaptForLocalEnvironment(sampleOpenIdConfig, localIssuer);

      expect(result.original_issuer).toBe('https://example.com');
    });

    it('should not set original_issuer when issuer is the same', () => {
      const sameIssuer = 'https://example.com';
      const result = adaptForLocalEnvironment(sampleOpenIdConfig, sameIssuer);

      expect(result.issuer).toBe(sameIssuer);
      expect(result.original_issuer).toBeUndefined();
    });

    it('should preserve non-endpoint properties', () => {
      const localIssuer = 'http://localhost:3000';
      const result = adaptForLocalEnvironment(sampleOpenIdConfig, localIssuer);

      expect(result.acr_values_supported).toEqual(['urn:example:acr:basic']);
      expect(result.subject_types_supported).toEqual(['public']);
      expect(result.id_token_signing_alg_values_supported).toEqual(['RS256']);
      expect(result.scopes_supported).toEqual(['openid', 'profile', 'email']);
      expect(result.token_endpoint_auth_methods_supported).toEqual([
        'client_secret_basic',
      ]);
      expect(result.claims_supported).toEqual(['sub', 'name', 'email']);
      expect(result.code_challenge_methods_supported).toEqual(['S256']);
      expect(result.grant_types_supported).toEqual(['authorization_code']);
      expect(result.response_types_supported).toEqual(['code']);
      expect(result.response_modes_supported).toEqual(['query']);
      expect(result.display_values_supported).toEqual(['page']);
      expect(result.claim_types_supported).toEqual(['normal']);
      expect(result.service_documentation).toBe('https://example.com/docs');
      expect(result.op_policy_uri).toBe('http://localhost:3000/policy'); // _uri suffix
      expect(result.op_tos_uri).toBe('http://localhost:3000/tos'); // _uri suffix
      expect(result.ui_locales_supported).toEqual(['en']);
      expect(result.claims_locales_supported).toEqual(['en']);
      expect(result.request_parameter_supported).toBe(true);
      expect(result.request_uri_parameter_supported).toBe(true);
      expect(result.require_request_uri_registration).toBe(false);
      expect(result.tls_client_certificate_bound_access_tokens).toBe(false);
      expect(result.mtls_endpoint_aliases).toEqual({
        token_endpoint: 'https://example.com/mtls/token',
        revocation_endpoint: 'https://example.com/mtls/revoke',
      });
    });

    it('should handle URLs with query parameters', () => {
      const configWithQuery = {
        ...sampleOpenIdConfig,
        authorization_endpoint:
          'https://example.com/oauth/authorize?param=value',
      };
      const localIssuer = 'http://localhost:3000';
      const result = adaptForLocalEnvironment(configWithQuery, localIssuer);

      expect(result.authorization_endpoint).toBe(
        'http://localhost:3000/oauth/authorize?param=value'
      );
    });

    it('should handle URLs with path segments', () => {
      const configWithPath = {
        ...sampleOpenIdConfig,
        authorization_endpoint: 'https://example.com/api/v1/oauth/authorize',
      };
      const localIssuer = 'http://localhost:3000';
      const result = adaptForLocalEnvironment(configWithPath, localIssuer);

      expect(result.authorization_endpoint).toBe(
        'http://localhost:3000/api/v1/oauth/authorize'
      );
    });

    it('should handle URLs with both path and query', () => {
      const configWithPathAndQuery = {
        ...sampleOpenIdConfig,
        authorization_endpoint:
          'https://example.com/api/v1/oauth/authorize?param=value&other=123',
      };
      const localIssuer = 'http://localhost:3000';
      const result = adaptForLocalEnvironment(
        configWithPathAndQuery,
        localIssuer
      );

      expect(result.authorization_endpoint).toBe(
        'http://localhost:3000/api/v1/oauth/authorize?param=value&other=123'
      );
    });
  });

  describe('when isLocalEnvironment returns false', () => {
    beforeEach(() => {
      mockIsLocalEnvironment.mockReturnValue(false);
    });

    it('should return the original response unchanged', () => {
      const localIssuer = 'http://localhost:3000';
      const result = adaptForLocalEnvironment(sampleOpenIdConfig, localIssuer);

      expect(result).toEqual(sampleOpenIdConfig);
    });

    it('should not modify any endpoints', () => {
      const localIssuer = 'http://localhost:3000';
      const result = adaptForLocalEnvironment(sampleOpenIdConfig, localIssuer);

      expect(result.authorization_endpoint).toBe(
        'https://example.com/oauth/authorize'
      );
      expect(result.token_endpoint).toBe('https://example.com/oauth/token');
      expect(result.issuer).toBe('https://example.com');
    });

    it('should not set original_issuer', () => {
      const localIssuer = 'http://localhost:3000';
      const result = adaptForLocalEnvironment(sampleOpenIdConfig, localIssuer);

      expect(result.original_issuer).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      mockIsLocalEnvironment.mockReturnValue(true);
    });

    it('should handle empty configuration', () => {
      const emptyConfig = {};
      const localIssuer = 'http://localhost:3000';
      const result = adaptForLocalEnvironment(emptyConfig as any, localIssuer);

      expect(result).toEqual({});
    });

    it('should handle configuration with only non-endpoint properties', () => {
      const nonEndpointConfig = {
        issuer: 'https://example.com',
        authorization_endpoint: 'https://example.com/oauth/authorize',
        token_endpoint: 'https://example.com/oauth/token',
        jwks_uri: 'https://example.com/.well-known/jwks.json',
        acr_values_supported: ['urn:example:acr:basic'],
        subject_types_supported: ['public'],
      };
      const localIssuer = 'http://localhost:3000';
      const result = adaptForLocalEnvironment(nonEndpointConfig, localIssuer);

      expect(result.issuer).toBe(localIssuer);
      expect(result.acr_values_supported).toEqual(['urn:example:acr:basic']);
      expect(result.subject_types_supported).toEqual(['public']);
    });

    it('should handle configuration with only endpoint properties', () => {
      const endpointOnlyConfig = {
        issuer: 'https://example.com',
        authorization_endpoint: 'https://example.com/oauth/authorize',
        token_endpoint: 'https://example.com/oauth/token',
        jwks_uri: 'https://example.com/.well-known/jwks.json',
      };
      const localIssuer = 'http://localhost:3000';
      const result = adaptForLocalEnvironment(endpointOnlyConfig, localIssuer);

      expect(result.issuer).toBe(localIssuer);
      expect(result.authorization_endpoint).toBe(
        'http://localhost:3000/oauth/authorize'
      );
      expect(result.token_endpoint).toBe('http://localhost:3000/oauth/token');
    });

    it('should handle malformed URLs gracefully', () => {
      const malformedConfig = {
        issuer: 'https://example.com',
        authorization_endpoint: 'not-a-valid-url',
        token_endpoint: 'https://example.com/oauth/token',
        jwks_uri: 'https://example.com/.well-known/jwks.json',
      };
      const localIssuer = 'http://localhost:3000';

      expect(() => {
        adaptForLocalEnvironment(malformedConfig, localIssuer);
      }).toThrow();
    });
  });

  describe('function call verification', () => {
    it('should call isLocalEnvironment with the correct issuer', () => {
      const localIssuer = 'http://localhost:3000';
      adaptForLocalEnvironment(sampleOpenIdConfig, localIssuer);

      expect(mockIsLocalEnvironment).toHaveBeenCalledWith(localIssuer);
      expect(mockIsLocalEnvironment).toHaveBeenCalledTimes(1);
    });
  });
});
