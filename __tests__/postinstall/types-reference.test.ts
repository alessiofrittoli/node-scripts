import fs from 'fs'
import path from 'path'

import { addTypesReference } from '@/postinstall/types-reference'
import { getProcessRoot as getRoot } from '@/process'
import { isExternalPackage as isExternal } from '@/package'


jest.mock( 'fs' )
jest.mock( 'path' )
jest.mock( '@/process' )
jest.mock( '@/package' )


const getProcessRoot	= getRoot as jest.Mock
const isExternalPackage	= isExternal as jest.Mock
const pathResolve		= path.resolve as jest.Mock
const existsSync		= fs.existsSync as jest.Mock
const readFileSync		= fs.readFileSync as jest.Mock
const writeFileSync		= fs.writeFileSync as jest.Mock

describe( 'Post-Install', () => {
	
	describe( 'addTypesReference', () => {
	
		const mockRoot			= '/mock/root'
		const mockName			= 'mock-package'
		const mockName2			= 'mock-package-2'
		const mockOutputFile	= 'mock-env.d.ts'
		const mockTsConfig		= { include: [] }
		let mockTsConfigPath	= ''
		let referencesFilePath	= ''
		let defaultReferencesFilePath = ''
	
	
		beforeEach( () => {
			getProcessRoot.mockReturnValue( mockRoot )
			isExternalPackage.mockReturnValue( true )
			pathResolve.mockImplementation( ( ...args ) => args.join( '/' ) )
			existsSync.mockReturnValue( false )
			readFileSync.mockReturnValue( Buffer.from( JSON.stringify( mockTsConfig ) ) )
			jest.spyOn( console, 'log' ).mockImplementation( () => {} )
			jest.spyOn( console, 'error' ).mockImplementation( () => {} )
			jest.spyOn( process, 'exit' ).mockImplementation( code => {
				throw new Error( `process.exit: ${ code }` )
			} )
	
			mockTsConfigPath	= path.resolve( mockRoot, 'tsconfig.json' )
			referencesFilePath	= path.resolve( mockRoot, mockOutputFile )	
			defaultReferencesFilePath = path.resolve( mockRoot, 'alessiofrittoli-env.d.ts' )	
		} )
	
		afterEach( () => jest.resetAllMocks().resetModules() )
	
	
		it( 'creates a new reference file and update "tsconfig.json"', () => {
	
			addTypesReference( { name: mockName } )
			
			const data		= `/// <reference types="${ mockName }" />\n`
			const comment	= '// NOTE: This file should not be edited'
			const output	= [ data, comment ].join( '\n' )
	
			expect( fs.writeFileSync )
				.toHaveBeenNthCalledWith( 1, defaultReferencesFilePath, Buffer.from( output ) )
	
			expect( fs.writeFileSync ).toHaveBeenNthCalledWith(
				2,
				mockTsConfigPath,
				Buffer.from( JSON.stringify( { include: [ 'alessiofrittoli-env.d.ts' ] }, undefined, '\t' ) )
			)
		} )
		
		
		it( 'creates a new reference file with custom name and update "tsconfig.json"', () => {
	
			addTypesReference( { name: mockName, outputFile: mockOutputFile } )
			
			const data		= `/// <reference types="${ mockName }" />\n`
			const comment	= '// NOTE: This file should not be edited'
			const output	= [ data, comment ].join( '\n' )
	
			expect( fs.writeFileSync )
				.toHaveBeenNthCalledWith( 1, referencesFilePath, Buffer.from( output ) )
	
			expect( fs.writeFileSync ).toHaveBeenNthCalledWith(
				2,
				mockTsConfigPath,
				Buffer.from( JSON.stringify( { include: [ mockOutputFile ] }, undefined, '\t' ) )
			)
		} )
	
	
		it( 'updates the reference file if already exists', () => {
			const data				= `/// <reference types="${ mockName }" />\n`
			const comment			= '// NOTE: This file should not be edited'
			const output			= [ data, comment ].join( '\n' )
			const outputBuffer		= Buffer.from( output )
			const dataUpdate		= `/// <reference types="${ mockName2 }" />\n`
			const dataUpdateOutput	= Buffer.concat( [ Buffer.from( dataUpdate ), outputBuffer ] )
	
			existsSync
				.mockReturnValueOnce( true ) // reference file already exists.
			
			readFileSync
				.mockReturnValueOnce( outputBuffer ) // return reference file content that need to be updated.
				.mockReturnValueOnce(
					Buffer.from( JSON.stringify( { include: [ mockOutputFile ] } ) )
				) // return tsconfig file content to check if it need to be updated.
	
			addTypesReference( { name: mockName2, outputFile: mockOutputFile } )
	
			expect( fs.writeFileSync ).toHaveBeenCalledTimes( 1 ) // 1 time - update reference file
			expect( fs.writeFileSync )
				.toHaveBeenCalledWith( referencesFilePath, dataUpdateOutput )
	
		} )
	
	
		it( 'doesn\'t update the reference file if reference is already included', () => {
			const data			= `/// <reference types="${ mockName }" />\n`
			const comment		= '// NOTE: This file should not be edited'
			const output		= [ data, comment ].join( '\n' )
			const outputBuffer	= Buffer.from( output )
	
			existsSync
				.mockReturnValueOnce( true ) // reference file already exists.
			
			readFileSync
				.mockReturnValueOnce( outputBuffer ) // return reference file content that need to be updated.
				.mockReturnValueOnce(
					Buffer.from( JSON.stringify( { include: [ mockOutputFile ] } ) )
				) // return tsconfig file content to check if it need to be updated.
	
			addTypesReference( { name: mockName, outputFile: mockOutputFile } )
			expect( fs.writeFileSync ).not.toHaveBeenCalled() // no need to update since `mockName` package reference is already in there.
	
		} )
	
	
		it( 'doesn\'t update "tsconfig.json" if reference file is already included', () => {
			readFileSync.mockReturnValue( JSON.stringify( { include: [ mockOutputFile ] } ) )
	
			addTypesReference( { name: mockName, outputFile: mockOutputFile } )
	
			const data		= `/// <reference types="${ mockName }" />\n`
			const comment	= '// NOTE: This file should not be edited'
			const output	= [ data, comment ].join( '\n' )
	
			expect( fs.writeFileSync ).toHaveBeenCalledTimes( 1 )
			expect( fs.writeFileSync )
				.toHaveBeenNthCalledWith( 1, referencesFilePath, Buffer.from( output ) )
	
		} )
	
	
		it( 'adds `include` property if missing in "tsconfig.json" file', () => {
			readFileSync.mockReturnValue( JSON.stringify( {} ) )
	
			addTypesReference( { name: mockName, outputFile: mockOutputFile } )
			
			expect( fs.writeFileSync ).toHaveBeenNthCalledWith(
				2,
				mockTsConfigPath,
				Buffer.from( JSON.stringify( { include: [ mockOutputFile ] }, undefined, '\t' ) )
			)
		} )
	
	
		it( 'log a message and return if the package is not external', () => {
			isExternalPackage.mockReturnValue( false )
	
			addTypesReference( { name: mockName, outputFile: mockOutputFile } )
	
			expect( console.log )
				.toHaveBeenCalledWith( { package: mockName, message: `Skip "postinstall" script. Running in ${ mockName }` } )
			expect( fs.writeFileSync ).not.toHaveBeenCalled()
		} )
	
	
		it( 'exit with code "1" if creating the reference file fails', () => {
			writeFileSync.mockImplementationOnce(
				() => { throw new Error( 'Failed to write file' ) }
			)
	
			expect( () => {
				addTypesReference( { name: mockName, outputFile: mockOutputFile } )
			} ).toThrow( 'process.exit: 1' )
	
			expect( console.error )
				.toHaveBeenCalledWith( new Error(
					`An error occurred while creating "${ mockOutputFile }" at the root of your project. Some global types may not work as expected.`
				) )
		} )
	
	
		it( 'exit with code "1" if updating the existing reference file fails', () => {
			const data				= `/// <reference types="${ mockName }" />\n`
			const comment			= '// NOTE: This file should not be edited'
			const output			= [ data, comment ].join( '\n' )
			const outputBuffer		= Buffer.from( output )
	
			existsSync
				.mockReturnValueOnce( true ) // check if reference file exists.
			
			readFileSync
				.mockReturnValueOnce( outputBuffer ) // retrieve reference file content that need to be updated.
			
			writeFileSync
				.mockImplementationOnce( () => {
					// the reference file already exists and a simulated error occurs while updating it.
					throw new Error( 'You don\'t have enough permissions to edit files.' )
				} )
	
			expect(
				() => addTypesReference( { name: mockName2, outputFile: mockOutputFile } )
			).toThrow( 'process.exit: 1' )
	
			expect( console.error )
				.toHaveBeenCalledWith( new Error( `An error occured while editing "${ mockOutputFile }" in your project. Some global types may not work as expected.` ) )
		} )
	
	
		it( 'exit with code "1" if updating "tsconfig.json" fails', () => {
			writeFileSync
				.mockImplementationOnce( () => {} )
				.mockImplementationOnce( () => { throw new Error( 'Failed to write file' ) } )
	
			expect(
				() => addTypesReference( { name: mockName, outputFile: mockOutputFile } )
			).toThrow( 'process.exit: 1' )
	
			expect( console.error )
				.toHaveBeenCalledWith( new Error( "An error occured while updating your \"tsconfig.json\" file." ) )
		} )
	
	
	} )
} )