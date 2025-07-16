import { ErrorCode as Exception } from '@alessiofrittoli/exception/code'

export enum FileSystem
{
	ENOENT = 'ERR:ENOENT',
}

export const ErrorCode = { ...Exception, ...FileSystem }
export type ErrorCode = MergedEnumValue<typeof ErrorCode>