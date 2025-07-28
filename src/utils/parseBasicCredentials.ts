import { decodeBase64 } from 'u8a-utils';
import { getErrorMessage } from './getErrorMessage';

const decoder = new TextDecoder();

/**
 * Parses Basic credentials from HTTP Authorization header.
 * Decodes Base64 string and extracts userId and password.
 *
 * @param authHeader - The Authorization header value (e.g., "Basic dGVzdHVzZXI6dGVzdHBhc3M=")
 * @returns Object containing userId and password, or {userId: undefined, password: undefined} if invalid format
 */
export const parseBasicCredentials = (
  authHeader: string
): { userId: string | undefined; password: string | undefined } => {
  // Check if it starts with "Basic "
  if (!authHeader.startsWith('Basic ')) {
    return { userId: undefined, password: undefined };
  }

  try {
    // Extract the Base64 part after "Basic "
    const base64Credentials = authHeader.substring(6);

    // Decode Base64 to Uint8Array
    const credentialsBytes = decodeBase64(base64Credentials);

    // Convert to string
    const credentials = decoder.decode(credentialsBytes);

    // Split by first colon (password may contain colons)
    const colonIndex = credentials.indexOf(':');
    if (colonIndex === -1) {
      return { userId: undefined, password: undefined };
    }

    const userId = credentials.substring(0, colonIndex);
    const password = credentials.substring(colonIndex + 1);

    return { userId, password };
  } catch (error) {
    console.error(getErrorMessage(error));
    // Invalid Base64 or other decoding error
    return { userId: undefined, password: undefined };
  }
};
