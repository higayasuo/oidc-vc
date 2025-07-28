import { describe, it, expect, beforeAll } from 'vitest';
import { validateIdToken } from '../validateIdToken';
import type { Jwk } from '../../jwks/JwksResponse';
import { generateKeyPair, SignJWT, exportJWK } from 'jose';

// Dynamically generated test data
let testJwt: string;
let testPublicJwk: Jwk;
let expiredJwt: string;
let expiredPublicJwk: Jwk;
let futureJwt: string;
let futurePublicJwk: Jwk;
let jwtWithoutIat: string;
let jwtWithoutSub: string;
let jwtWithoutNonce: string;
let missingClaimsPublicJwk: Jwk;

// Multiple JWKS test data
let multiJwksJwt1: string;
let multiJwksJwt2: string;
let multiJwksJwt3: string;
let multiJwksPublicJwk1: Jwk;
let multiJwksPublicJwk2: Jwk;
let multiJwksPublicJwk3: Jwk;
let multiJwks: Jwk[];

beforeAll(async () => {
  // Generate test key pair and JWT
  const { privateKey: testPrivateKey, publicKey: testPublicKey } =
    await generateKeyPair('RS256', {
      extractable: true,
    });
  testPublicJwk = (await exportJWK(testPublicKey)) as Jwk;

  const testPayload = {
    sub: 'user-456',
    iss: 'https://example.com',
    aud: 'client-123',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    nonce: 'test-nonce-123',
    'custom-claim': 'test-value',
  };

  testJwt = await new SignJWT(testPayload)
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .sign(testPrivateKey);

  // Generate expired JWT
  const { privateKey: expiredPrivateKey, publicKey: expiredPublicKey } =
    await generateKeyPair('RS256', {
      extractable: true,
    });
  expiredPublicJwk = (await exportJWK(expiredPublicKey)) as Jwk;

  const expiredPayload = {
    sub: 'user-456',
    iss: 'https://example.com',
    aud: 'client-123',
    iat: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
    exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
    nonce: 'expired-nonce-456',
    'custom-claim': 'test-value',
  };

  expiredJwt = await new SignJWT(expiredPayload)
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .sign(expiredPrivateKey);

  // Generate future JWT with nbf claim
  const { privateKey: futurePrivateKey, publicKey: futurePublicKey } =
    await generateKeyPair('RS256', {
      extractable: true,
    });
  futurePublicJwk = (await exportJWK(futurePublicKey)) as Jwk;

  const futurePayload = {
    sub: 'user-456',
    iss: 'https://example.com',
    aud: 'client-123',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7200, // 2 hours from now
    nbf: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now (future)
    nonce: 'future-nonce-789',
    'custom-claim': 'test-value',
  };

  futureJwt = await new SignJWT(futurePayload)
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .sign(futurePrivateKey);

  // Generate JWTs with missing claims
  const {
    privateKey: missingClaimsPrivateKey,
    publicKey: missingClaimsPublicKey,
  } = await generateKeyPair('RS256', {
    extractable: true,
  });
  missingClaimsPublicJwk = (await exportJWK(missingClaimsPublicKey)) as Jwk;

  // JWT without iat claim
  const payloadWithoutIat = {
    sub: 'user-456',
    iss: 'https://example.com',
    aud: 'client-123',
    exp: Math.floor(Date.now() / 1000) + 3600,
    nonce: 'missing-iat-nonce',
    'custom-claim': 'test-value',
  };

  jwtWithoutIat = await new SignJWT(payloadWithoutIat)
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .sign(missingClaimsPrivateKey);

  // JWT without sub claim
  const payloadWithoutSub = {
    iss: 'https://example.com',
    aud: 'client-123',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    nonce: 'missing-sub-nonce',
    'custom-claim': 'test-value',
  };

  jwtWithoutSub = await new SignJWT(payloadWithoutSub)
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .sign(missingClaimsPrivateKey);

  // JWT without nonce claim
  const payloadWithoutNonce = {
    sub: 'user-456',
    iss: 'https://example.com',
    aud: 'client-123',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    'custom-claim': 'test-value',
  };

  jwtWithoutNonce = await new SignJWT(payloadWithoutNonce)
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .sign(missingClaimsPrivateKey);

  // Generate multiple JWKS for testing kid-based selection
  const { privateKey: multiPrivateKey1, publicKey: multiPublicKey1 } =
    await generateKeyPair('RS256', {
      extractable: true,
    });
  multiJwksPublicJwk1 = (await exportJWK(multiPublicKey1)) as Jwk;
  multiJwksPublicJwk1.kid = 'key-1';

  const { privateKey: multiPrivateKey2, publicKey: multiPublicKey2 } =
    await generateKeyPair('RS256', {
      extractable: true,
    });
  multiJwksPublicJwk2 = (await exportJWK(multiPublicKey2)) as Jwk;
  multiJwksPublicJwk2.kid = 'key-2';

  const { privateKey: multiPrivateKey3, publicKey: multiPublicKey3 } =
    await generateKeyPair('RS256', {
      extractable: true,
    });
  multiJwksPublicJwk3 = (await exportJWK(multiPublicKey3)) as Jwk;
  multiJwksPublicJwk3.kid = 'key-3';

  multiJwks = [multiJwksPublicJwk1, multiJwksPublicJwk2, multiJwksPublicJwk3];

  // Generate JWTs with specific kids
  const multiPayload1 = {
    sub: 'user-123',
    iss: 'https://example.com',
    aud: 'client-123',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    nonce: 'multi-nonce-1',
    'custom-claim': 'test-value-1',
  };

  multiJwksJwt1 = await new SignJWT(multiPayload1)
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT', kid: 'key-1' })
    .sign(multiPrivateKey1);

  const multiPayload2 = {
    sub: 'user-456',
    iss: 'https://example.com',
    aud: 'client-123',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    nonce: 'multi-nonce-2',
    'custom-claim': 'test-value-2',
  };

  multiJwksJwt2 = await new SignJWT(multiPayload2)
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT', kid: 'key-2' })
    .sign(multiPrivateKey2);

  const multiPayload3 = {
    sub: 'user-789',
    iss: 'https://example.com',
    aud: 'client-123',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    nonce: 'multi-nonce-3',
    'custom-claim': 'test-value-3',
  };

  multiJwksJwt3 = await new SignJWT(multiPayload3)
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT', kid: 'key-3' })
    .sign(multiPrivateKey3);
});

describe('validateIdToken', () => {
  it('should validate a valid ID token', async () => {
    const result = await validateIdToken({
      idToken: testJwt,
      jwks: [testPublicJwk],
      issuer: 'https://example.com',
      audience: 'client-123',
      nonce: 'test-nonce-123',
    });

    expect(result.payload.sub).toBe('user-456');
    expect(result.payload.iss).toBe('https://example.com');
    expect(result.payload.aud).toBe('client-123');
    expect(result.payload.nonce).toBe('test-nonce-123');
    expect(result.payload['custom-claim']).toBe('test-value');
  });

  it('should validate token with custom clock tolerance', async () => {
    const result = await validateIdToken({
      idToken: testJwt,
      jwks: [testPublicJwk],
      issuer: 'https://example.com',
      audience: 'client-123',
      nonce: 'test-nonce-123',
      clockTolerance: 60,
    });

    expect(result.payload.sub).toBe('user-456');
  });

  it('should throw error for invalid signature', async () => {
    const invalidToken = testJwt.slice(0, -10) + 'invalid';

    await expect(
      validateIdToken({
        idToken: invalidToken,
        jwks: [testPublicJwk],
        issuer: 'https://example.com',
        audience: 'client-123',
        nonce: 'test-nonce-123',
      })
    ).rejects.toThrow('signature verification failed');
  });

  it('should throw error for different issuer', async () => {
    await expect(
      validateIdToken({
        idToken: testJwt,
        jwks: [testPublicJwk],
        issuer: 'https://different-issuer.com',
        audience: 'client-123',
        nonce: 'test-nonce-123',
      })
    ).rejects.toThrow(
      'ID token issuer does not match expected issuer "https://different-issuer.com"'
    );
  });

  it('should throw error for different audience', async () => {
    await expect(
      validateIdToken({
        idToken: testJwt,
        jwks: [testPublicJwk],
        issuer: 'https://example.com',
        audience: 'different-client',
        nonce: 'test-nonce-123',
      })
    ).rejects.toThrow(
      'ID token audience does not match expected audience "different-client"'
    );
  });

  it('should throw error for expired token', async () => {
    await expect(
      validateIdToken({
        idToken: expiredJwt,
        jwks: [expiredPublicJwk],
        issuer: 'https://example.com',
        audience: 'client-123',
        nonce: 'expired-nonce-456',
      })
    ).rejects.toThrow('ID token has expired');
  });

  it('should throw error for token not yet valid', async () => {
    await expect(
      validateIdToken({
        idToken: futureJwt,
        jwks: [futurePublicJwk],
        issuer: 'https://example.com',
        audience: 'client-123',
        nonce: 'future-nonce-789',
      })
    ).rejects.toThrow('ID token is not yet valid (nbf claim check failed)');
  });

  it('should throw error for missing iat claim', async () => {
    await expect(
      validateIdToken({
        idToken: jwtWithoutIat,
        jwks: [missingClaimsPublicJwk],
        issuer: 'https://example.com',
        audience: 'client-123',
        nonce: 'missing-iat-nonce',
      })
    ).rejects.toThrow('ID token is missing the "iat" (issued at) claim');
  });

  it('should throw error for missing sub claim', async () => {
    await expect(
      validateIdToken({
        idToken: jwtWithoutSub,
        jwks: [missingClaimsPublicJwk],
        issuer: 'https://example.com',
        audience: 'client-123',
        nonce: 'missing-sub-nonce',
      })
    ).rejects.toThrow('ID token is missing the "sub" (subject) claim');
  });

  it('should throw error for missing nonce claim', async () => {
    await expect(
      validateIdToken({
        idToken: jwtWithoutNonce,
        jwks: [missingClaimsPublicJwk],
        issuer: 'https://example.com',
        audience: 'client-123',
        nonce: 'expected-nonce',
      })
    ).rejects.toThrow(
      'ID token is missing the "nonce" claim required for CSRF protection'
    );
  });

  it('should throw error for nonce mismatch', async () => {
    await expect(
      validateIdToken({
        idToken: testJwt,
        jwks: [testPublicJwk],
        issuer: 'https://example.com',
        audience: 'client-123',
        nonce: 'different-nonce',
      })
    ).rejects.toThrow(
      'ID token nonce "test-nonce-123" does not match expected value "different-nonce"'
    );
  });

  describe('multiple JWKS with kid-based selection', () => {
    it('should validate token with kid "key-1" using correct JWK', async () => {
      const result = await validateIdToken({
        idToken: multiJwksJwt1,
        jwks: multiJwks,
        issuer: 'https://example.com',
        audience: 'client-123',
        nonce: 'multi-nonce-1',
      });

      expect(result.payload.sub).toBe('user-123');
      expect(result.payload['custom-claim']).toBe('test-value-1');
    });

    it('should validate token with kid "key-2" using correct JWK', async () => {
      const result = await validateIdToken({
        idToken: multiJwksJwt2,
        jwks: multiJwks,
        issuer: 'https://example.com',
        audience: 'client-123',
        nonce: 'multi-nonce-2',
      });

      expect(result.payload.sub).toBe('user-456');
      expect(result.payload['custom-claim']).toBe('test-value-2');
    });

    it('should validate token with kid "key-3" using correct JWK', async () => {
      const result = await validateIdToken({
        idToken: multiJwksJwt3,
        jwks: multiJwks,
        issuer: 'https://example.com',
        audience: 'client-123',
        nonce: 'multi-nonce-3',
      });

      expect(result.payload.sub).toBe('user-789');
      expect(result.payload['custom-claim']).toBe('test-value-3');
    });

    it('should throw error when kid is not found in JWKS', async () => {
      // Create a JWT with a kid that doesn't exist in the JWKS
      const { privateKey: unknownPrivateKey } = await generateKeyPair('RS256', {
        extractable: true,
      });

      const unknownPayload = {
        sub: 'user-unknown',
        iss: 'https://example.com',
        aud: 'client-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
        nonce: 'unknown-nonce',
        'custom-claim': 'test-value-unknown',
      };

      const unknownJwt = await new SignJWT(unknownPayload)
        .setProtectedHeader({ alg: 'RS256', typ: 'JWT', kid: 'unknown-key' })
        .sign(unknownPrivateKey);

      await expect(
        validateIdToken({
          idToken: unknownJwt,
          jwks: multiJwks,
          issuer: 'https://example.com',
          audience: 'client-123',
          nonce: 'unknown-nonce',
        })
      ).rejects.toThrow('JWK with kid "unknown-key" not found');
    });

    it('should use single JWK when no kid is provided and only one JWK exists', async () => {
      // Create a JWT without kid
      const { privateKey: singlePrivateKey, publicKey: singlePublicKey } =
        await generateKeyPair('RS256', {
          extractable: true,
        });
      const singleJwk = (await exportJWK(singlePublicKey)) as Jwk;

      const singlePayload = {
        sub: 'user-single',
        iss: 'https://example.com',
        aud: 'client-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
        nonce: 'single-nonce',
        'custom-claim': 'test-value-single',
      };

      const singleJwt = await new SignJWT(singlePayload)
        .setProtectedHeader({ alg: 'RS256', typ: 'JWT' }) // No kid
        .sign(singlePrivateKey);

      const result = await validateIdToken({
        idToken: singleJwt,
        jwks: [singleJwk],
        issuer: 'https://example.com',
        audience: 'client-123',
        nonce: 'single-nonce',
      });

      expect(result.payload.sub).toBe('user-single');
      expect(result.payload['custom-claim']).toBe('test-value-single');
    });

    it('should throw error when no kid is provided and multiple JWKs exist', async () => {
      // Create a JWT without kid
      const { privateKey: multiPrivateKey } = await generateKeyPair('RS256', {
        extractable: true,
      });

      const multiPayload = {
        sub: 'user-multi',
        iss: 'https://example.com',
        aud: 'client-123',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
        nonce: 'multi-nonce',
        'custom-claim': 'test-value-multi',
      };

      const multiJwt = await new SignJWT(multiPayload)
        .setProtectedHeader({ alg: 'RS256', typ: 'JWT' }) // No kid
        .sign(multiPrivateKey);

      await expect(
        validateIdToken({
          idToken: multiJwt,
          jwks: multiJwks,
          issuer: 'https://example.com',
          audience: 'client-123',
          nonce: 'multi-nonce',
        })
      ).rejects.toThrow('No kid provided and more than one JWK found');
    });
  });
});
