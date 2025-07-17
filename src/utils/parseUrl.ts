import { getErrorMessage } from './getErrorMessage';

/**
 * Parses a given string as a URL and returns a URL object.
 *
 * @param {string} url - The string to be parsed as a URL.
 * @param {string} label - A label to include in the error message if parsing fails.
 * @returns {URL} The parsed URL object.
 * @throws Will throw an error if the string cannot be parsed as a URL.
 */
export const parseUrl = (url: string, label: string): URL => {
  try {
    return new URL(url);
  } catch (error) {
    throw new Error(`Invalid ${label}: ${url} (${getErrorMessage(error)})`);
  }
};
