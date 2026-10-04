import { existsSync as _existsSync, readFileSync as _readFileSync, writeFileSync as _writeFileSync } from 'fs'
import { parseTsConfig as _parseTsConfig } from '@alessiofrittoli/package-configs/tsconfig'
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { isExternalPackage as _isExternalPackage } from '@/package'
import { addTypesReference } from '@/postinstall/types-reference'
import { getProcessRoot as _getProcessRoot } from '@/process'
import { resolve } from 'path'

vi.mock('fs')
vi.mock('path')
vi.mock('@/process')
vi.mock('@/package')

vi.mock('@alessiofrittoli/package-configs/tsconfig', async () => {
	const { parseTsConfig, ...module } = await vi.importActual('@alessiofrittoli/package-configs/tsconfig')
	return {
		...module,
		parseTsConfig: vi.fn(parseTsConfig as typeof _parseTsConfig),
	}
})

const getProcessRoot = _getProcessRoot as Mock<typeof _getProcessRoot>
const isExternalPackage = _isExternalPackage as Mock<typeof _isExternalPackage>
const existsSync = _existsSync as Mock<typeof _existsSync>
const readFileSync = _readFileSync as Mock<typeof _readFileSync>
const writeFileSync = _writeFileSync as Mock<typeof _writeFileSync>

const parseTsConfig = _parseTsConfig as Mock<typeof _parseTsConfig>

describe('Post-Install', () => {
	describe('addTypesReference', () => {
		const mockRoot = '/mock/root'
		const mockName = 'mock-package'
		const mockName2 = 'mock-package-2'
		const defaultOutputFile = 'alessiofrittoli-env.d.ts'
		const mockOutputFile = 'mock-env.d.ts'

		let referencesFilePath = ''
		let defaultReferencesFilePath = ''

		beforeEach(() => {
			getProcessRoot.mockReturnValue(mockRoot)
			isExternalPackage.mockReturnValue(true)
			existsSync.mockReturnValue(false)

			vi.spyOn(console, 'log').mockImplementation(() => {})
			vi.spyOn(console, 'error').mockImplementation(() => {})
			vi.spyOn(process, 'exit').mockImplementation(code => {
				throw new Error(`process.exit: ${code}`)
			})

			referencesFilePath = resolve(mockRoot, mockOutputFile)
			defaultReferencesFilePath = resolve(mockRoot, defaultOutputFile)
		})

		afterEach(() => vi.resetAllMocks().resetModules())

		it('creates a new reference file and checks the file is in the program', () => {
			const consoleWarnSpy = vi.spyOn(console, 'warn')

			addTypesReference({ name: mockName })

			const data = `/// <reference types="${mockName}" />\n`
			const comment = '// NOTE: This file should not be edited\n'
			const output = [data, comment].join('\n')

			expect(writeFileSync).toHaveBeenNthCalledWith(1, defaultReferencesFilePath, Buffer.from(output))
			expect(consoleWarnSpy).not.toHaveBeenCalled()
		})

		it('creates a new reference file with custom name', () => {
			addTypesReference({ name: mockName, outputFile: mockOutputFile })

			const data = `/// <reference types="${mockName}" />\n`
			const comment = '// NOTE: This file should not be edited\n'
			const output = [data, comment].join('\n')

			expect(writeFileSync).toHaveBeenNthCalledWith(1, referencesFilePath, Buffer.from(output))
		})

		it('updates the reference file if already exists', () => {
			const data = `/// <reference types="${mockName}" />\n`
			const comment = '// NOTE: This file should not be edited\n'
			const output = [data, comment].join('\n')
			const outputBuffer = Buffer.from(output)

			const dataUpdate = `/// <reference types="${mockName2}" />\n`
			const dataUpdateOutput = Buffer.concat([Buffer.from(dataUpdate), outputBuffer])

			existsSync.mockReturnValueOnce(true) // reference file already exists.

			readFileSync.mockReturnValueOnce(outputBuffer) // return reference file content that need to be updated.

			addTypesReference({ name: mockName2, outputFile: mockOutputFile })

			expect(writeFileSync).toHaveBeenCalledTimes(1) // 1 time - update reference file
			expect(writeFileSync).toHaveBeenCalledWith(referencesFilePath, dataUpdateOutput)
		})

		it('prints a warning if the type reference file is not in the program', () => {
			const consoleWarnSpy = vi.spyOn(console, 'warn')
			parseTsConfig.mockReturnValue({ fileNames: [], errors: [], options: {} })

			addTypesReference({ name: mockName, outputFile: mockOutputFile })

			expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
		})

		it("doesn't update the reference file if reference package is already included", () => {
			const data = `/// <reference types="${mockName}" />\n`
			const comment = '// NOTE: This file should not be edited\n'
			const output = [data, comment].join('\n')
			const outputBuffer = Buffer.from(output)

			existsSync.mockReturnValueOnce(true) // reference file already exists.

			readFileSync
				.mockReturnValueOnce(outputBuffer) // return reference file content that need to be updated.
				.mockReturnValueOnce(Buffer.from(JSON.stringify({ include: [mockOutputFile] }))) // return tsconfig file content to check if it need to be updated.

			addTypesReference({ name: mockName, outputFile: mockOutputFile })
			expect(writeFileSync).not.toHaveBeenCalled() // no need to update since `mockName` package reference is already in there.
		})

		it('log a message and return if the package is not external', () => {
			isExternalPackage.mockReturnValue(false)

			addTypesReference({ name: mockName, outputFile: mockOutputFile })

			expect(console.log).toHaveBeenCalledWith({
				package: mockName,
				message: `Skip "postinstall" script. Running in ${mockName}`,
			})
			expect(writeFileSync).not.toHaveBeenCalled()
		})

		it('exit with code "1" if creating the reference file fails', () => {
			writeFileSync.mockImplementationOnce(() => {
				throw new Error('Failed to write file')
			})

			expect(() => {
				addTypesReference({ name: mockName, outputFile: mockOutputFile })
			}).toThrow('process.exit: 1')

			expect(console.error).toHaveBeenCalledWith(
				new Error(
					`An error occurred while creating "${mockOutputFile}" at the root of your project. Some global types may not work as expected.`,
				),
			)
		})

		it('exit with code "1" if updating the existing reference file fails', () => {
			const data = `/// <reference types="${mockName}" />\n`
			const comment = '// NOTE: This file should not be edited\n'
			const output = [data, comment].join('\n')
			const outputBuffer = Buffer.from(output)

			existsSync.mockReturnValueOnce(true) // check if reference file exists.

			readFileSync.mockReturnValueOnce(outputBuffer) // retrieve reference file content that need to be updated.

			writeFileSync.mockImplementationOnce(() => {
				// the reference file already exists and a simulated error occurs while updating it.
				throw new Error("You don't have enough permissions to edit files.")
			})

			expect(() => addTypesReference({ name: mockName2, outputFile: mockOutputFile })).toThrow(
				'process.exit: 1',
			)

			expect(console.error).toHaveBeenCalledWith(
				new Error(
					`An error occured while editing "${mockOutputFile}" in your project. Some global types may not work as expected.`,
				),
			)
		})
	})
})
