import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { getPackageJson, getPreReleaseTag, isExternalPackage } from '@/package'
import { readFileSync as _readFileSync } from 'fs'
import { resolve as _resolve } from 'path'

vi.mock('fs')
vi.mock('path')

const readFileSync = _readFileSync as Mock<typeof _readFileSync>
const pathResolve = _resolve as Mock<typeof _resolve>

describe('Package', () => {
	const mockRoot = '/mock/root'
	const mockPackage = { name: 'mock-package', version: '0.0.0' }
	const externalPackage = { name: 'external-package', version: '0.0.0' }
	const packageFilepath = `${mockRoot}/package.json`

	beforeEach(() => {
		readFileSync.mockReturnValue(JSON.stringify(mockPackage))
		pathResolve.mockReturnValue(packageFilepath)
	})

	afterEach(() => vi.resetAllMocks().resetModules())

	describe('getPackageJson', () => {
		it('read and parse the package.json file', () => {
			const result = getPackageJson(mockRoot)
			expect(result).toEqual(mockPackage)
			expect(readFileSync).toHaveBeenCalledWith(packageFilepath)
		})

		it('throw an error if the file cannot be read', () => {
			readFileSync.mockImplementation(() => {
				throw new Error('No such file or directory.')
			})

			expect(() => getPackageJson(mockRoot)).toThrow('No such file or directory.')
		})
	})

	describe('isExternalPackage', () => {
		it('returns false if the script is running in the same project', () => {
			const result = isExternalPackage({ root: mockRoot, name: mockPackage.name })
			expect(result).toBe(false)
		})

		it('returns true if the script is running in an external project', () => {
			const result = isExternalPackage({ root: mockRoot, name: externalPackage.name })
			expect(result).toBe(true)
		})

		it('throws an error if the package.json file cannot be read', () => {
			// bad format to negative test
			readFileSync.mockReturnValue(`{"name":"${mockPackage.name}",}`)

			expect(() => isExternalPackage({ root: mockRoot, name: mockPackage.name })).toThrow(
				"Couldn't check if script is running in an external project.",
			)
		})
	})

	describe('getPreReleaseTag', () => {
		it('returns the pre-release tag from the given version', () => {
			expect(getPreReleaseTag('1.0.0-alpha.1')).toBe('alpha')

			expect(getPreReleaseTag('1.0.0-beta.1')).toBe('beta')

			expect(getPreReleaseTag('1.0.0-rc.1')).toBe('rc')
		})

		it('returns null if there is no tag or a non-semantic version is given', () => {
			expect(getPreReleaseTag('1.0.0')).toBeNull()

			expect(getPreReleaseTag('invalid')).toBeNull()
		})
	})
})
