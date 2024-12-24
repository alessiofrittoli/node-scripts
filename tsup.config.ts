import { defineConfig } from 'tsup'

export default defineConfig( {
	entry		: [ 'src/index.ts', 'src/release.ts', 'src/postinstall/index.ts' ],
	format		: [ 'cjs', 'esm' ],
	dts			: true,
	splitting	: false,
	shims		: true,
	skipNodeModulesBundle: true,
	clean		: true,
	treeshake	: true,
	minify		: true,
} )