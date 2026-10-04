import { existsSync as _existsSync, readFileSync as _readFileSync, writeFileSync as _writeFileSync } from 'fs'
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { isExternalPackage as _isExternalPackage } from '@/package'
import { addTypesReference } from '@/postinstall/types-reference'
import { getProcessRoot as _getProcessRoot } from '@/process'
import { resolve as _resolve } from 'path'

vi.mock('fs')
vi.mock('path')
vi.mock('@/process')
vi.mock('@/package')

const getProcessRoot = _getProcessRoot as Mock<typeof _getProcessRoot>
const isExternalPackage = _isExternalPackage as Mock<typeof _isExternalPackage>
const resolve = _resolve as Mock<typeof _resolve>
const existsSync = _existsSync as Mock<typeof _existsSync>
const readFileSync = _readFileSync as Mock<typeof _readFileSync>
const writeFileSync = _writeFileSync as Mock<typeof _writeFileSync>

describe('Post-Install', () => {
	describe('addTypesReference', () => {
		const mockRoot = '/mock/root'
		const mockName = 'mock-package'
		const mockName2 = 'mock-package-2'
		const mockOutputFile = 'mock-env.d.ts'
		const mockTsConfig = { include: [] }
		let mockTsConfigPath = ''
		let referencesFilePath = ''
		let defaultReferencesFilePath = ''

		beforeEach(() => {
			getProcessRoot.mockReturnValue(mockRoot)
			isExternalPackage.mockReturnValue(true)
			resolve.mockImplementation((...args) => args.join('/'))
			existsSync.mockReturnValue(false)
			readFileSync.mockReturnValue(Buffer.from(JSON.stringify(mockTsConfig)))

			vi.spyOn(console, 'log').mockImplementation(() => {})
			vi.spyOn(console, 'error').mockImplementation(() => {})
			vi.spyOn(process, 'exit').mockImplementation(code => {
				throw new Error(`process.exit: ${code}`)
			})

			mockTsConfigPath = resolve(mockRoot, 'tsconfig.json')
			referencesFilePath = resolve(mockRoot, mockOutputFile)
			defaultReferencesFilePath = resolve(mockRoot, 'alessiofrittoli-env.d.ts')
		})

		afterEach(() => vi.resetAllMocks().resetModules())

		it('creates a new reference file and update "tsconfig.json"', () => {
			addTypesReference({ name: mockName })

			const data = `/// <reference types="${mockName}" />\n`
			const comment = '// NOTE: This file should not be edited'
			const output = [data, comment].join('\n')

			expect(writeFileSync).toHaveBeenNthCalledWith(1, defaultReferencesFilePath, Buffer.from(output))

			expect(writeFileSync).toHaveBeenNthCalledWith(
				2,
				mockTsConfigPath,
				Buffer.from(JSON.stringify({ include: ['alessiofrittoli-env.d.ts'] }, undefined, '\t')),
			)
		})

		it('creates a new reference file with custom name and update "tsconfig.json"', () => {
			addTypesReference({ name: mockName, outputFile: mockOutputFile })

			const data = `/// <reference types="${mockName}" />\n`
			const comment = '// NOTE: This file should not be edited'
			const output = [data, comment].join('\n')

			expect(writeFileSync).toHaveBeenNthCalledWith(1, referencesFilePath, Buffer.from(output))

			expect(writeFileSync).toHaveBeenNthCalledWith(
				2,
				mockTsConfigPath,
				Buffer.from(JSON.stringify({ include: [mockOutputFile] }, undefined, '\t')),
			)
		})

		it('updates the reference file if already exists', () => {
			const data = `/// <reference types="${mockName}" />\n`
			const comment = '// NOTE: This file should not be edited'
			const output = [data, comment].join('\n')
			const outputBuffer = Buffer.from(output)
			const dataUpdate = `/// <reference types="${mockName2}" />\n`
			const dataUpdateOutput = Buffer.concat([Buffer.from(dataUpdate), outputBuffer])

			existsSync.mockReturnValueOnce(true) // reference file already exists.

			readFileSync
				.mockReturnValueOnce(outputBuffer) // return reference file content that need to be updated.
				.mockReturnValueOnce(Buffer.from(JSON.stringify({ include: [mockOutputFile] }))) // return tsconfig file content to check if it need to be updated.

			addTypesReference({ name: mockName2, outputFile: mockOutputFile })

			expect(writeFileSync).toHaveBeenCalledTimes(1) // 1 time - update reference file
			expect(writeFileSync).toHaveBeenCalledWith(referencesFilePath, dataUpdateOutput)
		})

		it("doesn't update the reference file if reference is already included", () => {
			const data = `/// <reference types="${mockName}" />\n`
			const comment = '// NOTE: This file should not be edited'
			const output = [data, comment].join('\n')
			const outputBuffer = Buffer.from(output)

			existsSync.mockReturnValueOnce(true) // reference file already exists.

			readFileSync
				.mockReturnValueOnce(outputBuffer) // return reference file content that need to be updated.
				.mockReturnValueOnce(Buffer.from(JSON.stringify({ include: [mockOutputFile] }))) // return tsconfig file content to check if it need to be updated.

			addTypesReference({ name: mockName, outputFile: mockOutputFile })
			expect(writeFileSync).not.toHaveBeenCalled() // no need to update since `mockName` package reference is already in there.
		})

		it('doesn\'t update "tsconfig.json" if reference file is already included', () => {
			readFileSync.mockReturnValue(JSON.stringify({ include: [mockOutputFile] }))

			addTypesReference({ name: mockName, outputFile: mockOutputFile })

			const data = `/// <reference types="${mockName}" />\n`
			const comment = '// NOTE: This file should not be edited'
			const output = [data, comment].join('\n')

			expect(writeFileSync).toHaveBeenCalledTimes(1)
			expect(writeFileSync).toHaveBeenNthCalledWith(1, referencesFilePath, Buffer.from(output))
		})

		it('adds `include` property if missing in "tsconfig.json" file', () => {
			readFileSync.mockReturnValue(JSON.stringify({}))

			addTypesReference({ name: mockName, outputFile: mockOutputFile })

			expect(writeFileSync).toHaveBeenNthCalledWith(
				2,
				mockTsConfigPath,
				Buffer.from(JSON.stringify({ include: [mockOutputFile] }, undefined, '\t')),
			)
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
			const comment = '// NOTE: This file should not be edited'
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

		it('exit with code "1" if updating "tsconfig.json" fails', () => {
			writeFileSync
				.mockImplementationOnce(() => {})
				.mockImplementationOnce(() => {
					throw new Error('Failed to write file')
				})

			expect(() => addTypesReference({ name: mockName, outputFile: mockOutputFile })).toThrow(
				'process.exit: 1',
			)

			expect(console.error).toHaveBeenCalledWith(
				new Error('An error occured while updating your "tsconfig.json" file.'),
			)
		})
	})
})
