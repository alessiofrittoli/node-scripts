import { execSync as processExecSync } from 'child_process'
import { formatStash, formatStashList, getStashBy, getStashList } from '@/git'
import { getDefaultRemote, getDefaultRemoteAndBranch, getRemotes } from '@/git'

const stdOut = ( input: string | Array<string> ) => (
	Array.isArray( input )
		? Buffer.from( `${ input.join( '\n' ) }\n` )
		: Buffer.from( `${ input }\n` )
)

jest.mock( 'child_process', () => ( {
	execSync: jest.fn(),
} ) )
const execSync = processExecSync as jest.Mock

describe( 'Git', () => {


	beforeEach( () => {
		execSync.mockImplementation( ( command: string ) => {
			if ( command.startsWith( 'git config branch.' ) ) {
				return stdOut( 'origin' )
			}
			switch ( command ) {
				case 'git branch -rl \'*/HEAD\'':
					return stdOut( '\torigin/HEAD -> origin/master' )

				case 'git branch --show-current':
					return stdOut( 'master' )

				case 'git remote -v':
					return stdOut( [
						'another-remote\tgit@github.com:username/another-remote.git (fetch)',
						'another-remote\tgit@github.com:username/another-remote.git (push)',
						'origin\tgit@github.com:username/project-name.git (fetch)',
						'origin\tgit@github.com:username/project-name.git (push)',
						'project-2\tgit@github.com:username/project-name-2.git (fetch)',
						'project-2\tgit@github.com:username/project-name-2.git (push)',
					] )

				case 'git stash list':
					return stdOut( [
						'stash@{0}: On master: stash-1',
						'stash@{1}: On master: stash-2',
						'stash@{2}: On another-branch: stash-3',
					] )

				default:
					throw new Error( `command not found: ${ command }` )
			}
		} )
	} )

	afterEach( () => jest.resetAllMocks().resetModules() )


	describe( 'getRemotes', () => {

		it( 'returns a Map of Git remotes Maps', () => {
			const remotes = getRemotes()

			expect( remotes ).toBeInstanceOf( Map )
			expect( remotes.size ).toBe( 3 )
			expect( remotes.get( 'origin' )?.get( 'urls' )?.get( 'fetch' ) ).toBe( 'git@github.com:username/project-name.git' )
		} )

		it( 'tryies to assign fetch/push url type if no one has been specified', () => {
			execSync.mockImplementation( ( command: string ) => {
				switch ( command ) {

					case 'git remote -v': {
						return stdOut( [
							'another-remote\tgit@github.com:username/another-remote-fetch.git',
							'another-remote\tgit@github.com:username/another-remote-push.git',
							'origin\tgit@github.com:username/project-name-fetch.git',
							'origin\tgit@github.com:username/project-name-push.git',
							'project-2\tgit@github.com:username/project-name-2-fetch.git (push)',
							'project-2\tgit@github.com:username/project-name-2-push.git (push)',
						] )
					}
					default:
						throw new Error( `command not found: ${ command }` )
				}
			} )

			const origin = getRemotes().get( 'origin' )

			expect( origin?.get( 'urls' )?.get( 'fetch' ) )
				.toBe( 'git@github.com:username/project-name-fetch.git' )
			expect( origin?.get( 'urls' )?.get( 'push' ) )
				.toBe( 'git@github.com:username/project-name-push.git' )

		} )


		it( 'exclude a remote if no URL has been provided', () => {
			execSync.mockImplementation( ( command: string ) => {
				switch ( command ) {

					case 'git remote -v': {
						return stdOut( [
							'another-remote\tgit@github.com:username/another-remote.git (fetch)',
							'another-remote\tgit@github.com:username/another-remote.git (push)',
							'origin\t ()',
							'origin\t ()',
						] )
					}
					default:
						throw new Error( `command not found: ${ command }` )
				}
			} )

			const remotes = getRemotes()

			expect( remotes.has( 'origin' ) ).toBe( false )
			expect( remotes.has( 'another-remote' ) ).toBe( true )

		} )

	} )


	describe( 'getDefaultRemoteAndBranch', () => {

		it( 'returns an array with the default remote and branch name', () => {
			expect( getDefaultRemoteAndBranch() )
				.toStrictEqual( [ 'origin', 'master' ] )
		} )

		it( 'returns an array of null elements on failure', () => {
			execSync.mockImplementation( ( command: string ) => {
				switch ( command ) {
					case 'git branch -rl \'*/HEAD\'':
						return stdOut( '\torigin/HEAD origin/master' )
	
					default:
						throw new Error( `command not found: ${ command }` )
				}
			} )

			const result = getDefaultRemoteAndBranch()

			expect( result )
				.toBeInstanceOf( Array )
			expect( result.length )
				.toBe( 2 )
			
			result.map( value => expect( value ).toBeNull() )
		} )

	} )


	describe( 'getDefaultRemote', () => {
		it( 'returns the default remote map', () => {
			const remote = getDefaultRemote()
			const remoteUrls = remote?.get( 'urls' )
			expect( remote?.get( 'name' ) ).toBe( 'origin' )
			expect( remoteUrls?.get( 'fetch' ) ).toBe( 'git@github.com:username/project-name.git' )
			expect( remoteUrls?.get( 'push' ) ).toBe( 'git@github.com:username/project-name.git' )
		} )


		it( 'returns the first remote found if no default remote has been found', () => {
			execSync.mockImplementation( ( command: string ) => {
				switch ( command ) {
					case 'git branch -rl \'*/HEAD\'':
						return stdOut( '\torigin/HEAD origin/master' )
					case 'git remote -v':
						return stdOut( [
							'another-remote\tgit@github.com:username/another-remote.git (fetch)',
							'another-remote\tgit@github.com:username/another-remote.git (push)',
							'origin\tgit@github.com:username/project-name.git (fetch)',
							'origin\tgit@github.com:username/project-name.git (push)',
							'project-2\tgit@github.com:username/project-name-2.git (fetch)',
							'project-2\tgit@github.com:username/project-name-2.git (push)',
						] )
					default:
						throw new Error( `command not found: ${ command }` )
				}
			} )

			const remote = getDefaultRemote()
			expect( remote?.get( 'name' ) ).toBe( 'another-remote' )
			
		} )


		it( 'returns undefined if no remote is found', () => {
			execSync.mockImplementation( ( command: string ) => {
				switch ( command ) {
					case 'git branch -rl \'*/HEAD\'':
						return stdOut( '\torigin/HEAD origin/master' )
					case 'git remote -v':
						return stdOut( [] )
					default:
						throw new Error( `command not found: ${ command }` )
				}
			} )

			const remote = getDefaultRemote()
			expect( remote ).toBeUndefined()
			
		} )
	} )


	describe( 'getStashList', () => {

		it( 'returns a list of stashes', () => {
			const stashes = getStashList()

			expect( stashes ).toBeInstanceOf( Array )
		} )

		it( 'returns a stash by stash name', () => {
			const stashes = getStashList()

			expect( stashes ).toBeInstanceOf( Array )
			expect( stashes.length ).toBe( 3 )
		} )


		it( 'returns an empty array if no stash is found', () => {
			execSync.mockImplementation( ( command: string ) => {
				if ( command.startsWith( 'git config branch.' ) ) {
					return stdOut( 'origin' )
				}
				switch ( command ) {	
					case 'git stash list':
						return stdOut( [] )
	
					default:
						throw new Error( `command not found: ${ command }` )
				}
			} )

			expect( getStashList().length ).toBe( 0 )
			
		} )


		it( 'defaults stash branch to `main` if no branch name has been found in the stash', () => {
			execSync.mockImplementation( ( command: string ) => {
				if ( command.startsWith( 'git config branch.' ) ) {
					return stdOut( 'origin' )
				}
				switch ( command ) {	
					case 'git stash list':
						return stdOut( [
							'stash@{0}: : stash-1',
							'stash@{1}: stash-2',
							'stash@{2}',
						] )
	
					default:
						throw new Error( `command not found: ${ command }` )
				}
			} )

			const stashes = getStashList()

			expect( stashes.at( 0 )?.branch ).toBe( 'main' )
			expect( stashes.at( 1 )?.branch ).toBe( 'main' )
			expect( stashes.at( 2 )?.branch ).toBe( 'main' )
			
		} )

	} )


	describe( 'getStashBy', () => {

		it( 'returns a stash by stash index', () => {
			const stash = getStashBy( { index: 2 } )
			expect( stash?.name ).toBe( 'stash-3' )
			expect( stash?.branch ).toBe( 'another-branch' )
		} )


		it( 'returns a stash by stash name', () => {
			const stash = getStashBy( { name: 'stash-2' } )
			expect( stash?.index ).toBe( 1 )
			expect( stash?.branch ).toBe( 'master' )
		} )

	} )


	describe( 'formatStash', () => {

		it( 'formats a valid stash string into an object', () => {
			expect( formatStash( 'stash@{0}: WIP on main: 1234567 Commit message' ) ).toEqual( {
				index	: 0,
				branch	: 'main',
				name	: '1234567 Commit message',
			} )
		} )

		it( 'returns null for an invalid stash string', () => {
			expect( formatStash( 'invalid stash string' ) ).toBeNull()
		} )
		
		it( 'returns null if an invalid stash index is provided', () => {
			expect( formatStash( 'stash@{}: WIP on main: 1234567 Commit message' ) ).toBeNull()
		} )

		it( 'defaults branch to `main` if no branch name is found', () => {
			expect( formatStash( 'stash@{0}: : 1234567 Commit message' ) ).toEqual( {
				index	: 0,
				branch	: 'main',
				name	: '1234567 Commit message',
			} )
		} )

		it( 'returns null if the index is not a number', () => {
			expect(
				formatStash( 'stash@{invalid}: WIP on main: 1234567 Commit message' )
			).toBeNull()
		} )

	} )


	describe( 'formatStashList', () => {

		it( 'formats a list of valid stash strings into an array of objects', () => {
			const stashStrings = [
				'stash@{0}: WIP on main: 1234567 Commit message',
				'stash@{1}: WIP on feature-branch: 89abcdef Another commit message'
			]

			expect( formatStashList( stashStrings ) ).toEqual( [
				{
					index	: 0,
					branch	: 'main',
					name	: '1234567 Commit message',
				},
				{
					index	: 1,
					branch	: 'feature-branch',
					name	: '89abcdef Another commit message',
				}
			] )
		} )

		it( 'returns an array with null elements for invalid stash strings', () => {
			const stashStrings = [
				'invalid stash string',
				'stash@{invalid}: WIP on main: 1234567 Commit message'
			]
			expect( formatStashList( stashStrings ) ).toEqual( [ null, null ] )
		} )

	} )


} )