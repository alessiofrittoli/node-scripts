export interface AddTypesReferenceOptions
{
	/** The project name currently executing the script. */
	projectName: string
	/** The `*.d.ts` output file name. Default: `alessiofrittoli-env.d.ts`. */
	outputFile?: string
}