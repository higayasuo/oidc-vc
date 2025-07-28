import { describe, it, expect } from 'vitest';
import { validateGrantedScope } from '../validateGrantedScope';

describe('validateGrantedScopes', () => {
  it('should not throw error when granted scopes are subset of requested scopes', () => {
    const requested = 'openid email profile address';
    const granted = 'openid email';

    expect(() => {
      validateGrantedScope({ requested, granted });
    }).not.toThrow();
  });

  it('should not throw error when granted scopes equal requested scopes', () => {
    const requested = 'openid email profile';
    const granted = 'openid email profile';

    expect(() => {
      validateGrantedScope({ requested, granted });
    }).not.toThrow();
  });

  it('should not throw error when granted scopes is empty', () => {
    const requested = 'openid email profile';
    const granted = '';

    expect(() => {
      validateGrantedScope({ requested, granted });
    }).not.toThrow();
  });

  it('should not throw error when both requested and granted scopes are empty', () => {
    const requested = '';
    const granted = '';

    expect(() => {
      validateGrantedScope({ requested, granted });
    }).not.toThrow();
  });

  it('should throw error when granted scopes contain scope not in requested', () => {
    const requested = 'openid email';
    const granted = 'openid email profile';

    expect(() => {
      validateGrantedScope({ requested, granted });
    }).toThrow('Granted scope contains scopes not in requested scope: profile');
  });

  it('should throw error when granted scopes contain multiple scopes not in requested', () => {
    const requested = 'openid';
    const granted = 'openid email profile address';

    expect(() => {
      validateGrantedScope({ requested, granted });
    }).toThrow(
      'Granted scope contains scopes not in requested scope: email, profile, address'
    );
  });

  it('should throw error when granted scopes are completely different from requested', () => {
    const requested = 'openid email';
    const granted = 'profile address';

    expect(() => {
      validateGrantedScope({ requested, granted });
    }).toThrow(
      'Granted scope contains scopes not in requested scope: profile, address'
    );
  });

  it('should throw error when requested scopes is empty but granted scopes is not', () => {
    const requested = '';
    const granted = 'openid email';

    expect(() => {
      validateGrantedScope({ requested, granted });
    }).toThrow(
      'Granted scope contains scopes not in requested scope: openid, email'
    );
  });

  it('should handle scopes with special characters when valid', () => {
    const requested = 'openid custom:scope api:read';
    const granted = 'openid custom:scope';

    expect(() => {
      validateGrantedScope({ requested, granted });
    }).not.toThrow();
  });

  it('should throw error when granted scopes contain unauthorized scope with special characters', () => {
    const requested = 'openid custom:scope';
    const granted = 'openid custom:scope api:write';

    expect(() => {
      validateGrantedScope({ requested, granted });
    }).toThrow(
      'Granted scope contains scopes not in requested scope: api:write'
    );
  });

  it('should handle scopes with dots and dashes when valid', () => {
    const requested = 'openid api.read api-write';
    const granted = 'openid api.read';

    expect(() => {
      validateGrantedScope({ requested, granted });
    }).not.toThrow();
  });

  it('should handle scopes with underscores and numbers when valid', () => {
    const requested = 'openid api_v1 user_123';
    const granted = 'openid api_v1';

    expect(() => {
      validateGrantedScope({ requested, granted });
    }).not.toThrow();
  });

  it('should handle scopes with mixed case when valid', () => {
    const requested = 'OpenID Email Profile';
    const granted = 'OpenID Email';

    expect(() => {
      validateGrantedScope({ requested, granted });
    }).not.toThrow();
  });

  it('should throw error when case does not match', () => {
    const requested = 'openid email';
    const granted = 'openid Email'; // different case

    expect(() => {
      validateGrantedScope({ requested, granted });
    }).toThrow('Granted scope contains scopes not in requested scope: Email');
  });

  it('should handle scopes with unicode characters when valid', () => {
    const requested = 'openid 日本語:read 中文:write';
    const granted = 'openid 日本語:read';

    expect(() => {
      validateGrantedScope({ requested, granted });
    }).not.toThrow();
  });

  it('should handle scopes with emoji characters when valid', () => {
    const requested = 'openid 🔐:read 📧:write';
    const granted = 'openid 🔐:read';

    expect(() => {
      validateGrantedScope({ requested, granted });
    }).not.toThrow();
  });

  it('should handle very long scope names when valid', () => {
    const requested = 'openid very_long_scope_name_with_many_characters';
    const granted = 'openid';

    expect(() => {
      validateGrantedScope({ requested, granted });
    }).not.toThrow();
  });

  it('should handle numbers only scopes when valid', () => {
    const requested = '123 456 789';
    const granted = '123 456';

    expect(() => {
      validateGrantedScope({ requested, granted });
    }).not.toThrow();
  });

  it('should handle symbols in scopes when valid', () => {
    const requested = 'openid api+read api-write api*write';
    const granted = 'openid api+read';

    expect(() => {
      validateGrantedScope({ requested, granted });
    }).not.toThrow();
  });

  it('should handle duplicate scopes in granted string', () => {
    const requested = 'openid email profile';
    const granted = 'openid email email'; // duplicate

    expect(() => {
      validateGrantedScope({ requested, granted });
    }).not.toThrow();
  });

  it('should handle duplicate scopes in requested string', () => {
    const requested = 'openid email email'; // duplicate
    const granted = 'openid email';

    expect(() => {
      validateGrantedScope({ requested, granted });
    }).not.toThrow();
  });

  it('should handle whitespace normalization correctly', () => {
    const requested = 'openid email profile';
    const granted = 'openid  email '; // with extra whitespace

    expect(() => {
      validateGrantedScope({ requested, granted });
    }).not.toThrow();
  });

  it('should handle single scope scenarios when valid', () => {
    const requested = 'openid';
    const granted = 'openid';

    expect(() => {
      validateGrantedScope({ requested, granted });
    }).not.toThrow();
  });

  it('should handle single scope when granted is empty', () => {
    const requested = 'openid';
    const granted = '';

    expect(() => {
      validateGrantedScope({ requested, granted });
    }).not.toThrow();
  });

  it('should throw error when single scope granted contains unauthorized scope', () => {
    const requested = 'openid';
    const granted = 'openid email';

    expect(() => {
      validateGrantedScope({ requested, granted });
    }).toThrow('Granted scope contains scopes not in requested scope: email');
  });

  it('should handle large scope strings efficiently when valid', () => {
    const requested = Array.from({ length: 1000 }, (_, i) => `scope_${i}`).join(
      ' '
    );
    const granted = Array.from({ length: 500 }, (_, i) => `scope_${i}`).join(
      ' '
    ); // first 500 scopes

    expect(() => {
      validateGrantedScope({ requested, granted });
    }).not.toThrow();
  });

  it('should throw error with large scope strings containing unauthorized scopes', () => {
    const requested = Array.from({ length: 1000 }, (_, i) => `scope_${i}`).join(
      ' '
    );
    const granted = [
      ...Array.from({ length: 500 }, (_, i) => `scope_${i}`),
      'unauthorized_scope',
    ].join(' ');

    expect(() => {
      validateGrantedScope({ requested, granted });
    }).toThrow(
      'Granted scope contains scopes not in requested scope: unauthorized_scope'
    );
  });

  it('should throw error with specific error message format', () => {
    const requested = 'openid';
    const granted = 'openid unauthorized';

    try {
      validateGrantedScope({ requested, granted });
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe(
        'Granted scope contains scopes not in requested scope: unauthorized'
      );
    }
  });

  it('should handle OAuth standard scopes when valid', () => {
    const requested = 'openid email profile address phone';
    const granted = 'openid email profile';

    expect(() => {
      validateGrantedScope({ requested, granted });
    }).not.toThrow();
  });

  it('should throw error when OAuth standard scopes contain unauthorized scope', () => {
    const requested = 'openid email';
    const granted = 'openid email profile address';

    expect(() => {
      validateGrantedScope({ requested, granted });
    }).toThrow(
      'Granted scope contains scopes not in requested scope: profile, address'
    );
  });

  it('should handle custom application scopes when valid', () => {
    const requested = 'openid api:read api:write admin:manage';
    const granted = 'openid api:read';

    expect(() => {
      validateGrantedScope({ requested, granted });
    }).not.toThrow();
  });

  it('should throw error when custom application scopes contain unauthorized scope', () => {
    const requested = 'openid api:read';
    const granted = 'openid api:read api:write admin:manage';

    expect(() => {
      validateGrantedScope({ requested, granted });
    }).toThrow(
      'Granted scope contains scopes not in requested scope: api:write, admin:manage'
    );
  });

  it('should handle scope strings with multiple spaces', () => {
    const requested = 'openid  email   profile';
    const granted = 'openid email';

    expect(() => {
      validateGrantedScope({ requested, granted });
    }).not.toThrow();
  });

  it('should handle scope strings with leading and trailing spaces', () => {
    const requested = '  openid email profile  ';
    const granted = 'openid email';

    expect(() => {
      validateGrantedScope({ requested, granted });
    }).not.toThrow();
  });

  it('should handle scope strings with tabs and newlines', () => {
    const requested = 'openid\temail\nprofile';
    const granted = 'openid email';

    expect(() => {
      validateGrantedScope({ requested, granted });
    }).not.toThrow();
  });

  it('should handle scope strings with only whitespace', () => {
    const requested = '   ';
    const granted = '';

    expect(() => {
      validateGrantedScope({ requested, granted });
    }).not.toThrow();
  });
});
