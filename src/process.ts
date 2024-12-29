import type { NodeJS } from './types'

/**
 * Retrieves the root directory of the current process.
 *
 * @returns The root directory of the current process, determined by the `INIT_CWD` environment variable if set, 
 * 			otherwise the current working directory.
 */
export const getProcessRoot = () => (
	process.env.INIT_CWD || process.cwd()
)


/**
 * Generates a Map of process options from the command line arguments.
 * 
 * The function processes `process.argv` to create a Map where each key-value pair represents
 * an option and its corresponding value. The first two arguments are treated as special cases:
 * - The first argument (index 0) is mapped to `--executable`.
 * - The second argument (index 1) is mapped to `--scriptPath`.
 * 
 * For subsequent arguments:
 * - If an argument starts with a hyphen (`-`), it is considered an option key.
 * - If the next argument does not start with a hyphen, it is considered the value for the current option key.
 * - If the next argument does start with a hyphen, the current option key is mapped to `null`.
 * 
 * @template K - The type of the keys in the resulting Map.
 * @template V - The type of the values in the resulting Map, extending `NodeJS.Process.ArgvValue`.
 * 
 * @returns {Map<K, V>} A Map containing the processed command line options.
 */
export const getProcessOptions = <K, V extends NodeJS.Process.ArgvValue>() => (
	new Map<K, V>(
		process.argv
			.map( option => ( { value: option, isValue: ! option.startsWith( '-' ) } ) )
			.map( ( option, index, options ) => {
				switch ( index ) {
					case 0:
						return [ '--executable', option.value ]
					case 1:
						return [ '--scriptPath', option.value ]
					default: {
						const nextOption = options[ index + 1 ]
						if ( ! option.isValue ) {
							if ( nextOption?.isValue ) {
								return [ option.value, nextOption.value ]
							}
							return [ option.value, 'true' ]
						}
					}
				}
			} )
			.filter( Boolean ) as [ K, ( V ) ][]
	)
)