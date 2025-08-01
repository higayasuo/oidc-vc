import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isLocalEnvironment } from '../isLocalEnvironment';

describe('isLocalEnvironment', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('with NODE_ENV=development', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should return true for localhost URLs with port', () => {
      expect(isLocalEnvironment('http://localhost:3000')).toBe(true);
      expect(isLocalEnvironment('http://localhost:8080')).toBe(true);
      expect(isLocalEnvironment('http://localhost:5000')).toBe(true);
    });

    it('should return false for localhost URLs without port', () => {
      expect(isLocalEnvironment('http://localhost')).toBe(false);
    });

    it('should return false for non-localhost URLs', () => {
      expect(isLocalEnvironment('https://example.com')).toBe(false);
      expect(isLocalEnvironment('http://example.com')).toBe(false);
      expect(isLocalEnvironment('https://localhost:3000')).toBe(false);
      expect(isLocalEnvironment('http://127.0.0.1:3000')).toBe(false);
    });

    it('should return false for invalid URLs', () => {
      expect(isLocalEnvironment('invalid-url')).toBe(false);
      expect(isLocalEnvironment('')).toBe(false);
    });
  });

  describe('with NODE_ENV=test', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'test';
    });

    it('should return true for localhost URLs with port', () => {
      expect(isLocalEnvironment('http://localhost:3000')).toBe(true);
      expect(isLocalEnvironment('http://localhost:8080')).toBe(true);
    });

    it('should return false for non-localhost URLs', () => {
      expect(isLocalEnvironment('https://example.com')).toBe(false);
      expect(isLocalEnvironment('http://example.com')).toBe(false);
    });
  });

  describe('with NODE_ENV=production', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it('should return false even for localhost URLs', () => {
      expect(isLocalEnvironment('http://localhost:3000')).toBe(false);
      expect(isLocalEnvironment('http://localhost:8080')).toBe(false);
    });

    it('should return false for other URLs', () => {
      expect(isLocalEnvironment('https://example.com')).toBe(false);
      expect(isLocalEnvironment('http://example.com')).toBe(false);
    });
  });

  describe('with NODE_ENV=undefined', () => {
    beforeEach(() => {
      delete process.env.NODE_ENV;
    });

    it('should return false for any URL', () => {
      expect(isLocalEnvironment('http://localhost:3000')).toBe(false);
      expect(isLocalEnvironment('https://example.com')).toBe(false);
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should handle URLs with query parameters', () => {
      expect(isLocalEnvironment('http://localhost:3000?param=value')).toBe(
        true
      );
    });

    it('should handle URLs with path', () => {
      expect(isLocalEnvironment('http://localhost:3000/api')).toBe(true);
    });

    it('should handle URLs with both path and query', () => {
      expect(isLocalEnvironment('http://localhost:3000/api?param=value')).toBe(
        true
      );
    });

    it('should handle case sensitivity', () => {
      expect(isLocalEnvironment('HTTP://LOCALHOST:3000')).toBe(false);
    });

    it('should handle whitespace', () => {
      expect(isLocalEnvironment(' http://localhost:3000')).toBe(true); // trim() removes leading space
      expect(isLocalEnvironment('http://localhost:3000 ')).toBe(true); // trim() removes trailing space
    });

    it('should handle null and undefined', () => {
      expect(isLocalEnvironment(null as any)).toBe(false);
      expect(isLocalEnvironment(undefined as any)).toBe(false);
    });
  });

  describe('security considerations', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should not match HTTPS localhost', () => {
      expect(isLocalEnvironment('https://localhost:3000')).toBe(false);
    });

    it('should not match IP addresses', () => {
      expect(isLocalEnvironment('http://127.0.0.1:3000')).toBe(false);
      expect(isLocalEnvironment('http://0.0.0.0:3000')).toBe(false);
    });

    it('should not match localhost subdomains', () => {
      expect(isLocalEnvironment('http://api.localhost:3000')).toBe(false);
      expect(isLocalEnvironment('http://localhost.example.com:3000')).toBe(
        false
      );
    });
  });
});
