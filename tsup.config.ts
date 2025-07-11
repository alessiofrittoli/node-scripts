import { defineConfig } from 'tsup'

const enableSourcemap = process.env.NODE_ENV !== 'production'

export default defineConfig( {
	entry: [
		'src/index.ts',
		'src/types.ts',
		'src/release/index.ts',
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
	sourcemap	: enableSourcemap,
} )