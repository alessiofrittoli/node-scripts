import { join } from 'path'
import { writeFileSync, mkdirSync, rmSync } from 'fs'
import { getDirectoryTree, forEachDirectoryEntry, DirectoryTreeEntry } from '../src/fs'
import { Exception } from '@alessiofrittoli/exception'
import { AbortSignal } from '@alessiofrittoli/abort-controller'

describe( 'getDirectoryTree', () => {

	const testDir	= join( process.cwd(), 'lib', 'mock', 'fs' )
	const subDir	= join( testDir, 'sub' )
	const file1		= join( testDir, 'file1.txt' )
	const file2		= join( subDir, 'file2.txt' )

	beforeAll( () => {
		mkdirSync( testDir, { recursive: true } )
		mkdirSync( subDir, { recursive: true } )
		writeFileSync( file1, 'hello' )
		writeFileSync( file2, 'world' )
	} )

	
	afterAll( () => {
		rmSync( testDir, { recursive: true, force: true } )
	} )


	it( 'returns an array with a single file entry if path is a file', () => {

		const entries = getDirectoryTree( file1 )

		expect( entries ).toHaveLength( 1 )
		expect( entries[ 0 ]?.path ).toBe( file1 )
		expect( entries[ 0 ]?.stats.isFile() ).toBe( true )

	} )


	it( 'returns all files and directories recursively', () => {

		const entries	= getDirectoryTree( testDir )
		const paths		= entries.map( e => e.path )

		expect( paths )
			.toEqual( expect.arrayContaining( [ testDir, subDir, file1, file2 ] ) )

	} )


	it( 'excludes specified paths', () => {

		const entries	= getDirectoryTree( testDir, [ subDir ] )
		const paths		= entries.map( e => e.path )

		expect( paths ).not.toContain( file2 )
		expect( paths ).not.toContain( subDir )

	} )


	it( 'returns empty array if path is excluded', () => {

		expect( getDirectoryTree( testDir, [ testDir ] ) ).toEqual( [] )

	} )


	it( 'throws Exception if path does not exist', () => {
		expect( () => getDirectoryTree( '/non/existent/path' ) ).toThrow( Exception )
	} )

} )


describe( 'forEachDirectoryEntry', () => {

	const testDir	= join( process.cwd(), 'lib', 'mock', 'fs' )
	const subDir	= join( testDir, 'sub' )
	const file1		= join( testDir, 'file1.txt' )
	const file2		= join( subDir, 'file2.txt' )

	beforeAll( () => {
		mkdirSync( testDir, { recursive: true } )
		mkdirSync( subDir, { recursive: true } )
		writeFileSync( file1, 'hello' )
		writeFileSync( file2, 'world' )
	} )

	afterAll( () => {
		rmSync( testDir, { recursive: true, force: true } )
	} )


	it( 'calls onIteration for each entry', async () => {

		const onIteration = jest.fn( ( entry: DirectoryTreeEntry ) => entry.path )

		const results = await forEachDirectoryEntry( {
			path		: testDir,
			onIteration	: onIteration,
		} )

		expect( onIteration ).toHaveBeenCalled()
		expect( results )
			.toEqual( expect.arrayContaining( [ testDir, subDir, file1, file2 ] ) )

	} )


	it( 'respects exclude option', async () => {

		const onIteration = jest.fn( ( entry: DirectoryTreeEntry ) => entry.path )

		const results = await forEachDirectoryEntry( {
			path		: testDir,
			exclude		: [ file1 ],
			onIteration	: onIteration,
		} )

		expect( results ).not.toContain( file1 )

	} )


	it( 'stops iteration if signal is aborted', async () => {

		const signal = { aborted: false }

		const onIteration = jest.fn( ( entry: DirectoryTreeEntry, idx ) => {
			if ( idx === 1 ) signal.aborted = true
			return entry.path
		} )

		const results = await forEachDirectoryEntry({
			path		: testDir,
			signal		: signal as AbortSignal,
			onIteration	: onIteration,
		} )

		expect( results.length ).toBeLessThanOrEqual( 2 )

	} )


} )