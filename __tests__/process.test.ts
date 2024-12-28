import { getProcessRoot, getProcessOptions } from '@/process'

describe( 'Process', () => {

	const originalEnv	= process.env
	const originalArgv	= process.argv
	const defaultArgv	= [ '/usr/local/bin/node', '/path/to/the/executed/script.js' ]

	beforeEach( () => {
		process.argv	= [ ...defaultArgv ]
		process.env		= { ...originalEnv }
	} )

	afterEach( () => {
		process.argv	= originalArgv
		process.env		= originalEnv

		jest.resetAllMocks().resetModules()
	} )

	describe( 'getProcessRoot', () => {
			
		it( 'returns INIT_CWD if it is set', () => {
			process.env.INIT_CWD = '/mock/init/cwd'
			expect( getProcessRoot() ).toBe( '/mock/init/cwd' )
		} )
	
	
		it( 'returns process.cwd() if INIT_CWD is not set', () => {
			delete process.env.INIT_CWD
			const mockCwd = '/mock/current/working/directory'
			jest.spyOn( process, 'cwd' ).mockReturnValue( mockCwd )
			expect( getProcessRoot() ).toBe( mockCwd )
		} )
	
	} )
	
	describe( 'getProcessOptions', () => {

		it( 'maps the first argument to --executable', () => {
			const options = getProcessOptions()
			expect( options.get( '--executable' ) ).toBe( defaultArgv.at( 0 ) )
		} )
	

		it( 'maps the second argument to --scriptPath', () => {
			const options = getProcessOptions()
			expect( options.get( '--scriptPath' ) )
				.toBe( defaultArgv.at( 1 ) )
		} )
	

		it( 'maps subsequent arguments correctly', () => {
			process.argv = [ ...defaultArgv, '--option1', 'value1', '--option2', 'value2' ]
			const options = getProcessOptions()
			expect( options.get( '--option1' ) ).toBe( 'value1' )
			expect( options.get( '--option2' ) ).toBe( 'value2' )
		} )
	
		
		it( 'maps options without values to true', () => {
			process.argv = [ ...defaultArgv, '--option1', '--option2', 'value2' ]
			const options = getProcessOptions()
			expect( options.has( '--option1' ) ).toBe( true )
			expect( options.get( '--option1' ) ).toBe( true )
			expect( options.get( '--option2' ) ).toBe( 'value2' )
		} )
	} )

} )