import type { NodeJS } from '@/types'

export const mockGlobalPackages: NodeJS.Deps.Global = {
	name			: 'lib',
	dependencies	: {
		'global-package': {
			version		: '0.0.0',
			overridden	: false,
		}
	},
}


export const noDepsGlobalPackages: NodeJS.Deps.Global = {
	name: 'lib',
}


export const mockLocalPackages: NodeJS.Deps.Local = {
	name			: 'package-name',
	version			: '0.0.0',
	dependencies	: {
		'package-dep': {
			version		: '0.0.0',
			overridden	: false,
			resolved	: 'file:../path/to/package/folder',
		}
	},
}