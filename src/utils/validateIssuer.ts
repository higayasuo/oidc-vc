/**
 * Validates that the received issuer matches the expected issuer.
 * Trailing slashes are removed from both issuers before comparison.
 *
 * @param {Object} params - The parameters for issuer validation.
 * @param {string} params.receivedIssuer - The issuer received in the response.
 * @param {string} params.expectedIssuer - The expected issuer to validate against.
 * @throws Will throw an error if the received issuer does not match the expected issuer.
 */
type ValidateIssuerParams = {
  receivedIssuer: string;
  expectedIssuer: string;
};

export const validateIssuer = ({
  receivedIssuer,
  expectedIssuer,
}: ValidateIssuerParams) => {
  const normalizedReceived = receivedIssuer.replace(/\/+$/, '');
  const normalizedExpected = expectedIssuer.replace(/\/+$/, '');

  if (normalizedReceived !== normalizedExpected) {
    throw new Error(
      `Issuer mismatch: received "${normalizedReceived}" but expected "${normalizedExpected}"`
    );
  }
};
