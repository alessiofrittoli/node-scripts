import type { NodeJS } from '@/types'

export const mockGlobalPackages: NodeJS.Deps.Global = {
	name			: 'lib',
	dependencies	: {
		'npm-check-updates': {
			'version': '17.1.11',
			'overridden': false
		},
		'typescript': {
			'version': '5.7.2',
			'overridden': false
		},
	},
}


export const mockGlobalPackagesWithPnpm: NodeJS.Deps.Global = {
	...mockGlobalPackages,
	dependencies: {
		...mockGlobalPackages.dependencies,
		'pnpm': {
			'version': '9.15.2',
			'overridden': false
		},
	},
}