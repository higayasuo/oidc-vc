/**
 * Applies additional parameters to the given URLSearchParams object.
 *
 * This function iterates over the provided additional parameters and sets each
 * key-value pair into the URLSearchParams object.
 *
 * @param {URLSearchParams} params - The URLSearchParams object to modify.
 * @param {Record<string, string>} [additionalParams={}] - An object containing additional parameters to apply.
 * @returns {void} This function does not return a value; it modifies the params object directly.
 */
export const applyAdditionalParams = (
  params: URLSearchParams,
  additionalParams: Record<string, string> = {}
): void => {
  Object.entries(additionalParams).forEach(([key, value]) => {
    params.set(key, value);
  });
};
