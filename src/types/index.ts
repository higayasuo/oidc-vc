/**
 * A function type that generates a random sequence of bytes.
 *
 * @param {number} [byteLength] - The optional length of the byte array to generate. Defaults to 32 bytes if not specified.
 * @returns {Uint8Array} A Uint8Array containing the generated random bytes.
 */
export type RandomBytes = (byteLength?: number) => Uint8Array;