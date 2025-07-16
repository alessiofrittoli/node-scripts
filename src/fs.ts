import { parse, join, type ParsedPath } from 'path'
import { existsSync, lstatSync, readdirSync, type Stats } from 'fs'

import type { AbortSignal } from '@alessiofrittoli/abort-controller'
import { Exception } from '@alessiofrittoli/exception'
import { ErrorCode } from './error'


export interface DirectoryTreeEntry
{
	path		: string
	parsedPath	: ParsedPath
	stats		: Stats
}


export type OnIterationOptions = DirectoryTreeEntry
export type OnIteration<T = unknown> = ( options: OnIterationOptions, index: number, total: number ) => T | Promise<T>


export interface ForEachDirectoryEntryOptions<T = unknown, TCode = ErrorCode>
{
	/** The root directory path to start traversal. */
	path: string
	/** Excluded paths. */
	exclude?: string[]
	/** An AbortSignal to cancel the iteration early. */
	signal?: AbortSignal<TCode>
	/** Callback function invoked for each directory entry. */
	onIteration	: OnIteration<T>
}


/**
 * Recursively retrieves the directory tree starting from the specified path.
 * 
 * @param path		The root directory path to start traversing.
 * @param exclude	Optional array of directory paths to exclude from the traversal.
 * 
 * @returns	An array of {@linkcode DirectoryTreeEntry} objects representing files and directories found.
 * @throws	A new Exception if the specified `path` does not exist.
 *
 * @remarks
 * - If `path` is in the `exclude` list, an empty array is returned.
 * - If `path` is a file, returns an array containing only that file's entry.
 * - If `path` is a directory, recursively traverses its contents, excluding any paths listed in `exclude`.
 */
export const getDirectoryTree = ( path: string, exclude?: string[] ): DirectoryTreeEntry[] => {
	
	if ( exclude?.includes( path ) ) {
		return []
	}
	

	if ( ! existsSync( path ) ) {
		throw new Exception( `No such file or directory, '${ path }'`, { code: ErrorCode.ENOENT } )
	}

	const stats			= lstatSync( path )
	const parsedPath	= parse( path )
	const isFile		= stats.isFile()
	const entry			= { path, parsedPath, stats }

	if ( isFile ) return [ entry ]

	return (
		[
			...readdirSync( path ).map( dir => (
				getDirectoryTree( join( parsedPath.dir, parsedPath.base, dir ), exclude )
			) ).flat(),
			entry,
		]
	)

}


/**
 * Asynchronously iterates over each entry in a directory tree, applying a callback function to each entry.
 *
 * @template T		The type of the result returned by the iteration callback.
 * @template TCode	The type representing error codes.
 * 
 * @param options Configuration options for the iteration. See {@linkcode ForEachDirectoryEntryOptions} for more info.
 * 
 * @returns	A new Promise that resolves to an array of results returned by the callback for each entry.
 */
export const forEachDirectoryEntry = async <T = unknown, TCode = ErrorCode>(
	options: ForEachDirectoryEntryOptions<T, TCode>
): Promise<T[]> => {

	const {
		path, exclude, signal, onIteration
	} = options

	const entries = getDirectoryTree( path, exclude )
	const results: T[] = []

	for await ( const entry of entries ) {
		if ( signal?.aborted ) break
		results.push( await onIteration( entry, results.length, entries.length ) )
	}

	return results
}