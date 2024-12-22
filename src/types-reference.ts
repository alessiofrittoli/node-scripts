import fs from 'fs'
import path from 'path'
import type { AddTypesReferenceOptions } from './types'

interface CommonOptions
{
	projectRoot	: string
	projectName	: string
	outputFile	: string
}


const isExternalProject = ( options: Omit<CommonOptions, 'outputFile'> ) => {

	const { projectRoot }	= options
	const { projectName }	= options

	if ( ! projectRoot ) {
		throw new Error( 'INIT_CWD is not set. This script must be run during pnpm install.' )
	}

	try {
		const project = (
			JSON.parse(
				fs.readFileSync( path.resolve( projectRoot, 'package.json' ) ).toString()
			)
		)
	
		if ( project.name.endsWith( projectName ) ) {
			return false
		}

		return true
	} catch ( cause ) {
		throw new Error( 'Couldn\'t check if script is running in an external project.', { cause } )
	}
}


const createReferenceFile = ( options: CommonOptions ): true => {

	const { projectRoot }	= options
	const { projectName }	= options
	const { outputFile }	= options
	const data				= `/// <reference types="${ projectName }" />\n`
	const comment			= '// NOTE: This file should not be edited'

	const referencesFilePath = path.resolve( projectRoot, outputFile )

	if ( fs.existsSync( referencesFilePath ) ) {
		const file	= fs.readFileSync( referencesFilePath )
		const lines	= file.toString().split( '\n' )

		if ( lines.includes( data.replace( /\n/g, '' ) ) ) {
			console.log( { package: projectName, message: `The "${ outputFile }" file already exists and it includes the needed type references.` } )
			return true
		}

		const output = Buffer.concat( [ Buffer.from( data ), file ] )
	
		try {
			fs.writeFileSync( referencesFilePath, output )
			console.log( { package: projectName, message: `The "${ outputFile }" file already exists and it has been edited with new type references.` } )
			return true
		} catch ( cause ) {
			throw new Error( `An error occured while editing "${ outputFile }" in your project. Some global types may not working as expect.`, { cause } )
		}

	}

	const output = [ data, comment ].join( '\n' )

	try {
		fs.writeFileSync( referencesFilePath, output )
		console.log( { package: projectName, message: `"${ outputFile }" has been created at the root of your project.` } )
		return true
	} catch ( cause ) {
		throw new Error( `An error occured while creating "${ outputFile }" at the root of your project. Some global types may not working as expect.`, { cause } )
	}

}

const updateTsConfig = ( options: CommonOptions ) => {

	const { projectRoot }	= options
	const { projectName }	= options
	const { outputFile }	= options
	const configFilename	= 'tsconfig.json'

	try {
		const tsconfigPath = path.resolve( projectRoot, configFilename )
		const tsconfig = (
			JSON.parse(
				fs.readFileSync( path.resolve( projectRoot, configFilename ) ).toString()
			)
		)
		const include = 'include' in tsconfig ? tsconfig.include : []

		if ( Array.isArray( include ) && ! include.includes( outputFile ) ) {
			include.push( outputFile )
			tsconfig.include = include
			try {
				fs.writeFileSync( tsconfigPath, Buffer.from( JSON.stringify( tsconfig, undefined, '\t' ) ) )
				console.log( { package: projectName, message: `"${ outputFile }" added to \`include\` property of your "${ configFilename }" file.` } )
			} catch ( cause ) {
				throw new Error( `Couldn't update your "${ configFilename }" file. You should manually update it by adding ${ outputFile } in the \`include\` array.`, { cause } )
			}
		}

	} catch ( cause ) {
		throw new Error( `An error occured while updating your "${ configFilename }" file.`, { cause } )
	}
}


const addTypesReference = ( options: AddTypesReferenceOptions ) => {

	const { outputFile = 'alessiofrittoli-env.d.ts' } = options
	const { projectName }	= options
	const projectRoot		= process.env.INIT_CWD || process.cwd()

	try {
		if ( ! isExternalProject( { projectName, projectRoot } ) ) {
			console.log( { package: projectName, message: `Skip "postinstall" script. Running in ${ projectName }` } )
			return
		}
		createReferenceFile( { projectName, projectRoot, outputFile } )
		updateTsConfig( { projectRoot, projectName, outputFile } )
	} catch ( error ) {
		console.error( error )
		process.exit( 1 )
	}

}


export default addTypesReference