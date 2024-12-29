import { execSync } from 'child_process'
import { publish } from '@/publish'
import * as processModule from '@/process'
import * as packageModule from '@/package'
import * as gitModule from '@/git'
import type { Git, NodeJS } from '@/types'
import { mockGlobalPackages, mockGlobalPackagesWithPnpm } from '../../src/lib/mock/publish.mock'

jest
	.mock( 'child_process', () => ( {
		execSync: jest.fn(),
	} ) )
	.mock( '@/process', () => ( {
		getProcessOptions	: jest.fn(),
		getProcessRoot		: jest.fn(),
	} ) )
	.mock( '@/package', () => ( {
		getPackageJson: jest.fn(),
	} ) )
	.mock( '@/git', () => {
		const gitModule = jest.requireActual( '@/git' )
		return ( {
			formatStash		: gitModule.formatStash,
			getDefaltRemote	: jest.fn(),
			getStashBy		: jest.fn(),
		} )
	} )

const mockExecSync = execSync as jest.Mock

describe( 'publish', () => {

	const mockRoot = '/mock/root'
	const mockDefaultRemoteUrls: Git.Remote.Urls = new Map( [
		[ 'fetch', 'upstream\tgit@github.com:username/project-name.git (fetch)' ],
		[ 'push', 'upstream\tgit@github.com:username/project-name.git (push)' ],
	] )
	const mockDefaultRemote = new Map<Git.Remote.MapKey, Git.Remote.MapValue<Git.Remote.MapKey>>( [
		[ 'name', 'upstream' ],
		[ 'urls', mockDefaultRemoteUrls ],
	] ) as Git.Remote.Map

	const mockStash = (
		gitModule.formatStash( 'stash@{0}: On master: pre-release' ) || undefined
	)


	beforeEach( () => {

		mockExecSync.mockImplementation( ( command: string ) => {
			switch ( command ) {
				case 'npm list --json -g':
					return Buffer.from( JSON.stringify( mockGlobalPackages ) )
				default:
					// throw new Error( `command not found: ${ command }` )
			}
		} )

		jest.spyOn( processModule, 'getProcessRoot' )
			.mockReturnValue( mockRoot )
		jest.spyOn( processModule, 'getProcessOptions' )
			.mockReturnValue( new Map( [ [ '--verbose', 'true' ] ] ) )

		jest.spyOn( packageModule, 'getPackageJson' )
			.mockReturnValue( { version: '1.0.0', name: 'test-package' } )
		
		jest.spyOn( gitModule, 'getDefaltRemote' )
			.mockReturnValue( mockDefaultRemote )
		jest.spyOn( gitModule, 'getStashBy' )
			.mockReturnValue( mockStash )


		// jest.spyOn( console, 'log' ).mockImplementation( () => {} )
		jest.spyOn( console, 'error' ).mockImplementation( () => {} )
		jest.spyOn( process, 'exit' ).mockImplementation( code => {
			throw new Error( `process.exit: ${ code }` )
		} )

	} )


	afterEach( () => {
		jest.resetAllMocks().resetModules()
	} )

	it( 'executes the publish process correctly', () => {

		publish()

		expect( execSync )
			.toHaveBeenCalledWith( 'git stash save -u -m "pre-release"', { stdio: 'inherit' } )
		expect( execSync )
			.toHaveBeenCalledWith( 'npm run build', { stdio: 'inherit' } )
		expect( execSync )
			.toHaveBeenCalledWith( 'git tag v1.0.0', { stdio: 'inherit' } )
		expect( execSync )
			.toHaveBeenCalledWith( 'git push upstream tag v1.0.0', { stdio: 'inherit' } )
		expect( execSync )
			.toHaveBeenCalledWith( 'git stash pop --index 0', { stdio: 'inherit' } )
	} )


	it( 'executes the publish process with `pnpm`', () => {

		mockExecSync.mockImplementation( ( command: string ) => {
			switch ( command ) {
				case 'npm list --json -g':
					return Buffer.from( JSON.stringify( mockGlobalPackagesWithPnpm ) )
				default:
			}
		} )

		publish()

		expect( execSync )
			.toHaveBeenCalledWith( 'pnpm build', { stdio: 'inherit' } )
	} )


	it( 'push the git tag to "origin" if no --origin has been set or found in the current git configuration', () => {

		jest.spyOn( gitModule, 'getDefaltRemote' )
			.mockReturnValue( undefined )

		publish()

		expect( execSync )
			.toHaveBeenCalledWith( 'git push origin tag v1.0.0', { stdio: 'inherit' } )
	} )


	it( 'doesn\'t require a package.json if --version option is set', () => {
		
		jest.spyOn( processModule, 'getProcessOptions' )
			.mockReturnValue( new Map<string, NodeJS.Process.ArgvValue>( [
				[ '--verbose', 'true' ],
				[ '--version', '1.0.0-alpha.1' ]
			] ) )

		jest.spyOn( packageModule, 'getPackageJson' )
			.mockReturnValue( null )

		publish()

		expect( execSync )
			.toHaveBeenCalledWith( 'git tag v1.0.0-alpha.1', { stdio: 'inherit' } )

	} )


	it( 'publish to npm if --npm flag is set', () => {
		jest.spyOn( processModule, 'getProcessOptions' )
			.mockReturnValue( new Map( [
				[ '--verbose', 'true' ],
				[ '--npm', 'true' ],
			] ) )

		publish()

		expect( execSync )
			.toHaveBeenCalledWith( 'npm publish --access public', { stdio: 'inherit' } )
	} )


	it( 'publish to npm with restricted access', () => {
		jest.spyOn( processModule, 'getProcessOptions' )
			.mockReturnValue( new Map<string, NodeJS.Process.ArgvValue>( [
				[ '--verbose', 'true' ],
				[ '--npm', 'true' ],
				[ '--access', 'restricted' ],
			] ) )

		publish()

		expect( execSync )
			.toHaveBeenCalledWith( 'npm publish --access restricted', { stdio: 'inherit' } )
	} )


	it( 'exit with code "1" if an unexpected error occurs', () => {
		mockExecSync.mockImplementation( command => {
			throw new Error( `command not found: ${ command.split( ' ' ).at( 0 ) }` )
		} )

		expect( () => publish() ).toThrow( 'process.exit: 1' )
		expect( process.exit ).toHaveBeenCalledWith( 1 )
	} )


	it( 'exit with code "1" if no `--version` option is provided and no version is found in package.json', () => {
		jest.spyOn( packageModule, 'getPackageJson' ).mockReturnValue( {} )
		jest.spyOn( processModule, 'getProcessOptions' ).mockReturnValue( new Map() )

		expect( () => publish() ).toThrow( 'process.exit: 1' )
		expect( process.exit ).toHaveBeenCalledWith( 1 )
	} )

	
	it( 'exit with code "1" if invalid access option is provided', () => {
		jest.spyOn( processModule, 'getProcessOptions' )
			.mockReturnValue( new Map<string, NodeJS.Process.ArgvValue>( [
				[ '--access', 'invalid' ],
				[ '--npm', 'true' ],
			] ) )

		expect( () => publish() ).toThrow( 'process.exit: 1' )
		expect( process.exit ).toHaveBeenCalledWith( 1 )
	} )
} )