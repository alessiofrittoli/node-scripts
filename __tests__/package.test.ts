import fs from 'fs'
import path from 'path'
import { getPackageJson, isExternalPackage } from '@/package'

jest.mock( 'fs' )
jest.mock( 'path' )


describe( 'Package', () => {

	
	const readFileSync	= fs.readFileSync as jest.Mock
	const pathResolve	= path.resolve as jest.Mock
	
	const mockRoot			= '/mock/root'
	const mockPackage		= { name: 'mock-package', version: '0.0.0' }
	const externalPackage	= { name: 'external-package', version: '0.0.0' }
	const packageFilepath	= `${ mockRoot }/package.json`
	
	
	describe( 'getPackageJson', () => {
	
		beforeEach( () => {
			readFileSync.mockReturnValue( JSON.stringify( mockPackage ) )
			pathResolve.mockReturnValue( packageFilepath )
		} )
	
		afterEach( () => {
			jest.clearAllMocks()
		} )
	
		it( 'read and parse the package.json file', () => {
			const result = getPackageJson( mockRoot )
			expect( result ).toEqual( mockPackage )
			expect( fs.readFileSync ).toHaveBeenCalledWith( packageFilepath )
		} )
	
		it( 'throw an error if the file cannot be read', () => {
			readFileSync.mockImplementation( () => {
				throw new Error( 'No such file or directory.' )
			} )
	
			expect( () => getPackageJson( mockRoot ) )
				.toThrow( 'No such file or directory.' )
		} )
	} )
	
	
	describe( 'isExternalPackage', () => {
	
	
		beforeEach( () => {
			readFileSync.mockReturnValue( JSON.stringify( mockPackage ) )
			pathResolve.mockReturnValue( packageFilepath )
		} )
	
		afterEach( () => {
			jest.clearAllMocks()
		} )
	
	
		it( 'returns false if the script is running in the same project', () => {
			const result = isExternalPackage( { root: mockRoot, name: mockPackage.name } )
			expect( result ).toBe( false )
		} )
	
	
		it( 'returns true if the script is running in an external project', () => {
			const result = isExternalPackage( { root: mockRoot, name: externalPackage.name } )
			expect( result ).toBe( true )
		} )
	
	
		it( 'throws an error if the package.json file cannot be read', () => {
			// bad format to negative test
			readFileSync.mockReturnValue( `{"name":"${ mockPackage.name }",}` )
	
			expect(
				() => isExternalPackage( { root: mockRoot, name: mockPackage.name } )
			).toThrow( 'Couldn\'t check if script is running in an external project.' )
		} )
	} )

} )