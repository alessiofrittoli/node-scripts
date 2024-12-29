import { execSync } from 'child_process'
import { getProcessOptions, getProcessRoot } from '../process'
import { getPackageJson } from '../package'
import { getDefaltRemote, getStashBy } from '../git'
import { isPackageInstalled } from '../npm'
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
		const remote = getDefaltRemote()
		origin = remote?.get( 'name' ) || 'origin'
	}

	try {
		execSync( `git stash save -u -m "${ stashName }"`, { stdio: 'inherit' } )
		execSync( `${ run } build`, { stdio: 'inherit' } )
		execSync( `git tag v${ version }`, { stdio: 'inherit' } )
		execSync( `git push ${ origin } tag v${ version }`, { stdio: 'inherit' } )
		if ( publishToNpm ) {
			execSync( `npm publish --access ${ access }`, { stdio: 'inherit' } )
		}

		const stash = getStashBy( { name: stashName } )
		if ( stash ) {
			execSync( `git stash pop --index ${ stash.index }`, { stdio: 'inherit' } )
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