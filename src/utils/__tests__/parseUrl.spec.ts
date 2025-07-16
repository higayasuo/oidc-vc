import { describe, it, expect } from 'vitest';
import { parseUrl } from '../parseUrl';

describe('parseUrl', () => {
  it('should parse valid HTTP URLs', () => {
    const url = parseUrl('http://example.com', 'test URL');
    expect(url.href).toBe('http://example.com/');
    expect(url.protocol).toBe('http:');
    expect(url.hostname).toBe('example.com');
  });

  it('should parse valid HTTPS URLs', () => {
    const url = parseUrl('https://example.com', 'test URL');
    expect(url.href).toBe('https://example.com/');
    expect(url.protocol).toBe('https:');
    expect(url.hostname).toBe('example.com');
  });

  it('should parse URLs with paths', () => {
    const url = parseUrl('https://example.com/path/to/resource', 'test URL');
    expect(url.href).toBe('https://example.com/path/to/resource');
    expect(url.pathname).toBe('/path/to/resource');
  });

  it('should parse URLs with query parameters', () => {
    const url = parseUrl(
      'https://example.com?param1=value1&param2=value2',
      'test URL'
    );
    expect(url.href).toBe('https://example.com/?param1=value1&param2=value2');
    expect(url.search).toBe('?param1=value1&param2=value2');
  });

  it('should parse URLs with fragments', () => {
    const url = parseUrl('https://example.com#section1', 'test URL');
    expect(url.href).toBe('https://example.com/#section1');
    expect(url.hash).toBe('#section1');
  });

  it('should parse URLs with ports', () => {
    const url = parseUrl('https://example.com:8080', 'test URL');
    expect(url.href).toBe('https://example.com:8080/');
    expect(url.port).toBe('8080');
  });

  it('should parse URLs with authentication', () => {
    const url = parseUrl('https://user:pass@example.com', 'test URL');
    expect(url.href).toBe('https://user:pass@example.com/');
    expect(url.username).toBe('user');
    expect(url.password).toBe('pass');
  });

  it('should throw error for relative URLs without base', () => {
    expect(() => parseUrl('/relative/path', 'test URL')).toThrow(
      'Invalid test URL: /relative/path'
    );
  });

  it('should throw error for invalid URLs', () => {
    expect(() => parseUrl('not-a-url', 'test URL')).toThrow(
      'Invalid test URL: not-a-url'
    );
  });

  it('should throw error for empty strings', () => {
    expect(() => parseUrl('', 'test URL')).toThrow('Invalid test URL: ');
  });

  it('should throw error for malformed URLs', () => {
    expect(() => parseUrl('http://', 'test URL')).toThrow(
      'Invalid test URL: http://'
    );
  });

  it('should include custom label in error message', () => {
    expect(() => parseUrl('invalid-url', 'custom label')).toThrow(
      'Invalid custom label: invalid-url'
    );
  });

  it('should include error details in error message', () => {
    expect(() => parseUrl('http://invalid:port:', 'test URL')).toThrow(
      /Invalid test URL: http:\/\/invalid:port:/
    );
  });

  it('should parse URLs with special characters', () => {
    const url = parseUrl(
      'https://example.com/path%20with%20spaces',
      'test URL'
    );
    expect(url.href).toBe('https://example.com/path%20with%20spaces');
  });

  it('should parse URLs with Unicode characters', () => {
    const url = parseUrl('https://example.com/路径', 'test URL');
    expect(url.href).toBe('https://example.com/%E8%B7%AF%E5%BE%84');
  });

  it('should parse localhost URLs', () => {
    const url = parseUrl('http://localhost:3000', 'test URL');
    expect(url.href).toBe('http://localhost:3000/');
    expect(url.hostname).toBe('localhost');
    expect(url.port).toBe('3000');
  });

  it('should parse IP address URLs', () => {
    const url = parseUrl('http://192.168.1.1:8080', 'test URL');
    expect(url.href).toBe('http://192.168.1.1:8080/');
    expect(url.hostname).toBe('192.168.1.1');
    expect(url.port).toBe('8080');
  });
});
