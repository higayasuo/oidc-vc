import { describe, it, expect } from 'vitest';
import { jwkSchema, jwksResponseSchema } from '../JwksResponse';

describe('JWK Schema', () => {
  describe('RSA keys', () => {
    it('should validate a valid RSA public key', () => {
      const validRsaKey = {
        kty: 'RSA',
        n: 'AQAB',
        e: 'AQAB',
        kid: 'rsa-key-1',
        use: 'sig',
        alg: 'RS256',
      };

      const result = jwkSchema.parse(validRsaKey);
      expect(result.kty).toBe('RSA');
      expect(result.kid).toBe('rsa-key-1');
      expect(result.use).toBe('sig');
      expect(result.alg).toBe('RS256');
    });

    it('should validate a valid RSA private key', () => {
      const validRsaPrivateKey = {
        kty: 'RSA',
        n: 'AQAB',
        e: 'AQAB',
        d: 'private-exponent',
        p: 'first-prime-factor',
        q: 'second-prime-factor',
        dp: 'first-factor-crt-exponent',
        dq: 'second-factor-crt-exponent',
        qi: 'crt-coefficient',
        kid: 'rsa-private-key-1',
        use: 'sig',
        alg: 'RS256',
      };

      const result = jwkSchema.parse(validRsaPrivateKey);
      expect(result.kty).toBe('RSA');
      expect(result.kid).toBe('rsa-private-key-1');
      expect(result.use).toBe('sig');
      expect(result.alg).toBe('RS256');
    });

    it('should reject RSA key without required fields', () => {
      const invalidRsaKey = {
        kty: 'RSA',
        kid: 'rsa-key-1',
        use: 'sig',
        alg: 'RS256',
        // Missing n and e
      };

      expect(() => jwkSchema.parse(invalidRsaKey)).toThrow();
    });

    it('should reject RSA key with missing modulus', () => {
      const invalidRsaKey = {
        kty: 'RSA',
        e: 'AQAB',
        kid: 'rsa-key-1',
        use: 'sig',
        alg: 'RS256',
      };

      expect(() => jwkSchema.parse(invalidRsaKey)).toThrow();
    });

    it('should reject RSA key with missing public exponent', () => {
      const invalidRsaKey = {
        kty: 'RSA',
        n: 'AQAB',
        kid: 'rsa-key-1',
        use: 'sig',
        alg: 'RS256',
      };

      expect(() => jwkSchema.parse(invalidRsaKey)).toThrow();
    });

    it('should validate RSA key with encryption use', () => {
      const rsaEncKey = {
        kty: 'RSA',
        n: 'AQAB',
        e: 'AQAB',
        kid: 'rsa-enc-key-1',
        use: 'enc',
        alg: 'RSA-OAEP',
      };

      const result = jwkSchema.parse(rsaEncKey);
      expect(result.kty).toBe('RSA');
      expect(result.use).toBe('enc');
      expect(result.alg).toBe('RSA-OAEP');
    });
  });

  describe('EC keys', () => {
    it('should validate a valid EC P-256 public key', () => {
      const validEcKey = {
        kty: 'EC',
        crv: 'P-256',
        x: 'x-coordinate-base64url',
        y: 'y-coordinate-base64url',
        kid: 'ec-p256-key-1',
        use: 'sig',
        alg: 'ES256',
      };

      const result = jwkSchema.parse(validEcKey);
      expect(result.kty).toBe('EC');
      expect(result.kid).toBe('ec-p256-key-1');
      expect(result.use).toBe('sig');
      expect(result.alg).toBe('ES256');
    });

    it('should validate a valid EC P-384 public key', () => {
      const validEcKey = {
        kty: 'EC',
        crv: 'P-384',
        x: 'x-coordinate-base64url',
        y: 'y-coordinate-base64url',
        kid: 'ec-p384-key-1',
        use: 'sig',
        alg: 'ES384',
      };

      const result = jwkSchema.parse(validEcKey);
      expect(result.kty).toBe('EC');
      expect(result.kid).toBe('ec-p384-key-1');
    });

    it('should validate a valid EC P-521 public key', () => {
      const validEcKey = {
        kty: 'EC',
        crv: 'P-521',
        x: 'x-coordinate-base64url',
        y: 'y-coordinate-base64url',
        kid: 'ec-p521-key-1',
        use: 'sig',
        alg: 'ES512',
      };

      const result = jwkSchema.parse(validEcKey);
      expect(result.kty).toBe('EC');
      expect(result.kid).toBe('ec-p521-key-1');
    });

    it('should validate a valid EC private key', () => {
      const validEcPrivateKey = {
        kty: 'EC',
        crv: 'P-256',
        x: 'x-coordinate-base64url',
        y: 'y-coordinate-base64url',
        d: 'private-key-base64url',
        kid: 'ec-private-key-1',
        use: 'sig',
        alg: 'ES256',
      };

      const result = jwkSchema.parse(validEcPrivateKey);
      expect(result.kty).toBe('EC');
      expect(result.kid).toBe('ec-private-key-1');
      expect(result.use).toBe('sig');
      expect(result.alg).toBe('ES256');
    });

    it('should reject EC key without required fields', () => {
      const invalidEcKey = {
        kty: 'EC',
        kid: 'ec-key-1',
        use: 'sig',
        alg: 'ES256',
        // Missing crv, x, y
      };

      expect(() => jwkSchema.parse(invalidEcKey)).toThrow();
    });

    it('should reject EC key with missing curve', () => {
      const invalidEcKey = {
        kty: 'EC',
        x: 'x-coordinate-base64url',
        y: 'y-coordinate-base64url',
        kid: 'ec-key-1',
        use: 'sig',
        alg: 'ES256',
      };

      expect(() => jwkSchema.parse(invalidEcKey)).toThrow();
    });

    it('should reject EC key with missing x coordinate', () => {
      const invalidEcKey = {
        kty: 'EC',
        crv: 'P-256',
        y: 'y-coordinate-base64url',
        kid: 'ec-key-1',
        use: 'sig',
        alg: 'ES256',
      };

      expect(() => jwkSchema.parse(invalidEcKey)).toThrow();
    });

    it('should reject EC key with missing y coordinate', () => {
      const invalidEcKey = {
        kty: 'EC',
        crv: 'P-256',
        x: 'x-coordinate-base64url',
        kid: 'ec-key-1',
        use: 'sig',
        alg: 'ES256',
      };

      expect(() => jwkSchema.parse(invalidEcKey)).toThrow();
    });

    it('should validate EC key with encryption use', () => {
      const ecEncKey = {
        kty: 'EC',
        crv: 'P-256',
        x: 'x-coordinate-base64url',
        y: 'y-coordinate-base64url',
        kid: 'ec-enc-key-1',
        use: 'enc',
        alg: 'ECDH-ES',
      };

      const result = jwkSchema.parse(ecEncKey);
      expect(result.kty).toBe('EC');
      expect(result.use).toBe('enc');
      expect(result.alg).toBe('ECDH-ES');
    });
  });

  describe('OKP keys (EdDSA/ECDH)', () => {
    it('should validate a valid Ed25519 public key', () => {
      const validEd25519Key = {
        kty: 'OKP',
        crv: 'Ed25519',
        x: 'public-key-base64url',
        kid: 'ed25519-key-1',
        use: 'sig',
        alg: 'EdDSA',
      };

      const result = jwkSchema.parse(validEd25519Key);
      expect(result.kty).toBe('OKP');
      expect(result.kid).toBe('ed25519-key-1');
      expect(result.use).toBe('sig');
      expect(result.alg).toBe('EdDSA');
    });

    it('should validate a valid Ed448 public key', () => {
      const validEd448Key = {
        kty: 'OKP',
        crv: 'Ed448',
        x: 'public-key-base64url',
        kid: 'ed448-key-1',
        use: 'sig',
        alg: 'EdDSA',
      };

      const result = jwkSchema.parse(validEd448Key);
      expect(result.kty).toBe('OKP');
      expect(result.kid).toBe('ed448-key-1');
    });

    it('should validate a valid X25519 public key', () => {
      const validX25519Key = {
        kty: 'OKP',
        crv: 'X25519',
        x: 'public-key-base64url',
        kid: 'x25519-key-1',
        use: 'enc',
        alg: 'ECDH-ES',
      };

      const result = jwkSchema.parse(validX25519Key);
      expect(result.kty).toBe('OKP');
      expect(result.kid).toBe('x25519-key-1');
      expect(result.use).toBe('enc');
      expect(result.alg).toBe('ECDH-ES');
    });

    it('should validate a valid X448 public key', () => {
      const validX448Key = {
        kty: 'OKP',
        crv: 'X448',
        x: 'public-key-base64url',
        kid: 'x448-key-1',
        use: 'enc',
        alg: 'ECDH-ES',
      };

      const result = jwkSchema.parse(validX448Key);
      expect(result.kty).toBe('OKP');
      expect(result.kid).toBe('x448-key-1');
      expect(result.use).toBe('enc');
    });

    it('should validate a valid OKP private key', () => {
      const validOkpPrivateKey = {
        kty: 'OKP',
        crv: 'Ed25519',
        x: 'public-key-base64url',
        d: 'private-key-base64url',
        kid: 'okp-private-key-1',
        use: 'sig',
        alg: 'EdDSA',
      };

      const result = jwkSchema.parse(validOkpPrivateKey);
      expect(result.kty).toBe('OKP');
      expect(result.kid).toBe('okp-private-key-1');
      expect(result.use).toBe('sig');
      expect(result.alg).toBe('EdDSA');
    });

    it('should reject OKP key without required fields', () => {
      const invalidOkpKey = {
        kty: 'OKP',
        kid: 'okp-key-1',
        use: 'sig',
        alg: 'EdDSA',
        // Missing crv and x
      };

      expect(() => jwkSchema.parse(invalidOkpKey)).toThrow();
    });

    it('should reject OKP key with missing curve', () => {
      const invalidOkpKey = {
        kty: 'OKP',
        x: 'public-key-base64url',
        kid: 'okp-key-1',
        use: 'sig',
        alg: 'EdDSA',
      };

      expect(() => jwkSchema.parse(invalidOkpKey)).toThrow();
    });

    it('should reject OKP key with missing x coordinate', () => {
      const invalidOkpKey = {
        kty: 'OKP',
        crv: 'Ed25519',
        kid: 'okp-key-1',
        use: 'sig',
        alg: 'EdDSA',
      };

      expect(() => jwkSchema.parse(invalidOkpKey)).toThrow();
    });

    it('should reject OKP key with invalid curve for OKP', () => {
      const invalidOkpKey = {
        kty: 'OKP',
        crv: 'P-256', // Invalid for OKP
        x: 'public-key-base64url',
        kid: 'okp-key-1',
        use: 'sig',
        alg: 'EdDSA',
      };

      expect(() => jwkSchema.parse(invalidOkpKey)).toThrow();
    });
  });

  describe('Common fields', () => {
    it('should validate key with all common fields', () => {
      const keyWithCommonFields = {
        kty: 'RSA',
        n: 'AQAB',
        e: 'AQAB',
        kid: 'key-id',
        use: 'sig',
        alg: 'RS256',
        x5c: ['certificate-chain-1', 'certificate-chain-2'],
        x5t: 'thumbprint',
        x5tS256: 'thumbprint-s256',
        x5u: 'x509-url',
      };

      const result = jwkSchema.parse(keyWithCommonFields);
      expect(result.kid).toBe('key-id');
      expect(result.use).toBe('sig');
      expect(result.alg).toBe('RS256');
      expect(result.x5c).toEqual([
        'certificate-chain-1',
        'certificate-chain-2',
      ]);
      expect(result.x5t).toBe('thumbprint');
      expect(result.x5tS256).toBe('thumbprint-s256');
      expect(result.x5u).toBe('x509-url');
    });

    it('should validate key without optional common fields', () => {
      const minimalKey = {
        kty: 'RSA',
        n: 'AQAB',
        e: 'AQAB',
      };

      const result = jwkSchema.parse(minimalKey);
      expect(result.kty).toBe('RSA');
      expect(result.kid).toBeUndefined();
      expect(result.use).toBeUndefined();
      expect(result.alg).toBeUndefined();
    });

    it('should reject invalid key use', () => {
      const invalidKeyUse = {
        kty: 'RSA',
        n: 'AQAB',
        e: 'AQAB',
        use: 'invalid-use', // Invalid use value
      };

      expect(() => jwkSchema.parse(invalidKeyUse)).toThrow();
    });
  });

  describe('Invalid key types', () => {
    it('should reject oct key type', () => {
      const octKey = {
        kty: 'oct',
        k: 'symmetric-key',
        alg: 'A256GCM',
        use: 'enc',
      };

      expect(() => jwkSchema.parse(octKey)).toThrow();
    });

    it('should reject unknown key type', () => {
      const unknownKey = {
        kty: 'UNKNOWN',
        n: 'AQAB',
        e: 'AQAB',
      };

      expect(() => jwkSchema.parse(unknownKey)).toThrow();
    });
  });
});

describe('JWKS Response Schema', () => {
  it('should validate a valid JWKS response', () => {
    const validJwksResponse = {
      keys: [
        {
          kty: 'RSA',
          n: 'AQAB',
          e: 'AQAB',
          kid: 'rsa-key-1',
          use: 'sig',
          alg: 'RS256',
        },
        {
          kty: 'EC',
          crv: 'P-256',
          x: 'x-coordinate-base64url',
          y: 'y-coordinate-base64url',
          kid: 'ec-key-1',
          use: 'sig',
          alg: 'ES256',
        },
        {
          kty: 'OKP',
          crv: 'Ed25519',
          x: 'public-key-base64url',
          kid: 'ed25519-key-1',
          use: 'sig',
          alg: 'EdDSA',
        },
      ],
    };

    const result = jwksResponseSchema.parse(validJwksResponse);
    expect(result.keys).toHaveLength(3);
    expect(result.keys[0].kty).toBe('RSA');
    expect(result.keys[1].kty).toBe('EC');
    expect(result.keys[2].kty).toBe('OKP');
  });

  it('should validate empty JWKS response', () => {
    const emptyJwksResponse = {
      keys: [],
    };

    const result = jwksResponseSchema.parse(emptyJwksResponse);
    expect(result.keys).toHaveLength(0);
  });

  it('should reject JWKS response with invalid keys', () => {
    const invalidJwksResponse = {
      keys: [
        {
          kty: 'RSA',
          // Missing required n and e
          kid: 'invalid-rsa-key',
        },
      ],
    };

    expect(() => jwksResponseSchema.parse(invalidJwksResponse)).toThrow();
  });

  it('should reject JWKS response without keys array', () => {
    const invalidJwksResponse = {
      // Missing keys array
    };

    expect(() => jwksResponseSchema.parse(invalidJwksResponse)).toThrow();
  });
});
