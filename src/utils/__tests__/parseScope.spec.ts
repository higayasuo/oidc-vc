import { describe, it, expect } from 'vitest';
import { parseScope } from '../parseScope';

describe('parseScope', () => {
  it('should parse single scope correctly', () => {
    const result = parseScope('openid');
    expect(result).toEqual(['openid']);
  });

  it('should parse multiple scopes correctly', () => {
    const result = parseScope('openid email profile');
    expect(result).toEqual(['openid', 'email', 'profile']);
  });

  it('should handle scopes with special characters', () => {
    const result = parseScope('openid custom:scope api:read');
    expect(result).toEqual(['openid', 'custom:scope', 'api:read']);
  });

  it('should handle empty scope string', () => {
    const result = parseScope('');
    expect(result).toEqual([]);
  });

  it('should handle scope with only whitespace', () => {
    const result = parseScope('   ');
    expect(result).toEqual([]);
  });

  it('should handle scope with multiple spaces between scopes', () => {
    const result = parseScope('openid  email   profile');
    expect(result).toEqual(['openid', 'email', 'profile']);
  });

  it('should handle scope with leading and trailing spaces', () => {
    const result = parseScope('  openid email profile  ');
    expect(result).toEqual(['openid', 'email', 'profile']);
  });

  it('should handle scope with tabs and newlines', () => {
    const result = parseScope('openid\temail\nprofile');
    expect(result).toEqual(['openid', 'email', 'profile']);
  });

  it('should handle scope with mixed whitespace characters', () => {
    const result = parseScope('openid\t email \n profile');
    expect(result).toEqual(['openid', 'email', 'profile']);
  });

  it('should handle scope with single spaces', () => {
    const result = parseScope('openid email profile');
    expect(result).toEqual(['openid', 'email', 'profile']);
  });

  it('should handle scope with no spaces (single scope)', () => {
    const result = parseScope('openid');
    expect(result).toEqual(['openid']);
  });

  it('should handle scope with empty strings between spaces', () => {
    const result = parseScope('openid   email');
    expect(result).toEqual(['openid', 'email']);
  });

  it('should handle scope with special OAuth scopes', () => {
    const result = parseScope('openid email profile address phone');
    expect(result).toEqual(['openid', 'email', 'profile', 'address', 'phone']);
  });

  it('should handle scope with custom application scopes', () => {
    const result = parseScope('openid api:read api:write admin:manage');
    expect(result).toEqual(['openid', 'api:read', 'api:write', 'admin:manage']);
  });

  it('should handle scope with numbers and special characters', () => {
    const result = parseScope('openid api_v1:read user_123:write');
    expect(result).toEqual(['openid', 'api_v1:read', 'user_123:write']);
  });

  it('should handle scope with dots and dashes', () => {
    const result = parseScope('openid api.read api-write user.profile');
    expect(result).toEqual(['openid', 'api.read', 'api-write', 'user.profile']);
  });

  it('should handle scope with unicode characters', () => {
    const result = parseScope('openid 日本語:read 中文:write');
    expect(result).toEqual(['openid', '日本語:read', '中文:write']);
  });

  it('should handle scope with emoji characters', () => {
    const result = parseScope('openid 🔐:read 📧:write');
    expect(result).toEqual(['openid', '🔐:read', '📧:write']);
  });

  it('should handle scope with very long scope names', () => {
    const result = parseScope(
      'openid very_long_scope_name_with_many_characters'
    );
    expect(result).toEqual([
      'openid',
      'very_long_scope_name_with_many_characters',
    ]);
  });

  it('should handle scope with mixed case', () => {
    const result = parseScope('OpenID Email Profile Address');
    expect(result).toEqual(['OpenID', 'Email', 'Profile', 'Address']);
  });

  it('should handle scope with numbers only', () => {
    const result = parseScope('123 456 789');
    expect(result).toEqual(['123', '456', '789']);
  });

  it('should handle scope with symbols', () => {
    const result = parseScope('openid api+read api-write api*write');
    expect(result).toEqual(['openid', 'api+read', 'api-write', 'api*write']);
  });
});
