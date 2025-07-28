import { createInterface } from 'node:readline';

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
