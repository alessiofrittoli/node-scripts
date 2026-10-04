import { getTypedMap } from '@alessiofrittoli/web-utils'
import { execSync as _execSync } from 'child_process'

import {
	getDefaultRemote as _getDefaultRemote,
	getStashBy as _getStashBy,
	popStashByIndex as _popStashByIndex,
} from '@/git'
import { getProcessRoot as _getProcessRoot, getProcessOptions as _getProcessOptions } from '@/process'
import { mockGlobalPackages, mockGlobalPackagesWithPnpm } from '#/__tests__/__mocks__/release.mock'
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { getPackageJson as _getPackageJson } from '@/package'
import { release } from '@/release'
import type { Git } from '@/types'
import * as gitModule from '@/git'

vi.mock('child_process', () => ({
	execSync: vi.fn(),
}))
vi.mock('@/process', () => ({
	getProcessRoot: vi.fn(),
	getProcessOptions: vi.fn(),
}))

vi.mock('@/package', async () => {
	const { getPreReleaseTag } = await vi.importActual('@/package')
	return {
		getPackageJson: vi.fn(),
		getPreReleaseTag,
	}
})

vi.mock('@/git', async () => {
	const { formatStash } = await vi.importActual('@/git')
	return {
		formatStash,
		getDefaultRemote: vi.fn(),
		getStashBy: vi.fn(),
		popStashByIndex: vi.fn(),
	}
})

const execSync = _execSync as Mock
const getProcessRoot = _getProcessRoot as Mock<typeof _getProcessRoot>
const getProcessOptions = _getProcessOptions as Mock<typeof _getProcessOptions>

const getPackageJson = _getPackageJson as Mock<typeof _getPackageJson>

const getDefaultRemote = _getDefaultRemote as Mock<typeof _getDefaultRemote>
const getStashBy = _getStashBy as Mock<typeof _getStashBy>
const popStashByIndex = _popStashByIndex as Mock<typeof _popStashByIndex>

describe('release', () => {
	const mockRoot = '/mock/root'
	const mockDefaultRemoteUrls: Git.Remote.Urls = new Map([
		['fetch', 'upstream\tgit@github.com:username/project-name.git (fetch)'],
		['push', 'upstream\tgit@github.com:username/project-name.git (push)'],
	])
	const mockDefaultRemote = new Map<Git.Remote.MapKey, Git.Remote.MapValue<Git.Remote.MapKey>>([
		['name', 'upstream'],
		['urls', mockDefaultRemoteUrls],
	]) as Git.Remote.Map

	const mockStash = gitModule.formatStash('stash@{0}: On master: pre-release') || undefined
	const mockPopStash = Buffer.from(
		[
			'Already up to date.',
			'no changes added to commit (use "git add" and/or "git commit -a")',
			'Dropped refs/stash@{0} (d566fd42b6785efe70f2c83abcc2374fc054088c)',
		].join('\n'),
	)

	beforeEach(() => {
		execSync.mockImplementation((command: string) => {
			switch (command) {
				case 'npm list --json -g':
					return Buffer.from(JSON.stringify(mockGlobalPackages))
				default:
				// throw new Error( `command not found: ${ command }` )
			}
		})

		getProcessRoot.mockReturnValue(mockRoot)
		getProcessOptions.mockReturnValue(getTypedMap([['--verbose', 'true']]))

		getPackageJson.mockReturnValue({
			version: '1.0.0',
			name: 'test-package',
		})

		getDefaultRemote.mockReturnValue(mockDefaultRemote)
		getStashBy.mockReturnValue(mockStash)
		popStashByIndex.mockReturnValue(mockPopStash)

		vi.spyOn(console, 'log').mockImplementation(() => {})
		vi.spyOn(console, 'error').mockImplementation(() => {})
		vi.spyOn(process, 'exit').mockImplementation(code => {
			throw new Error(`process.exit: ${code}`)
		})
	})

	afterEach(() => {
		vi.resetAllMocks().resetModules()
	})

	it('executes the release process correctly', () => {
		release()

		expect(execSync).toHaveBeenNthCalledWith(1, 'npm list --json -g')
		expect(execSync).toHaveBeenNthCalledWith(2, 'git stash save -u -m "pre-release"', {
			stdio: 'inherit',
		})
		expect(execSync).toHaveBeenNthCalledWith(3, 'npm run build', { stdio: 'inherit' })
		expect(execSync).toHaveBeenNthCalledWith(4, 'git tag v1.0.0', { stdio: 'inherit' })
		expect(execSync).toHaveBeenNthCalledWith(5, 'git push upstream tag v1.0.0', { stdio: 'inherit' })

		expect(gitModule.popStashByIndex).toHaveBeenCalledWith(0)
	})

	it('executes the release process with `pnpm`', () => {
		execSync.mockImplementation((command: string) => {
			switch (command) {
				case 'npm list --json -g':
					return Buffer.from(JSON.stringify(mockGlobalPackagesWithPnpm))
				default:
			}
		})

		release()

		expect(execSync).toHaveBeenCalledWith('pnpm build', { stdio: 'inherit' })
	})

	it('executes custom build command if build option is set', () => {
		release({ build: 'custom-command' })

		expect(execSync).toHaveBeenCalledWith('npm run custom-command', { stdio: 'inherit' })
	})

	it('executes custom build command if --build option is set', () => {
		getProcessOptions.mockReturnValue(getTypedMap([['--build', 'custom-build']]))

		release()

		expect(execSync).toHaveBeenCalledWith('npm run custom-build', { stdio: 'inherit' })
	})

	it('executes the release process with `npm` if `isPackageInstalled` throws an error', () => {
		getProcessOptions.mockReturnValue(getTypedMap([['--version', '1.0.0']]))

		getPackageJson
			// @ts-expect-error negative testing
			.mockReturnValue(undefined)

		execSync.mockImplementation((command: string) => {
			switch (command) {
				case 'npm list --json -g':
					throw new Error(
						'SyntaxError: JSON Parse error: Unexpected identifier "invalid" - Mock Error',
					)
				default:
			}
		})

		const consoleLogSpy = vi.spyOn(console, 'log')

		release()

		expect(consoleLogSpy).toHaveBeenCalledWith({
			package: undefined,
			message: "Couldn't check if `pnpm` is installed. Using `npm` instead.",
			error: 'SyntaxError: JSON Parse error: Unexpected identifier "invalid" - Mock Error',
		})

		expect(execSync).toHaveBeenCalledWith('npm run build', { stdio: 'inherit' })
	})

	it('push the git tag to "origin" if no --origin has been set or found in the current git configuration', () => {
		getDefaultRemote.mockReturnValue(undefined)

		release()

		expect(execSync).toHaveBeenCalledWith('git push origin tag v1.0.0', { stdio: 'inherit' })
	})

	it('push the git tag to a custom origin using --origin option', () => {
		release({ origin: 'upstream' })

		expect(execSync).toHaveBeenCalledWith('git push upstream tag v1.0.0', { stdio: 'inherit' })
	})

	it('push the git tag to a custom origin using --origin option', () => {
		getProcessOptions.mockReturnValue(getTypedMap([['--origin', 'upstream']]))

		release()

		expect(execSync).toHaveBeenCalledWith('git push upstream tag v1.0.0', { stdio: 'inherit' })
	})

	it("doesn't require a package.json if version option is set", () => {
		release({ verbose: true, version: '1.1.0' })

		expect(execSync).toHaveBeenCalledWith('git tag v1.1.0', { stdio: 'inherit' })
	})

	it("doesn't require a package.json if --version option is set", () => {
		getProcessOptions.mockReturnValue(
			getTypedMap([
				['--verbose', 'true'],
				['--version', '1.0.0'],
			]),
		)

		getPackageJson
			// @ts-expect-error negative testing
			.mockReturnValue(null)

		release()

		expect(execSync).toHaveBeenCalledWith('git tag v1.0.0', { stdio: 'inherit' })

		release({ version: '1.1.0' })

		expect(execSync).toHaveBeenCalledWith('git tag v1.1.0', { stdio: 'inherit' })
	})

	it('publish to npm if --npm flag is set', () => {
		getProcessOptions.mockReturnValue(
			getTypedMap([
				['--verbose', 'true'],
				['--npm', 'true'],
			]),
		)

		release()

		expect(execSync).toHaveBeenCalledWith('npm publish --access public', { stdio: 'inherit' })
	})

	it('publish to npm with restricted access through access option', () => {
		release({ npm: true, access: 'restricted' })

		expect(execSync).toHaveBeenCalledWith('npm publish --access restricted', { stdio: 'inherit' })
	})

	it('publish to npm with restricted access through --access option', () => {
		getProcessOptions.mockReturnValue(
			getTypedMap([
				['--verbose', 'true'],
				['--npm', 'true'],
				['--access', 'restricted'],
			]),
		)

		release()

		expect(execSync).toHaveBeenCalledWith('npm publish --access restricted', { stdio: 'inherit' })
	})

	it('releases pre-releases to npm', () => {
		getProcessOptions.mockReturnValue(
			getTypedMap([
				['--verbose', 'true'],
				['--npm', 'true'],
				['--version', '1.0.0-alpha.1'],
			]),
		)

		release()

		getProcessOptions.mockReturnValue(
			getTypedMap([
				['--verbose', 'true'],
				['--npm', 'true'],
				['--version', '1.0.0-beta.1'],
			]),
		)

		release()

		getProcessOptions.mockReturnValue(
			getTypedMap([
				['--verbose', 'true'],
				['--npm', 'true'],
				['--version', '1.0.0-rc.1'],
			]),
		)

		release()

		expect(execSync).toHaveBeenCalledWith('npm publish --access public --tag alpha', {
			stdio: 'inherit',
		})

		expect(execSync).toHaveBeenCalledWith('npm publish --access public --tag beta', { stdio: 'inherit' })

		expect(execSync).toHaveBeenCalledWith('npm publish --access public --tag rc', { stdio: 'inherit' })
	})

	it('exit with code "1" if an unexpected error occurs', () => {
		execSync.mockImplementation(command => {
			throw new Error(`command not found: ${command.split(' ').at(0)}`)
		})

		expect(() => release()).toThrow('process.exit: 1')
		expect(process.exit).toHaveBeenCalledWith(1)
	})

	it('exit with code "1" if no `--version` option is provided and no version is found in package.json or package.json cannot be found', () => {
		getPackageJson
			// @ts-expect-error negative testing
			.mockReturnValue({})
		getProcessOptions.mockReturnValue(new Map())

		expect(() => release()).toThrow('process.exit: 1')
		expect(process.exit).toHaveBeenCalledWith(1)

		getPackageJson
			// @ts-expect-error negative testing
			.mockReturnValue(undefined)

		expect(() => release()).toThrow('process.exit: 1')
		expect(process.exit).toHaveBeenCalledWith(1)

		getPackageJson
			// @ts-expect-error negative testing
			.mockReturnValue({ version: true })

		expect(() => release()).toThrow('process.exit: 1')
		expect(process.exit).toHaveBeenCalledWith(1)
	})

	it('exit with code "1" if invalid access option is provided', () => {
		getProcessOptions.mockReturnValue(
			getTypedMap([
				['--access', 'invalid'],
				['--npm', 'true'],
			]),
		)

		expect(() => release()).toThrow('process.exit: 1')
		expect(process.exit).toHaveBeenCalledWith(1)
	})

	it("doesn't pop stash if no stash has been found", () => {
		getStashBy.mockReturnValue(undefined)

		release()

		expect(gitModule.popStashByIndex).not.toHaveBeenCalled()
	})
})
