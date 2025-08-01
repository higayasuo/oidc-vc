import { describe, it, expect } from 'vitest';
import { applyAdditionalParams } from '../applyAdditionalParams';

describe('applyAdditionalParams', () => {
  it('should apply no parameters when additionalParams is empty', () => {
    const params = new URLSearchParams();
    const originalParams = params.toString();

    applyAdditionalParams(params, {});

    expect(params.toString()).toBe(originalParams);
  });

  it('should apply a single parameter', () => {
    const params = new URLSearchParams();
    const additionalParams = { key1: 'value1' };

    applyAdditionalParams(params, additionalParams);

    expect(params.get('key1')).toBe('value1');
  });

  it('should apply multiple parameters', () => {
    const params = new URLSearchParams();
    const additionalParams = {
      key1: 'value1',
      key2: 'value2',
      key3: 'value3',
    };

    applyAdditionalParams(params, additionalParams);

    expect(params.get('key1')).toBe('value1');
    expect(params.get('key2')).toBe('value2');
    expect(params.get('key3')).toBe('value3');
  });

  it('should override existing parameters', () => {
    const params = new URLSearchParams();
    params.set('existing', 'oldValue');

    const additionalParams = { existing: 'newValue' };

    applyAdditionalParams(params, additionalParams);

    expect(params.get('existing')).toBe('newValue');
  });

  it('should handle empty string values', () => {
    const params = new URLSearchParams();
    const additionalParams = { emptyKey: '' };

    applyAdditionalParams(params, additionalParams);

    expect(params.get('emptyKey')).toBe('');
  });

  it('should handle special characters in keys and values', () => {
    const params = new URLSearchParams();
    const additionalParams = {
      'key with spaces': 'value with spaces',
      'key-with-dashes': 'value-with-dashes',
      key_with_underscores: 'value_with_underscores',
    };

    applyAdditionalParams(params, additionalParams);

    expect(params.get('key with spaces')).toBe('value with spaces');
    expect(params.get('key-with-dashes')).toBe('value-with-dashes');
    expect(params.get('key_with_underscores')).toBe('value_with_underscores');
  });

  it('should work with URLSearchParams that already have parameters', () => {
    const params = new URLSearchParams('existing1=value1&existing2=value2');
    const additionalParams = { newKey: 'newValue' };

    applyAdditionalParams(params, additionalParams);

    expect(params.get('existing1')).toBe('value1');
    expect(params.get('existing2')).toBe('value2');
    expect(params.get('newKey')).toBe('newValue');
  });

  it('should not modify the additionalParams object', () => {
    const params = new URLSearchParams();
    const additionalParams = { key1: 'value1' };
    const originalAdditionalParams = { ...additionalParams };

    applyAdditionalParams(params, additionalParams);

    expect(additionalParams).toEqual(originalAdditionalParams);
  });
});
