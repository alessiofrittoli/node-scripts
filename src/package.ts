import fs from 'fs'
import path from 'path'
import type { Package } from './types'

/**
 * Reads and parses the `package.json` file from the specified root directory.
 *
 * @param root - The root directory where the `package.json` file is located.
 * @returns The parsed contents of the `package.json` file as an object.
 * @throws Will throw an error if the file cannot be read or parsed.
 */
export const getPackageJson = ( root: Package[ 'root' ] ) => (
	JSON.parse(
		fs.readFileSync( path.resolve( root, 'package.json' ) ).toString()
	)
)


/**
 * Determines if the script is running in an external project.
 *
 * @param project - The options object excluding the 'outputFile' property.
 * @returns A boolean indicating whether the script is running in an external project.
 * @throws Will throw an error if `INIT_CWD` is not set or if the script cannot determine the project status.
 */
export const isExternalPackage = ( { root, name }: Package ) => {

	try {
		const project = getPackageJson( root )
		if ( project.name.endsWith( name ) ) {
			return false
		}
		return true
	} catch ( cause ) {
		throw new Error( 'Couldn\'t check if script is running in an external project.', { cause } )
	}
}


/**
 * Get package pre-release tag.
 * 
 * @param version The package version.
 * @returns The pre-release tag.
 */
export const getPreReleaseTag = ( version: string ): string | null => {
	const match = version.match( /-(\w+)\.\d+/ )
	return match ? match[ 1 ]! : null
}