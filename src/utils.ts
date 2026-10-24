/**
 * Removes duplicate values from an array.
 *
 * @param	array The input array.
 * @returns	The filtered array.
 */
export const arrayUnique = <T>(array: T[]): T[] => (array.length <= 0 ? array : [...new Set(array)])
