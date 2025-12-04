import { ErrorCode as Exception } from '@alessiofrittoli/exception/code'

export const FileSystem = {
	ENOENT: 'ERR:ENOENT',
} as const

export const ErrorCode = { ...Exception, ...FileSystem }
export type ErrorCode = typeof ErrorCode[ keyof typeof ErrorCode ]