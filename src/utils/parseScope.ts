/**
 * Parses a scope string into an array of individual scopes.
 *
 * This function trims the input string, replaces multiple spaces with a single space,
 * and splits the string into an array of scopes. Empty strings or strings containing
 * only whitespace return an empty array.
 *
 * @param {string} scope - The scope string to be parsed.
 * @returns {string[]} An array of individual scopes.
 */
export const parseScope = (scope: string): string[] => {
  const trimmed = scope.trim();
  if (trimmed === '') {
    return [];
  }
  return trimmed.replace(/\s+/g, ' ').split(' ');
};
