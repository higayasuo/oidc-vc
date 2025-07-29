import { createInterface } from 'node:readline';
import { getDefaultValue } from './env';

// Create readline interface
export const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to prompt for input
export const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

/**
 * Prompts for user input with a default value
 */
export const promptWithDefault = async (
  prompt: string,
  defaultValue: string = ''
): Promise<string> => {
  const input = await question(
    `${prompt}${defaultValue ? ` (default: ${defaultValue})` : ''}: `
  );
  return input || defaultValue;
};

/**
 * Prompts for additional parameters
 */
export const promptForAdditionalParams = async (): Promise<
  Record<string, string>
> => {
  const additionalParams: Record<string, string> = {};
  const addMore = await question(
    '\nAdd additional parameters? (y/n, default: n): '
  );

  if (addMore.toLowerCase() === 'y') {
    while (true) {
      const paramName = await question(
        'Parameter name (or press Enter to finish): '
      );
      if (!paramName) break;

      const paramValue = await question(`Value for ${paramName}: `);
      additionalParams[paramName] = paramValue;
    }
  }

  return additionalParams;
};

/**
 * Collects authorization parameters from user input
 */
export const collectAuthorizationParams = async (
  envTest: Record<string, string>
) => {
  // Step 1: Get issuer URL
  const defaultIssuer = getDefaultValue('TEST_ISSUER', envTest);
  const issuer = await promptWithDefault('Issuer URL', defaultIssuer);

  if (!issuer) {
    throw new Error('Issuer URL is required');
  }

  // Step 2: Get client configuration
  const defaultClientId = getDefaultValue('CLIENT_ID', envTest);
  const clientId = await promptWithDefault('Client ID', defaultClientId);

  const defaultRedirectUri = getDefaultValue('REDIRECT_URI', envTest);
  const redirectUri = await promptWithDefault(
    'Redirect URI',
    defaultRedirectUri
  );

  const scope = await promptWithDefault('Scope', 'openid');
  const responseType = await promptWithDefault('Response Type', 'code');

  console.log(
    '\nℹ️  PKCE and state parameters are automatically generated (OAuth 2.1 compliance)'
  );

  const additionalParams = await promptForAdditionalParams();

  return {
    issuer,
    clientId,
    redirectUri,
    scope,
    responseType,
    additionalParams,
  };
};
