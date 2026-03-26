const tsconfig = require( './tsconfig.json' )

tsconfig.compilerOptions.module	= 'commonjs'

/** @type { import( 'ts-node' ).RegisterOptions } */
module.exports = tsconfig