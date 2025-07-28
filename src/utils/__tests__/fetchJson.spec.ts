import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  afterAll,
} from 'vitest';
import { z } from 'zod';
import { fetchJson } from '../fetchJson';

// Store original fetch
const originalFetch = global.fetch;

// Mock fetch globally
global.fetch = vi.fn();

describe('fetchJson', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  afterAll(() => {
    // Restore original fetch
    global.fetch = originalFetch;
  });

  it('should successfully fetch and validate JSON data', async () => {
    const mockData = { name: 'test', value: 123 };
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue(mockData),
    };
    (global.fetch as any).mockResolvedValue(mockResponse);

    const schema = z.object({
      name: z.string(),
      value: z.number(),
    });

    const result = await fetchJson({
      url: 'https://example.com/api/data',
      schema,
    });

    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith('https://example.com/api/data', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
  });

  it('should throw error for HTTP error status', async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: vi.fn().mockResolvedValue('Error response body'),
    };
    (global.fetch as any).mockResolvedValue(mockResponse);

    const schema = z.object({});

    await expect(
      fetchJson({
        url: 'https://example.com/api/data',
        schema,
      })
    ).rejects.toThrow(
      'Failed to fetch from https://example.com/api/data: HTTP 404 Not Found'
    );
  });

  it('should throw error for network errors', async () => {
    const networkError = new TypeError('NetworkError: Failed to fetch');
    (global.fetch as any).mockRejectedValue(networkError);

    const schema = z.object({});

    await expect(
      fetchJson({
        url: 'https://example.com/api/data',
        schema,
      })
    ).rejects.toThrow(
      'Failed to fetch from https://example.com/api/data: NetworkError: Failed to fetch'
    );
  });

  it('should throw error for JSON parse errors', async () => {
    const mockResponse = {
      ok: true,
      json: vi
        .fn()
        .mockRejectedValue(new SyntaxError('Unexpected token < in JSON')),
    };
    (global.fetch as any).mockResolvedValue(mockResponse);

    const schema = z.object({});

    await expect(
      fetchJson({
        url: 'https://example.com/api/data',
        schema,
      })
    ).rejects.toThrow(
      'Failed to fetch from https://example.com/api/data: Unexpected token < in JSON'
    );
  });

  it('should throw error for schema validation failures', async () => {
    const mockData = { name: 'test' }; // Missing required 'value' field
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue(mockData),
    };
    (global.fetch as any).mockResolvedValue(mockResponse);

    const schema = z.object({
      name: z.string(),
      value: z.number(), // Required field
    });

    await expect(
      fetchJson({
        url: 'https://example.com/api/data',
        schema,
      })
    ).rejects.toThrow(
      /Failed to fetch from https:\/\/example\.com\/api\/data:.*/
    );
  });

  it('should handle string errors', async () => {
    const stringError = 'Custom error message';
    (global.fetch as any).mockRejectedValue(stringError);

    const schema = z.object({});

    await expect(
      fetchJson({
        url: 'https://example.com/api/data',
        schema,
      })
    ).rejects.toThrow(
      'Failed to fetch from https://example.com/api/data: Custom error message'
    );
  });

  it('should handle null errors', async () => {
    (global.fetch as any).mockRejectedValue(null);

    const schema = z.object({});

    await expect(
      fetchJson({
        url: 'https://example.com/api/data',
        schema,
      })
    ).rejects.toThrow(
      'Failed to fetch from https://example.com/api/data: null'
    );
  });

  it('should handle undefined errors', async () => {
    (global.fetch as any).mockRejectedValue(undefined);

    const schema = z.object({});

    await expect(
      fetchJson({
        url: 'https://example.com/api/data',
        schema,
      })
    ).rejects.toThrow(
      'Failed to fetch from https://example.com/api/data: undefined'
    );
  });

  it('should support POST requests with custom headers and body', async () => {
    const mockData = { success: true };
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue(mockData),
    };
    (global.fetch as any).mockResolvedValue(mockResponse);

    const schema = z.object({ success: z.boolean() });

    await fetchJson({
      url: 'https://example.com/api/data',
      schema,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: 'data' }),
    });

    expect(global.fetch).toHaveBeenCalledWith('https://example.com/api/data', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: 'data' }),
    });
  });

  it('should throw error for non-JSON Accept header', async () => {
    const schema = z.object({});

    await expect(
      fetchJson({
        url: 'https://example.com/api/data',
        schema,
        headers: { Accept: 'application/xml' },
      })
    ).rejects.toThrow(
      'fetchJson expects JSON responses, but Accept header specifies: application/xml'
    );
  });

  it('should allow Accept header that includes application/json', async () => {
    const mockData = { test: true };
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue(mockData),
    };
    (global.fetch as any).mockResolvedValue(mockResponse);

    const schema = z.object({ test: z.boolean() });

    await fetchJson({
      url: 'https://example.com/api/data',
      schema,
      headers: { Accept: 'application/json, text/plain' },
    });

    expect(global.fetch).toHaveBeenCalledWith('https://example.com/api/data', {
      method: 'GET',
      headers: {
        Accept: 'application/json, text/plain',
      },
    });
  });
});
