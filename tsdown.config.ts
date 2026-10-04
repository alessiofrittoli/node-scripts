import { tsdownConfig } from '@alessiofrittoli/package-configs/tsdown'
import { resolve } from 'path'

export default tsdownConfig(() => ({
	// entry: ['src/index.ts', 'src/types.ts', 'src/release/index.ts', 'src/postinstall/index.ts'],
	tsconfig: resolve(process.cwd(), 'tsconfig.build.json'),
}))
