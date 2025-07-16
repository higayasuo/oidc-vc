import { getErrorMessage } from './errorUtils';

export const parseUrl = (url: string, label: string): URL => {
  try {
    return new URL(url);
  } catch (error) {
    throw new Error(`Invalid ${label}: ${url} (${getErrorMessage(error)})`);
  }
};
