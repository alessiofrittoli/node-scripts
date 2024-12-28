# Node.js Scripts 🫧

Version 2.1.0

## Utility library with common Node.js scripts

### Table of Contents

- [Getting started](#getting-started)
- [Security](#security)
- [Credits](#made-with-)

---

### Getting started

Run the following command to start using `node-scripts` in your projects:

```bash
npm i @alessiofrittoli/node-scripts
```

or using `pnpm`

```bash
pnpm i @alessiofrittoli/node-scripts
```

---

### Types API Reference

#### `AddTypesReferenceOptions`

<details>

<summary>Properties</summary>

| Property     | Type     | Default | Description |
|--------------|----------|---------|-------------|
| `name`       | `string` | - | The project name currently executing the script. |
| `outputFile` | `string` | 'alessiofrittoli-env.d.ts' | The *.d.ts output file name. |

</details>

#### Package
#### Publish
#### NodeJS
#### Git

### API Reference

#### Post-Install scripts

##### TypeScript Type Reference Management

The `addTypesReference` function allows you to create and manage TypeScript reference files and update the related `tsconfig.json` file for a project installing your node_module.

Below are the detailed descriptions of the interfaces and functions included.

###### Table of Contents

- Interfaces
	- `CommonOptions`
- Functions
	- `createReferenceFile`
	- `updateTsConfig`
	- `addTypesReference`

###### Interfaces

###### `CommonOptions`

Extends: `Package`

- See [Package](#package) interface in [Types API Reference](#types-api-reference) section.

<details>

<summary>Properties</summary>

| Property     | Type     | Description |
|--------------|----------|-------------|
| `root`       | `string` | The root directory of the project which is installing your node module. |
| `name`       | `string` | The name of your node module. |
| `outputFile` | `string` | The output file name. |

</details>

###### Functions

###### `createReferenceFile`

Creates or updates a reference file with type definitions for a project.

**Parameters**

| Parameter    | Type            | Description |
|--------------|-----------------|-------------|
| `options`    | `CommonOptions` | Common options for the reference file creation. |

- See [CommonOptions](#commonoptions) interface.

**Returns**

`void`

**Throws**

`Error` - Throws an error if there is an issue creating or updating the file.

###### `updateTsConfig`

Updates the tsconfig.json file by adding the specified output file to the `include` array.

| Parameter    | Type            | Description |
|--------------|-----------------|-------------|
| `options`    | `CommonOptions` | Common options for the reference file creation. |

- See [CommonOptions](#commonoptions) interface.

**Returns**

`void`

**Throws**

`Error` - Throws an error if the tsconfig.json file cannot be read or updated.

###### `addTypesReference`

Adds a TypeScript reference file and updates the tsconfig.json for the project installing your node module.

If the `options.outputFile` already exists, it will be updated with the new package reference if not already in there.

| Parameter    | Type            | Description |
|--------------|-----------------|-------------|
| `options`    | `AddTypesReferenceOptions` | The options for adding the types reference. |

- See [AddTypesReferenceOptions](#addtypesreferenceoptions) interface.

**Returns**

`void`

**Error**

Exit the process with code `1` on failure.

<details>

<summary>Example usage</summary>

Add the `postinstall` script in your `package.json` file which will execute the scritp once your package get installed in an external project.

```json
{
	// ...
	"files": [
		// ...,
		"path-to-my-scripts" // ensure folder is published to `npm`
	],
	"scripts": {
		// ...
		"postinstall": "node path-to-my-scripts/ts-setup.js"
	}
}
```

Then in your `ts-setup.js` file simply import the script and execute it with a few options:

```ts
// path-to-my-scripts/ts-setup.js
const { addTypesReference } = require( '@alessiofrittoli/node-scripts/postinstall' )
const project = require( '../../package.json' )

addTypesReference( {
	name: project.name,
	outputFile: `${ project.name }.d.ts`, // optional
} )
```

Or you can statically pass a `outputFile` to add all your scoped packages in a single file.

```ts
// path-to-my-scripts/ts-setup.js
const { addTypesReference } = require( '@alessiofrittoli/node-scripts/postinstall' )
const project = require( '../../package.json' )

addTypesReference( {
	name: project.name,
	outputFile: 'my-package-scope-env.d.ts',
} )
```

</details>

---

#### Publish scripts

---

#### Internal Utility functions

##### GIT functions

---

##### `package.json` functions

---

##### Node.js Process functions

---


---
---
---

<!-- ### Development

#### Install depenendencies

```bash
npm install
```

or using `pnpm`

```bash
pnpm i
```

#### Build your source code

Run the following command to build code for distribution.

```bash
pnpm build
```

#### [ESLint](https://www.npmjs.com/package/eslint)

warnings / errors check.

```bash
pnpm lint
```

#### [Jest](https://npmjs.com/package/jest)

Run all the defined test suites by running the following:

```bash
# Run tests and watch file changes.
pnpm test

# Run tests and watch file changes with jest-environment-jsdom.
pnpm test:jsdom

# Run tests in a CI environment.
pnpm test:ci

# Run tests in a CI environment with jest-environment-jsdom.
pnpm test:ci:jsdom
```

You can eventually run specific suits like so:

```bash
pnpm test:jest
pnpm test:jest:jsdom
```

Run tests with coverage.

An HTTP server is then started to serve coverage files from `./coverage` folder.

⚠️ You may see a blank page the first time you run this command. Simply refresh the browser to see the updates.

```bash
pnpm test:coverage
```

---

### Contributing

Contributions are truly welcome!\
Please refer to the [Contributing Doc](./CONTRIBUTING.md) for more information on how to start contributing to this project.

--- -->

### Security

If you believe you have found a security vulnerability, we encourage you to **_responsibly disclose this and NOT open a public issue_**. We will investigate all legitimate reports. Email `security@alessiofrittoli.it` to disclose any security vulnerabilities.

### Made with ☕

<table style='display:flex;gap:20px;'>
	<tbody>
		<tr>
			<td>
				<img src='https://avatars.githubusercontent.com/u/35973186' style='width:60px;border-radius:50%;object-fit:contain;'>
			</td>
			<td>
				<table style='display:flex;gap:2px;flex-direction:column;'>
					<tbody>
						<tr>
							<td>
								<a href='https://github.com/alessiofrittoli' target='_blank' rel='noopener'>Alessio Frittoli</a>
							</td>
						</tr>
						<tr>
							<td>
								<small>
									<a href='https://alessiofrittoli.it' target='_blank' rel='noopener'>https://alessiofrittoli.it</a> |
									<a href='mailto:info@alessiofrittoli.it' target='_blank' rel='noopener'>info@alessiofrittoli.it</a>
								</small>
							</td>
						</tr>
					</tbody>
				</table>
			</td>
		</tr>
	</tbody>
</table>