import { execSync } from 'child_process'
import { Git } from './types'

/**
 * Retrieves the list of Git remotes for the current repository.
 *
 * @returns {Map<string, string>} A map where the keys are the remote names and the values are the remote URLs.
 *
 * @throws {Error} If the `git remote -v` command fails.
 *
 * @example
 * ```typescript
 * const remotes = getRemotes();
 * console.log(remotes);
 * // Map { 'origin' => 'https://github.com/user/repo.git' }
 * ```
 */
export const getRemotes = () => {

	const stdOut	= execSync( 'git remote -v', { encoding: 'buffer' } )
	const remotes	= stdOut.toString().split( '\n' )

	return new Map<string, string>(
		remotes.map( remote => {
			const [ name, url ] = remote.split( '\t' )
			if ( ! name || ! url ) return null
			return [ name, url ]
		} )
		.filter( Boolean ) as [ string, string ][]
	)
}


/**
 * Retrieves the default push remote URL from the list of git remotes.
 *
 * @returns An array containing the default push remote name and URL if found, otherwise an empty array.
 */
export const getDefaltPushRemote = () => (
	[ ...getRemotes().entries() ]
		.find( ( [, url ] ) => url.endsWith( '(push)' ) ) || []
)


/**
 * Retrieves the list of stashes from the git repository.
 *
 * This function executes the `git stash list` command and parses the output
 * to return an array of stash objects. Each stash object contains the index,
 * branch, and name of the stash.
 *
 * @returns An array of stash objects.
 *
 * @example
 * ```ts
 * console.log( getStashList() )
 * // Output:
 * // [
 * //   { index: 0, branch: 'main', name: 'WIP on main: 1234567' },
 * //   { index: 1, branch: 'feature-branch', name: 'WIP on feature-branch: 89abcdef' },
 * //   ...
 * // ]
 * ```
 */
export const getStashList = () => (
	execSync( 'git stash list' )
		.toString()
		.split( '\n' )
		.map( entry => {
			if ( ! entry ) return null

			const chunks	= entry.split( ': ' )
			const index		= Number( chunks.at( 0 )?.split( '@{' ).pop()?.split( '}' )[ 0 ] )
			if ( isNaN( index ) ) return null

			const branch	= chunks.at( 1 )?.split( ' ' ).pop() || 'main'
			const name		= chunks.at( 2 ) || null

			const stash: Git.Stash = {
				index,
				branch,
				name,
			}
			
			return stash
		} )
		.filter( Boolean ) as Git.Stash[]
)


/**
 * Retrieves a stash entry based on the provided options.
 *
 * @param options - The options to filter the stash entries.
 * @returns The stash entry that matches the provided options, or undefined if no match is found.
 *
 * @example
 * ```ts
 * const stash = getStashBy( { name: 'WIP on feature-branch: 89abcdef' } )
 * if ( stash ) {
 *   console.log( `Found stash: ${ stash.name }` )
 * } else {
 *   console.log( 'No matching stash found.' )
 * }
 * ```
 */
export const getStashBy = ( options: Git.GetStashByOptions ) => (
	getStashList()
		.find( stash => (
			'name' in options ?
				stash.name === options.name
				: stash.index === options.index
		) )
)