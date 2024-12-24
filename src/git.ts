import { execSync } from 'child_process'

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