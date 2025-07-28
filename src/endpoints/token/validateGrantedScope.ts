import { parseScope } from '@/utils/parseScope';

type ValidateGrantedScopeParams = {
  /** The scope string that the client requested */
  requested: string;
  /** The scope string that the client is granted */
  granted: string;
};

/**
 * Validates that the granted scope is a subset of the requested scope.
 *
 * This function parses the scope strings into arrays and validates that all granted scopes
 * are included in the requested scopes. The scope strings are parsed using the same logic
 * as the authorization request generation.
 *
 * @param {ValidateGrantedScopeParams} params - The parameters containing requested and granted scope strings.
 * @param {string} params.requested - The scope string that the client requested.
 * @param {string} params.granted - The scope string that the client is granted.
 */
export const validateGrantedScope = ({
  requested,
  granted,
}: ValidateGrantedScopeParams): void => {
  const requestedScopes = parseScope(requested);
  const grantedScopes = parseScope(granted);

  const invalidScopes = grantedScopes.filter((scope) => {
    return !requestedScopes.includes(scope);
  });

  if (invalidScopes.length > 0) {
    throw new Error(
      `Granted scope contains scopes not in requested scope: ${invalidScopes.join(
        ', '
      )}`
    );
  }
};
