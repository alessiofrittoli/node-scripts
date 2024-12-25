import { execSync } from 'child_process'
import { getProcessOptions, getProcessRoot } from '../process'
import { getPackageJson } from '../package'
import { getDefaltPushRemote } from '../git'
import type { Publish } from '../types'


/**
 * Executes the publish process for a project.
 *
 * This function performs the following steps:
 * 1. Retrieves the project's `package.json` file.
 * 2. Retrieves process options and sets various publish parameters.
 * 3. Validates the version and access options.
 * 4. Determines the Git origin for pushing tags.
 * 5. Builds the project, creates a Git tag, pushes the tag, and optionally publishes to npm.
 * 6. Logs the publish details if verbose mode is enabled.
 *
 * @throws Will exit the process with code 1 if any critical error occurs during the publish process.
 */
export const publish = () => {
	
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let project: Record<string, any> | null = null

	try {
		project = getPackageJson( getProcessRoot() )
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (error) {
		//
	}

	const options		= getProcessOptions() as Publish.OptionsMap
	const verbose		= options.has( '--verbose' )
	const version		= options.get( '--version' ) || project?.version
	let origin			= options.get( '--origin' ) || options.get( '--o' )
	const publishToNpm	= options.has( '--npm' )
	const access		= options.get( '--access' ) || 'public'

	if ( ! version ) {
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
		try {
			const [ name ] = getDefaltPushRemote()
			origin = name
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch ( error ) {
			//
		}
		origin ||= 'origin'
	}

	try {
		execSync( 'git stash save -u -m "pre-release"', { stdio: 'inherit' } )
		execSync( 'pnpm build', { stdio: 'inherit' } )
		execSync( `git tag v${ version }`, { stdio: 'inherit' } )
		execSync( `git push ${ origin } tag v${ version }`, { stdio: 'inherit' } )
		if ( publishToNpm ) {
			execSync( `pnpm publish --access ${ access }`, { stdio: 'inherit' } )
		}

		try {
			execSync( 'git stash pop', { stdio: 'inherit' } )
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch ( err ) {
			// .. do nothing (No stash entries found.)
		}

		if ( verbose ) {
			console.log( {
				package		: project?.name,
				message		: `Released version ${ version }`,
				tag			: `v${ version }`,
				npmPublish	: publishToNpm,
			} )
		}
	} catch ( error ) {
		console.error( 'Error during release process:', error )
		process.exit( 1 )
	}

}