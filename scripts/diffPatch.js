require( 'ts-node' )
	.register( require( '../ts-node.config.js' ) )

require( '../src/git' )
	.patchDiffToFile()