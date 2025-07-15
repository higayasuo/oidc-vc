/**
 * Extracts the error message from an unknown error object.
 *
 * @param {unknown} error - The error object which can be of any type.
 * @returns {string} The error message if the error is an instance of Error, otherwise the string representation of the error.
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};