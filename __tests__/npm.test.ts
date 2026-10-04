import { mockGlobalPackages, mockLocalPackages, noDepsGlobalPackages } from '#/__tests__/__mocks__/npm.mock'
import { afterEach, describe, expect, it, vi, type Mock } from 'vitest'
import { getPackage, isPackageInstalled } from '@/npm'
import { execSync as _execSync } from 'child_process'

vi.mock('child_process')

const execSync = _execSync as Mock<typeof _execSync>

describe('NPM', () => {
	afterEach(() => {
		vi.resetAllMocks().resetModules()
	})

	const localPackages = JSON.stringify(mockLocalPackages)
	const globalPackages = JSON.stringify(mockGlobalPackages)
	const noDepsPackages = JSON.stringify(noDepsGlobalPackages)

	describe('getPackage', () => {
		it('retrieves local npm packages', () => {
			execSync.mockReturnValueOnce(Buffer.from(localPackages))

			const result = getPackage()
			expect(execSync).toHaveBeenCalledWith('npm list --json')
			expect(result).toEqual(JSON.parse(localPackages))
		})

		it('retrieves global npm packages', () => {
			execSync.mockReturnValueOnce(Buffer.from(globalPackages))

			const result = getPackage(true)
			expect(execSync).toHaveBeenCalledWith('npm list --json -g')
			expect(result).toEqual(JSON.parse(globalPackages))
		})
	})

	describe('isPackageInstalled', () => {
		it('returns `true` if the package is installed locally', () => {
			execSync.mockReturnValueOnce(Buffer.from(localPackages))
			expect(isPackageInstalled('package-dep')).toBe(true)
		})

		it('returns `false` if the package is not installed locally', () => {
			execSync.mockReturnValueOnce(Buffer.from(localPackages))

			expect(isPackageInstalled('non-existent-package')).toBe(false)
		})

		it('returns `true` if the package is installed globally', () => {
			execSync.mockReturnValueOnce(Buffer.from(globalPackages))

			expect(isPackageInstalled('global-package', true)).toBe(true)
		})

		it('returns `false` if the package is not installed globally', () => {
			execSync.mockReturnValueOnce(Buffer.from(globalPackages))

			expect(isPackageInstalled('non-existent-package', true)).toBe(false)
		})

		it('returns `false` if `dependencies` is not defined in package details returned by `getPackage`', () => {
			execSync.mockReturnValueOnce(Buffer.from(noDepsPackages))
			expect(isPackageInstalled('some-package')).toBe(false)
		})
	})
})
