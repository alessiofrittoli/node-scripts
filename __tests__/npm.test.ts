import { execSync as processExecSync } from 'child_process'
import { getPackage, isPackageInstalled } from '@/npm'
import { mockGlobalPackages, mockLocalPackages } from '../src/lib/mock/npm.mock'

jest.mock( 'child_process' )
const execSync = processExecSync as jest.Mock

describe( 'NPM', () => {

	afterEach( () => {
		jest.resetAllMocks().resetModules()
	} )

	const localPackages		= JSON.stringify( mockLocalPackages )
	const globalPackages	= JSON.stringify( mockGlobalPackages )

	describe( 'getPackage', () => {
		it( 'retrieves local npm packages', () => {
			execSync.mockReturnValueOnce( Buffer.from( localPackages ) )

			const result = getPackage()
			expect( execSync ).toHaveBeenCalledWith( 'npm list --json' )
			expect( result ).toEqual( JSON.parse( localPackages ) )
		} )

		it( 'retrieves global npm packages', () => {
			execSync.mockReturnValueOnce( Buffer.from( globalPackages ) )

			const result = getPackage( true )
			expect( execSync ).toHaveBeenCalledWith( 'npm list --json -g' )
			expect( result ).toEqual( JSON.parse( globalPackages ) )
		} )
	} )

	describe( 'isPackageInstalled', () => {
		it( 'returns `true` if the package is installed locally', () => {
			execSync.mockReturnValueOnce( Buffer.from( localPackages ) )
			expect( isPackageInstalled( 'package-dep' ) ).toBe( true )
		} )


		it( 'returns `false` if the package is not installed locally', () => {
			execSync.mockReturnValueOnce( Buffer.from( localPackages ) )

			expect( isPackageInstalled( 'non-existent-package' ) ).toBe( false )
		} )


		it( 'returns `true` if the package is installed globally', () => {
			execSync.mockReturnValueOnce( Buffer.from( globalPackages ) )

			expect( isPackageInstalled( 'global-package', true ) ).toBe( true )
		} )


		it( 'returns `false` if the package is not installed globally', () => {
			execSync.mockReturnValueOnce( Buffer.from( globalPackages ) )

			expect( isPackageInstalled( 'non-existent-package', true ) ).toBe( false )
		} )
	} )
} )