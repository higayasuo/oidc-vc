import { encodeBase64 } from 'u8a-utils';

const encoder = new TextEncoder();

/**
 * Builds Basic credentials for HTTP Authorization header.
 * Encodes userId:password in Base64 format using u8a-utils.
 *
 * @param userId - The user identifier
 * @param password - The user password
 * @returns Base64 encoded string in format "Basic <base64(userId:password)>"
 */
export const buildBasicCredentials = (
  userId: string,
  password: string = ''
): string => {
  const credentials = `${userId}:${password}`;
  const credentialsBytes = encoder.encode(credentials);
  const encodedCredentials = encodeBase64(credentialsBytes);
  return `Basic ${encodedCredentials}`;
};
