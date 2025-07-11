import { execSync } from 'child_process'
import { getProcessOptions, getProcessRoot } from '../process'
import { getPackageJson, getPreReleaseTag } from '../package'
import { getDefaultRemote, getStashBy, popStashByIndex } from '../git'
import { isPackageInstalled } from '../npm'
import type { Release } from '../types'


/**
 * Executes the release process for a project.
 *
 * This function performs the following steps:
 * 1. Retrieves the project's `package.json` file.
 * 2. Retrieves process options and sets various release parameters.
 * 3. Validates the version and access options.
 * 4. Determines the Git origin for pushing tags.
 * 5. Builds the project, creates a Git tag, pushes the tag, and optionally publishes to npm.
 * 6. Logs the release details if verbose mode is enabled.
 *
 * @throws Will exit the process with code 1 if any critical error occurs during the release process.
 */
export const release = () => {
	
	let project: Record<string, string | Record<string, string>> | null = null

	try {
		project = getPackageJson( getProcessRoot() )
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch ( error ) {
		//
	}

	const options		= getProcessOptions() as Release.OptionsMap
	const verbose		= options.has( '--verbose' )
	const build			= options.get( '--build' ) || 'build'
	const version		= options.get( '--version' ) || project?.version
	let origin			= options.get( '--origin' ) || options.get( '--o' )
	const publishToNpm	= options.has( '--npm' )
	const access		= options.get( '--access' ) || 'public'
	const stashName		= 'pre-release'
	
	let run: 'npm run' | 'pnpm' = 'npm run'

	try {
		run = ! isPackageInstalled( 'pnpm', true ) ? 'npm run' : 'pnpm'
	} catch ( err ) {
		const error = err as Error
		console.log( {
			package	: project?.name,
			message	: 'Couldn\'t check if `pnpm` is installed. Using `npm` instead.',
			error	: error.message,
		} )
	}
	

	if ( ! version || typeof version !== 'string' ) {
		console.error( 'No `version` found in `package.json`' )
		process.exit( 1 )
	}

	if ( publishToNpm ) {
		switch ( access ) {
			case 'public':
				break
			case 'restricted':
				break
			default:
				console.error( 'Invalid `--access` option. `public` or `restricted` accepted.' )
				process.exit( 1 )
		}
	}

	if ( ! origin ) {
		const remote = getDefaultRemote()
		origin = remote?.get( 'name' ) || 'origin'
	}

	try {

		const preReleaseTag = getPreReleaseTag( version )

		execSync( `git stash save -u -m "${ stashName }"`, { stdio: 'inherit' } )
		execSync( `${ run } ${ build }`, { stdio: 'inherit' } )
		execSync( `git tag v${ version }`, { stdio: 'inherit' } )
		execSync( `git push ${ origin } tag v${ version }`, { stdio: 'inherit' } )
		
		if ( publishToNpm ) {
			const options = [
				`--access ${ access }`,
				preReleaseTag && `--tag ${ preReleaseTag }`
			].filter( Boolean ).join( ' ' )

			execSync( `npm publish ${ options }`, { stdio: 'inherit' } )
		}

		const stash = getStashBy( { name: stashName } )

		if ( stash ) {
			popStashByIndex( stash.index )
		}

		if ( verbose ) {
			console.log( {
				package		: project?.name,
				message		: `Released version ${ version }`,
				origin		: origin,
				tag			: `v${ version }`,
				npmPublish	: publishToNpm,
			} )
		}
	} catch ( error ) {
		console.error( 'Error during release process:', error )
		process.exit( 1 )
	}

}