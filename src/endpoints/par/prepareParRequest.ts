import {
  prepareAuthorizationParams,
  type PrepareAuthorizationParamsResult,
  type PrepareAuthorizationParamsParams,
} from '@/utils/prepareAuthorizationParams';
import { RandomBytes } from '@/types';
import { applyAdditionalParams } from '@/utils/applyAdditionalParams';
import { applyClientAuth } from '@/utils/applyClientAuth';

type PrepareParRequestParams = {
  /** The client identifier for OAuth 2.0 */
  clientId: string;
  /** The client secret for OAuth 2.0. If provided, it will be used for Basic authentication */
  clientSecret?: string;
  /** The client assertion used for authentication */
  clientAssertion?: string;
  /** The type of the client assertion */
  clientAssertionType?: string;
  /** Additional parameters to include in the PAR request */
  additionalParams?: Record<string, string>;
} & PrepareAuthorizationParamsParams;

type PrepareParRequestResult = {
  body: URLSearchParams;
  headers: Record<string, string>;
} & Omit<PrepareAuthorizationParamsResult, 'params'>;

export const prepareParRequest = async (
  {
    clientId,
    clientSecret,
    clientAssertion,
    clientAssertionType,
    redirectUri,
    responseType = 'code',
    scope = 'openid',
    additionalParams = {},
  }: PrepareParRequestParams,
  randomBytes: RandomBytes
): Promise<PrepareParRequestResult> => {
  const authorizationParams = prepareAuthorizationParams(
    {
      redirectUri,
      responseType,
      scope,
    },
    randomBytes
  );
  const { params: body, ...rest } = authorizationParams;
  applyAdditionalParams(body, additionalParams);

  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  applyClientAuth(body, headers, {
    clientId,
    clientSecret,
    clientAssertion,
    clientAssertionType,
  });

  return {
    body,
    headers,
    ...rest,
  };
};
