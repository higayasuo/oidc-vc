/**
 * Concatenates URL path segments and normalizes multiple consecutive slashes to single slashes.
 * Preserves protocol separators (://) while normalizing path slashes.
 *
 * @param paths - Array of path segments to concatenate
 * @returns Normalized URL path with single slashes
 *
 * @example
 * ```typescript
 * concatUrlPaths('api', 'users', '123') // 'api/users/123'
 * concatUrlPaths('api/', '/users/', '/123') // 'api/users/123'
 * concatUrlPaths('api//users///123') // 'api/users/123'
 * concatUrlPaths('https://', 'api.example.com', '/users') // 'https://api.example.com/users'
 * ```
 */
export const concatUrlPaths = (...paths: string[]): string => {
  return paths.join('/').replace(/([^:])\/+/g, '$1/');
};
