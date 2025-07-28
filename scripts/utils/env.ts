import { config } from 'dotenv';

/**
 * Loads environment variables from .env.test file using dotenv
 */
export const loadEnvTest = (): Record<string, string> => {
  try {
    const result = config({ path: '.env.test' });
    if (result.error) {
      console.warn('⚠️  Warning: Could not load .env.test file:', result.error);
      return {};
    }

    // Return the loaded environment variables
    return result.parsed || {};
  } catch (error) {
    console.warn('⚠️  Warning: Could not read .env.test file:', error);
    return {};
  }
};

/**
 * Gets default value for a parameter, prioritizing .env.test over process.env
 */
export const getDefaultValue = (
  key: string,
  envTest: Record<string, string>
): string => {
  return envTest[key] || process.env[key] || '';
};
