import type { Package } from '@/types'

/**
 * Common options for types-reference scripts.
 *
 */
export interface CommonOptions extends Package {
	/**
	 * The `*.d.ts` output file name.
	 *
	 */
	outputFile: string
	/**
	 * An array of scopes references used over package `name`.
	 *
	 * @example
	 * ```ts
	 * const scopes = [ 'my-package/globals' ] // Output: /// <reference types="my-package/globals" />
	 * ```
	 */
	scopes?: string[]
}

export interface AddTypesReferenceOptions extends Pick<CommonOptions, 'scopes'> {
	/**
	 * The project name currently executing the script.
	 *
	 */
	name: string
	/**
	 * The `*.d.ts` output file name. Default: `alessiofrittoli-env.d.ts`.
	 *
	 */
	outputFile?: string
}
