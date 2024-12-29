import { execSync } from 'child_process'
import type { NodeJS } from './types'

/**
 * Retrieves the list of npm packages in JSON format.
 *
 * @template T - A boolean type that determines whether to fetch global or local packages.
 * @param global - If true, fetches global packages; otherwise, fetches local packages.
 * @returns - The list of npm packages in JSON format.
 */
export const getPackage = <
	T extends true | false = false
>( global?: T ): T extends true ? NodeJS.Deps.Global : NodeJS.Deps.Local => (
	JSON.parse(
		execSync( `npm list --json${ global ? ' -g' : '' }` )
			.toString()
	)
)


/**
 * Checks if a given package is installed.
 *
 * @param name - The name of the package to check.
 * @param global - Optional. If true, checks for the package in the global scope. Defaults to false.
 * @returns A boolean indicating whether the package is installed.
 */
export const isPackageInstalled = ( name: string, global?: boolean ) => (
	name in ( getPackage( global ).dependencies || {} )
)