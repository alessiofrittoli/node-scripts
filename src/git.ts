import { execSync } from 'child_process'
import type { Git } from './types'

/**
 * Retrieves the list of Git remotes and their URLs.
 * 
 * This function executes the `git remote -v` command to get the list of remotes and their URLs.
 * It then parses the output and organizes the remotes into a Map where each remote name maps to another Map containing the remote's name and URLs.
 * The URLs are further categorized by their type (fetch or push).
 * 
 * @returns A Map where each key is a remote name and the value is another Map containing the remote's name and URLs.
 * 
 * @remarks
 * The list of remotes is ordered in alphabetical order.
 */
export const getRemotes = () => {

	const stdOut	= execSync( 'git remote -v', { encoding: 'buffer' } )
	const remotes	= stdOut.toString().split( '\n' )
	const remotesMap = new Map<string, Git.Remote.Map>()

	remotes.map( remote => {
		const [ name, formattedUrl ] = remote.split( '\t' )
		if ( ! name || ! formattedUrl ) return null

		const remoteMap = (
			remotesMap.get( name ) || new Map() as Git.Remote.Map
		)
		const remoteMapUrls = (
			remoteMap.get( 'urls' ) || new Map() as Git.Remote.Urls
		)
		
		
		const parts		= formattedUrl.split( ' ' )
		const parsedType= ( parts.at( 1 )?.replace( /\(|\)/g, '' ) || 'fetch' ) as Git.Remote.Type
		const type		= ! remoteMapUrls.has( parsedType ) ? parsedType : parsedType === 'fetch' ? 'push' : 'fetch'
		const url		= parts.at( 0 )

		if ( ! url ) return null

		remoteMapUrls.set( type, url )

		remoteMap.set( 'name', name )
		remoteMap.set( 'urls', remoteMapUrls )

		if ( ! remotesMap.has( name ) ) {
			remotesMap.set( name, remoteMap )
		}

	} )

	return remotesMap
}


/**
 * Retrieves the default remote and branch of the current Git repository.
 *
 * This function executes a Git command to list all remote branches and filters
 * the output to find the default branch (HEAD). It then parses the result to
 * extract the remote name and branch name.
 *
 * @returns A tuple containing the remote name and branch name as strings.
 *          If the default remote and branch cannot be determined, both values
 *          in the tuple will be `null`.
 */
export const getDefaultRemoteAndBranch = () => (
	execSync( 'git branch -rl \'*/HEAD\'' )
		?.toString()
		.split( '\n' )
		.filter( Boolean ).at( 0 )
		?.split( ' -> ' ).at( 1 )
		?.split( '/' ) || [ null, null ]
) as ( [ string | null, string | null ] )



/**
 * Retrieves the default remote.
 *
 * This function attempts to get the default remote name by first
 * calling `getDefaultRemoteAndBranch` to obtain the remote name. If a
 * remote name is found, it retrieves the corresponding remote from the
 * list of remotes. If no default remote is found, it returns the first
 * remote in the list of remotes.
 *
 * @returns The default remote, or the first remote in the list if no default is found.
 */
export const getDefaultRemote = () => {

	const [ remote ] = getDefaultRemoteAndBranch()
	
	return (
		remote
			? getRemotes().get( remote )
			: getRemotes()
				.entries()
				.next()
				.value?.[ 1 ]
	)

}


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
		.map( formatStash )
		.filter( Boolean ) as Git.Stash[]
)


/**
 * Formats a given stash string into an object containing index, branch, and name.
 *
 * @param stash - The stash string to format.
 * @returns An object containing the index, branch, and name of the stash, or null if the stash is invalid.
 *
 * @example
 * ```ts
 * console.log( formatStash( 'stash@{0}: WIP on main: 1234567 Commit message' ) )
 * // Outputs: { index: 0, branch: 'main', name: '1234567 Commit message' }
 * ```
 *
 * @remarks
 * The function expects the stash string to be in the format "stash@{index}: branch: name".
 * If the stash string is invalid or the index is not a number, the function returns null.
 */
export const formatStash = ( stash: string ) => {
	if ( ! stash ) return null

	const chunks	= stash.split( ': ' )			
	const index		= Number( chunks.at( 0 )!.split( '@{' ).pop()!.split( '}' ).at( 0 ) || 'invalid' )
	if ( isNaN( index ) ) return null

	const branch	= ( ! chunks.at( 2 ) ? null : chunks.at( 1 )!.split( ' ' ).pop() ) || 'main'
	const name		= chunks.at( 2 ) || chunks.at( 1 )?.split( ' ' ).pop() || null
	
	return { index, branch, name } as Git.Stash
}



/**
 * Formats a list of git stashes.
 *
 * @param stashes - An array of strings representing git stashes.
 * @returns An array of formatted git stashes.
 */
export const formatStashList = ( stashes: string[] ) => (
	stashes.map( formatStash )
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