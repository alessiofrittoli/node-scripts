import { defineConfig } from 'tsup'

export default defineConfig( {
	entry		: [ 'src/index.ts', 'src/release.ts', 'src/postinstall/index.ts' ],
	format		: [ 'cjs', 'esm' ],
	dts			: true,
	splitting	: true,
	shims		: true,
	skipNodeModulesBundle: true,
	clean		: true,
	treeshake	: true,
	minify		: true,
	esbuildOptions( options, { format } ) {
		if ( format !== 'cjs' ) return options
		options.outExtension = { '.js': '.cjs' }
		return options
	},
} )