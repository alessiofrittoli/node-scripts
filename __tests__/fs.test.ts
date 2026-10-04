import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import type { AbortSignal } from '@alessiofrittoli/abort-controller'
import { getDirectoryTree, forEachDirectoryEntry } from '@/fs'
import { writeFileSync, rmSync, mkdtempSync } from 'fs'
import { Exception } from '@alessiofrittoli/exception'
import type { DirectoryTreeEntry } from '@/fs'
import { join } from 'path'
import { tmpdir } from 'os'

describe('fs', () => {
	const beforeAllScript = (): {
		tempDir: string
		tempSubDir: string
		file1: string
		file2: string
	} => {
		const tempDir = mkdtempSync(join(tmpdir(), 'package-configs-fs-'))
		const tempSubDir = mkdtempSync(join(tempDir, 'subdir'))
		const file1 = join(tempDir, 'file1.txt')
		const file2 = join(tempSubDir, 'file2.txt')

		writeFileSync(file1, 'hello')
		writeFileSync(file2, 'world')

		return { tempDir, tempSubDir, file1, file2 }
	}

	describe('getDirectoryTree', () => {
		let tempDir: string, tempSubDir: string, file1: string, file2: string

		beforeAll(() => {
			const result = beforeAllScript()

			tempDir = result.tempDir
			tempSubDir = result.tempSubDir
			file1 = result.file1
			file2 = result.file2
		})

		afterAll(() => {
			rmSync(tempDir, { recursive: true, force: true })
		})

		it('returns an array with a single file entry if path is a file', () => {
			const entries = getDirectoryTree(file1)

			expect(entries).toHaveLength(1)
			expect(entries[0]?.path).toBe(file1)
			expect(entries[0]?.stats.isFile()).toBe(true)
		})

		it('returns all files and directories recursively', () => {
			const entries = getDirectoryTree(tempDir)
			const paths = entries.map(e => e.path)

			expect(paths).toEqual(expect.arrayContaining([tempDir, tempSubDir, file1, file2]))
		})

		it('excludes specified paths', () => {
			const entries = getDirectoryTree(tempDir, [tempSubDir])
			const paths = entries.map(e => e.path)

			expect(paths).not.toContain(file2)
			expect(paths).not.toContain(tempSubDir)
		})

		it('returns empty array if path is excluded', () => {
			expect(getDirectoryTree(tempDir, [tempDir])).toEqual([])
		})

		it('throws Exception if path does not exist', () => {
			expect(() => getDirectoryTree('/non/existent/path')).toThrow(Exception)
		})
	})

	describe('forEachDirectoryEntry', () => {
		let tempDir: string, tempSubDir: string, file1: string, file2: string

		beforeAll(() => {
			const result = beforeAllScript()

			tempDir = result.tempDir
			tempSubDir = result.tempSubDir
			file1 = result.file1
			file2 = result.file2
		})

		afterAll(() => {
			rmSync(tempDir, { recursive: true, force: true })
		})

		it('calls onIteration for each entry', async () => {
			const onIteration = vi.fn((entry: DirectoryTreeEntry) => entry.path)

			const results = await forEachDirectoryEntry({
				path: tempDir,
				onIteration: onIteration,
			})

			expect(onIteration).toHaveBeenCalled()
			expect(results).toEqual(expect.arrayContaining([tempDir, tempSubDir, file1, file2]))
		})

		it('respects exclude option', async () => {
			const onIteration = vi.fn((entry: DirectoryTreeEntry) => entry.path)

			const results = await forEachDirectoryEntry({
				path: tempDir,
				exclude: [file1],
				onIteration: onIteration,
			})

			expect(results).not.toContain(file1)
		})

		it('stops iteration if signal is aborted', async () => {
			const signal = { aborted: false }

			const onIteration = vi.fn((entry: DirectoryTreeEntry, idx) => {
				if (idx === 1) signal.aborted = true
				return entry.path
			})

			const results = await forEachDirectoryEntry({
				path: tempDir,
				signal: signal as AbortSignal,
				onIteration: onIteration,
			})

			expect(results.length).toBeLessThanOrEqual(2)
		})
	})
})
