import { describe, it, expect } from 'vitest';
import { getErrorMessage } from '../errorUtils';

describe('getErrorMessage', () => {
  it('should return the message from an Error instance', () => {
    const error = new Error('Test error message');
    expect(getErrorMessage(error)).toBe('Test error message');
  });

  it('should return the message from a custom Error class', () => {
    class CustomError extends Error {
      constructor(message: string) {
        super(message);
        this.name = 'CustomError';
      }
    }

    const customError = new CustomError('Custom error message');
    expect(getErrorMessage(customError)).toBe('Custom error message');
  });

  it('should return string representation for string errors', () => {
    const stringError = 'String error message';
    expect(getErrorMessage(stringError)).toBe('String error message');
  });

  it('should return string representation for number errors', () => {
    const numberError = 404;
    expect(getErrorMessage(numberError)).toBe('404');
  });

  it('should return string representation for null errors', () => {
    const nullError = null;
    expect(getErrorMessage(nullError)).toBe('null');
  });

  it('should return string representation for undefined errors', () => {
    const undefinedError = undefined;
    expect(getErrorMessage(undefinedError)).toBe('undefined');
  });

  it('should return string representation for object errors', () => {
    const objectError = { code: 500, message: 'Internal server error' };
    expect(getErrorMessage(objectError)).toBe('[object Object]');
  });

  it('should return string representation for array errors', () => {
    const arrayError = ['error1', 'error2'];
    expect(getErrorMessage(arrayError)).toBe('error1,error2');
  });

  it('should return string representation for boolean errors', () => {
    const booleanError = false;
    expect(getErrorMessage(booleanError)).toBe('false');
  });

  it('should handle errors with empty messages', () => {
    const emptyError = new Error('');
    expect(getErrorMessage(emptyError)).toBe('');
  });

  it('should handle errors with special characters', () => {
    const specialError = new Error('Error with special chars: !@#$%^&*()');
    expect(getErrorMessage(specialError)).toBe('Error with special chars: !@#$%^&*()');
  });
});