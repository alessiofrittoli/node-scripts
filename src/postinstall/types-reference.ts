import fs from 'fs'
import path from 'path'

import { getProcessRoot } from '@/process'
import { isExternalPackage } from '@/package'
import type { AddTypesReferenceOptions } from './types'
import type { Package } from '@/types'

/**
 * Common options for types-reference scripts.
 *
 */
interface CommonOptions extends Package
{
	/** The output file name. */
	outputFile: string
}


/**
 * Creates or updates a reference file with type definitions for a project.
 *
 * @param options - Common options for the reference file creation.
 * @param options.root - The root directory of the project.
 * @param options.name - The name of the project.
 * @param options.outputFile - The name of the output file to create or update.
 * @returns `void` if the operation was successful.
 * @throws Throws an Error if there is an issue creating or updating the file.
 */
export const createReferenceFile = ( options: CommonOptions ) => {

	const { root }			= options
	const { name }			= options
	const { outputFile }	= options
	const data				= `/// <reference types="${ name }" />\n`
	const comment			= '// NOTE: This file should not be edited'

	const referencesFilePath = path.resolve( root, outputFile )

	if ( fs.existsSync( referencesFilePath ) ) {
		const file	= fs.readFileSync( referencesFilePath )
		const lines	= file.toString().split( '\n' )

		if ( lines.includes( data.replace( /\n/g, '' ) ) ) {
			console.log( { package: name, message: `The "${ outputFile }" file already exists and it includes the needed type references.` } )
			return
		}

		const output = Buffer.concat( [ Buffer.from( data ), file ] )
	
		try {
			fs.writeFileSync( referencesFilePath, output )
			console.log( { package: name, message: `The "${ outputFile }" file already exists and it has been edited with new type references.` } )
			return
		} catch ( cause ) {
			throw new Error( `An error occured while editing "${ outputFile }" in your project. Some global types may not work as expected.`, { cause } )
		}

	}

	const output = [ data, comment ].join( '\n' )

	try {
		fs.writeFileSync( referencesFilePath, Buffer.from( output ) )
		console.log( { package: name, message: `"${ outputFile }" has been created at the root of your project.` } )
		return true
	} catch ( cause ) {
		throw new Error( `An error occurred while creating "${ outputFile }" at the root of your project. Some global types may not work as expected.`, { cause } )
	}

}


/**
 * Updates the `tsconfig.json` file by adding the specified output file to the `include` array.
 *
 * @param options - The options for updating the `tsconfig.json` file.
 * @param options.root - The root directory of the project.
 * @param options.name - The name of the project.
 * @param options.outputFile - The file to be added to the `include` array in the `tsconfig.json`.
 *
 * @throws Throws an Error if the `tsconfig.json` file cannot be read or updated.
 */
export const updateTsConfig = ( options: CommonOptions ) => {

	const { root }	= options
	const { name }	= options
	const { outputFile }	= options
	const configFilename	= 'tsconfig.json'

	try {
		const tsconfigPath = path.resolve( root, configFilename )
		const tsconfig = (
			JSON.parse(
				fs.readFileSync( tsconfigPath ).toString()
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			) as any
		)
		tsconfig.include ||= []
		const { include } = tsconfig

		if ( Array.isArray( include ) && ! include.includes( outputFile ) ) {
			include.push( outputFile )
			try {
				fs.writeFileSync( tsconfigPath, Buffer.from( JSON.stringify( tsconfig, undefined, '\t' ) ) )
				console.log( { package: name, message: `"${ outputFile }" added to \`include\` property of your "${ configFilename }" file.` } )
			} catch ( cause ) {
				throw new Error( `Couldn't update your "${ configFilename }" file. You should manually update it by adding ${ outputFile } in the \`include\` array.`, { cause } )
			}
		}

	} catch ( cause ) {
		throw new Error( `An error occured while updating your "${ configFilename }" file.`, { cause } )
	}
}


/**
 * Adds a TypeScript reference file and updates the tsconfig.json for the given project.
 *
 * @param options - The options for adding the types reference.
 * @param options.outputFile - The name of the output file to create. Defaults to 'alessiofrittoli-env.d.ts'.
 * @param options.name - The name of the project.
 *
 * @throws Will throw an error if the process fails.
 */
export const addTypesReference = ( options: AddTypesReferenceOptions ) => {

	const { outputFile = 'alessiofrittoli-env.d.ts' } = options
	const { name }	= options
	const root		= getProcessRoot()

	try {
		if ( ! isExternalPackage( { name, root } ) ) {
			console.log( { package: name, message: `Skip "postinstall" script. Running in ${ name }` } )
			return
		}
		createReferenceFile( { name, root, outputFile } )
		updateTsConfig( { root, name, outputFile } )
	} catch ( error ) {
		console.error( error )
		process.exit( 1 )
	}

}