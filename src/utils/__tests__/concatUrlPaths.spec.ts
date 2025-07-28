import { describe, it, expect } from 'vitest';
import { concatUrlPaths } from '../concatUrlPaths';

describe('concatUrlPaths', () => {
  it('should concatenate path segments with single slashes', () => {
    const result = concatUrlPaths('api', 'users', '123');
    expect(result).toBe('api/users/123');
  });

  it('should normalize multiple consecutive slashes to single slashes', () => {
    const result = concatUrlPaths('api//users///123');
    expect(result).toBe('api/users/123');
  });

  it('should handle paths with leading and trailing slashes', () => {
    const result = concatUrlPaths('api/', '/users/', '/123');
    expect(result).toBe('api/users/123');
  });

  it('should preserve protocol separators (://)', () => {
    const result = concatUrlPaths('https://', 'api.example.com', '/users');
    expect(result).toBe('https://api.example.com/users');
  });

  it('should handle multiple protocols correctly', () => {
    const result = concatUrlPaths(
      'https://',
      'api.example.com',
      'http://',
      'other.com'
    );
    expect(result).toBe('https://api.example.com/http://other.com');
  });

  it('should normalize path slashes while preserving protocol separators', () => {
    const result = concatUrlPaths('https://', 'api.example.com//users///123');
    expect(result).toBe('https://api.example.com/users/123');
  });

  it('should handle empty strings', () => {
    const result = concatUrlPaths('api', '', 'users', '', '123');
    expect(result).toBe('api/users/123');
  });

  it('should handle single path segment', () => {
    const result = concatUrlPaths('api');
    expect(result).toBe('api');
  });

  it('should handle no arguments', () => {
    const result = concatUrlPaths();
    expect(result).toBe('');
  });

  it('should handle paths with mixed slashes and protocols', () => {
    const result = concatUrlPaths(
      'https://',
      'api.example.com//users',
      'http://',
      'other.com///data'
    );
    expect(result).toBe('https://api.example.com/users/http://other.com/data');
  });

  it('should handle file protocol', () => {
    const result = concatUrlPaths('file://', 'path//to///file');
    expect(result).toBe('file://path/to/file');
  });

  it('should handle ftp protocol', () => {
    const result = concatUrlPaths('ftp://', 'server.com//files///documents');
    expect(result).toBe('ftp://server.com/files/documents');
  });
});
