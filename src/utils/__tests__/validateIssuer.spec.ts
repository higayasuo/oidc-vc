import { describe, it, expect } from 'vitest';
import { validateIssuer } from '../validateIssuer';

describe('validateIssuer', () => {
  it('should pass when issuers match exactly', () => {
    const params = {
      receivedIssuer: 'https://example.com',
      expectedIssuer: 'https://example.com',
    };

    expect(() => validateIssuer(params)).not.toThrow();
  });

  it('should pass when issuers match after removing trailing slashes', () => {
    const params = {
      receivedIssuer: 'https://example.com/',
      expectedIssuer: 'https://example.com',
    };

    expect(() => validateIssuer(params)).not.toThrow();
  });

  it('should pass when both issuers have trailing slashes', () => {
    const params = {
      receivedIssuer: 'https://example.com/',
      expectedIssuer: 'https://example.com/',
    };

    expect(() => validateIssuer(params)).not.toThrow();
  });

  it('should pass when expected issuer has trailing slash but received does not', () => {
    const params = {
      receivedIssuer: 'https://example.com',
      expectedIssuer: 'https://example.com/',
    };

    expect(() => validateIssuer(params)).not.toThrow();
  });

  it('should throw error when issuers do not match', () => {
    const params = {
      receivedIssuer: 'https://malicious.com',
      expectedIssuer: 'https://example.com',
    };

    expect(() => validateIssuer(params)).toThrow(
      'Issuer mismatch: received "https://malicious.com" but expected "https://example.com"'
    );
  });

  it('should throw error when issuers have different domains', () => {
    const params = {
      receivedIssuer: 'https://example.org',
      expectedIssuer: 'https://example.com',
    };

    expect(() => validateIssuer(params)).toThrow(
      'Issuer mismatch: received "https://example.org" but expected "https://example.com"'
    );
  });

  it('should throw error when issuers have different protocols', () => {
    const params = {
      receivedIssuer: 'http://example.com',
      expectedIssuer: 'https://example.com',
    };

    expect(() => validateIssuer(params)).toThrow(
      'Issuer mismatch: received "http://example.com" but expected "https://example.com"'
    );
  });

  it('should throw error when issuers have different paths', () => {
    const params = {
      receivedIssuer: 'https://example.com/auth',
      expectedIssuer: 'https://example.com',
    };

    expect(() => validateIssuer(params)).toThrow(
      'Issuer mismatch: received "https://example.com/auth" but expected "https://example.com"'
    );
  });

  it('should throw error when issuers have different ports', () => {
    const params = {
      receivedIssuer: 'https://example.com:8080',
      expectedIssuer: 'https://example.com',
    };

    expect(() => validateIssuer(params)).toThrow(
      'Issuer mismatch: received "https://example.com:8080" but expected "https://example.com"'
    );
  });

  it('should handle complex URLs with multiple trailing slashes', () => {
    const params = {
      receivedIssuer: 'https://example.com///',
      expectedIssuer: 'https://example.com',
    };

    expect(() => validateIssuer(params)).not.toThrow();
  });

  it('should handle URLs with query parameters', () => {
    const params = {
      receivedIssuer: 'https://example.com?param=value',
      expectedIssuer: 'https://example.com',
    };

    expect(() => validateIssuer(params)).toThrow(
      'Issuer mismatch: received "https://example.com?param=value" but expected "https://example.com"'
    );
  });

  it('should handle URLs with fragments', () => {
    const params = {
      receivedIssuer: 'https://example.com#fragment',
      expectedIssuer: 'https://example.com',
    };

    expect(() => validateIssuer(params)).toThrow(
      'Issuer mismatch: received "https://example.com#fragment" but expected "https://example.com"'
    );
  });

  it('should handle empty strings', () => {
    const params = {
      receivedIssuer: '',
      expectedIssuer: 'https://example.com',
    };

    expect(() => validateIssuer(params)).toThrow(
      'Issuer mismatch: received "" but expected "https://example.com"'
    );
  });

  it('should handle both empty strings', () => {
    const params = {
      receivedIssuer: '',
      expectedIssuer: '',
    };

    expect(() => validateIssuer(params)).not.toThrow();
  });

  it('should handle URLs with only trailing slashes', () => {
    const params = {
      receivedIssuer: '/',
      expectedIssuer: '',
    };

    expect(() => validateIssuer(params)).not.toThrow();
  });
});
