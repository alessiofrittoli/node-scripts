import fs from 'fs'
import path from 'path'
import type { AddTypesReferenceOptions } from './types'


const addTypesReference = ( options: AddTypesReferenceOptions ) => {

	const { outputFile = 'alessiofrittoli-env.d.ts' } = options
	const { projectName }	= options
	const projectRoot		= process.env.INIT_CWD || process.cwd()

	const project = (
		JSON.parse(
			fs.readFileSync( path.resolve( projectRoot, 'package.json' ) ).toString()
		)
	)

	if ( project.name.endsWith( projectName ) ) {
		console.log( `Skip "postinstall" script. Running in ${ projectName }` )
		return
	}
	if ( ! projectRoot ) {
		console.error( 'INIT_CWD is not set. This script must be run during pnpm install.' )
		process.exit( 1 )
	}

	const data		= `/// <reference types="${ projectName }" />\n`
	const comment	= '// NOTE: This file should not be edited'

	const referencesFilePath = path.resolve( projectRoot, outputFile )

	if ( fs.existsSync( referencesFilePath ) ) {
		const file	= fs.readFileSync( referencesFilePath )
		const lines	= file.toString().split( '\n' )

		if ( lines.includes( data.replace( /\n/g, '' ) ) ) {
			console.log( `The "${ outputFile }" file has been found at the root of your project and it already includes the needed type references.` )
			return
		}

		const output = Buffer.concat( [ Buffer.from( data ), file ] )

		try {
			fs.writeFileSync( referencesFilePath, output )
			console.log( `The "${ outputFile }" file has been found at the root of your project and it has been edited with new type references.` )
		} catch ( error ) {
			console.error( `An error occured while editing "${ outputFile }" in your project. Some global types may not working as expect.`, error )
			process.exit( 1 )
		}

		return
	}

	const output = [ data, comment ].join( '\n' )

	try {
		fs.writeFileSync( referencesFilePath, output )
		console.log( `"${ outputFile }" has been created at the root of your project.` )
		console.log( 'Please update your tsconfig.json to add this file in your "include" property of your tsconfig.json file.' )
	} catch ( error ) {
		console.error( `An error occured while creating "${ outputFile }" at the root of your project. Some global types may not working as expect.`, error )
		process.exit( 1 )
	}

}


export default addTypesReference