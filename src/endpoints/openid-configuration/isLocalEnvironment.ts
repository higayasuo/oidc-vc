/**
 * Determines if the current environment is local based on the issuer URL and NODE_ENV.
 *
 * This function checks if the issuer URL starts with 'http://localhost:' and
 * if the NODE_ENV environment variable is set to 'test' or 'development'.
 *
 * @param {string} issuer - The issuer URL to check.
 * @returns {boolean} True if the environment is local, false otherwise.
 */
export const isLocalEnvironment = (issuer: string): boolean => {
  if (!issuer || typeof issuer !== 'string') {
    return false;
  }

  const trimmedIssuer = issuer.trim();
  return (
    trimmedIssuer.startsWith('http://localhost:') &&
    (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development')
  );
};
