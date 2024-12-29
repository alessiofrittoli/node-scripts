import { defineConfig } from 'tsup'

export default defineConfig( {
	entry: [
		'src/index.ts',
		'src/types.ts',
		'src/publish/index.ts',
		'src/postinstall/index.ts'
	],
	format		: [ 'cjs', 'esm' ],
	dts			: true,
	splitting	: false,
	shims		: false,
	skipNodeModulesBundle: true,
	clean		: true,
	treeshake	: true,
	minify		: true,
} )