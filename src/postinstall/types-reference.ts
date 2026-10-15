import type { AddTypesReferenceOptions, CommonOptions } from '@/postinstall/types'
import { parseTsConfig } from '@alessiofrittoli/package-configs/tsconfig'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { arrayUnique } from '@alessiofrittoli/web-utils'
import { isExternalPackage } from '@/package'
import { getProcessRoot } from '@/process'
import { resolve } from 'path'

export const formatReferences = (types: string[]): string | undefined => {
	const typesArray = types
		.filter(types => !!types.trim())
		.map(types => `/// <reference types="${types.trim()}" />`)

	if (typesArray.length <= 0) return

	return typesArray.join('\n') + '\n'
}

/**
 * Creates or updates a reference file with type definitions for a project.
 *
 * @param options An object defining options for creating the types reference file. See {@link CommonOptions} for more info.
 *
 * @returns `void` if the operation was successful.
 *
 * @throws A new Exception if there is an issue creating or updating the file.
 */
export const createReferenceFile = (options: CommonOptions): true | undefined => {
	const { root, name, scopes: _scopes = [name], outputFile } = options

	const scopes = arrayUnique(_scopes)

	const comment = '// NOTE: This file should not be edited\n'

	const referencesFilePath = resolve(root, outputFile)

	// the type reference file already exists
	if (existsSync(referencesFilePath)) {
		const file = readFileSync(referencesFilePath)
		/**
		 * Existing references in file.
		 *
		 */
		const references = file.toString().split('\n')

		const newTypes = scopes.filter(type => !references.includes(`/// <reference types="${type}" />`))

		// the type reference file already includes the given package `name`
		if (newTypes.length <= 0) {
			console.log({
				package: name,
				message: `The "${outputFile}" file already exists and it includes the needed type references.`,
			})
			return
		}

		const data = formatReferences(newTypes)

		if (!data) {
			return
		}

		const output = Buffer.concat([Buffer.from(data), file])

		try {
			writeFileSync(referencesFilePath, output)

			console.log({
				package: name,
				message: `The "${outputFile}" file already exists and it has been updated with new type references.`,
			})
			return
		} catch (cause) {
			throw new Error(
				`An error occured while editing "${outputFile}" in your project. Some global types may not work as expected.`,
				{ cause },
			)
		}
	}

	const data = formatReferences(scopes)

	if (!data) {
		return
	}

	const output = [data, comment].join('\n')

	try {
		writeFileSync(referencesFilePath, Buffer.from(output))

		console.log({
			package: name,
			message: `"${outputFile}" has been created at the root of your project.`,
		})
		return true
	} catch (cause) {
		throw new Error(
			`An error occurred while creating "${outputFile}" at the root of your project. Some global types may not work as expected.`,
			{ cause },
		)
	}
}

/**
 * Adds a TypeScript reference file and updates the tsconfig.json for the given project.
 *
 * @param options An object defining options for adding the types reference. See {@link AddTypesReferenceOptions} for more info.
 *
 * @throws Will throw an error if the process fails.
 */
export const addTypesReference = (options: AddTypesReferenceOptions): void => {
	const { name, scopes, outputFile = 'alessiofrittoli-env.d.ts' } = options
	const root = getProcessRoot()

	try {
		if (!isExternalPackage({ name, root })) {
			console.log({ package: name, message: `Skip "postinstall" script. Running in ${name}` })
			return
		}

		createReferenceFile({ name, scopes, root, outputFile })

		const projectTsConfigPath = resolve(root, 'tsconfig.json')

		try {
			const parsedTsConfig = parseTsConfig({ filepath: projectTsConfigPath })

			if (!parsedTsConfig.fileNames.some(file => file.includes(outputFile))) {
				console.warn(
					`⚠️ The created "${outputFile}" is not in the program. Please make sure to reference this file in your tsconifg file.`,
				)
			}
		} catch {
			console.warn(
				`⚠️ We could check if "${outputFile}" is in the program. Could parse project tsconfig`,
				{ projectTsConfigPath },
			)
		}
	} catch (error) {
		console.error(error)
		process.exit(1)
	}
}
