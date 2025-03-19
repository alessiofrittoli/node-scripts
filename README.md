# Node.js Scripts 🫧

[![NPM Latest Version][version-badge]][npm-url] [![Coverage Status][coverage-badge]][coverage-url] [![NPM Monthly Downloads][downloads-badge]][npm-url] [![Dependencies][deps-badge]][deps-url]

[![GitHubSponsor][sponsor-badge]][sponsor-url]

[version-badge]: https://img.shields.io/npm/v/%40alessiofrittoli%2Fnode-scripts
[npm-url]: https://npmjs.org/package/%40alessiofrittoli%2Fnode-scripts
[coverage-badge]: https://coveralls.io/repos/github/alessiofrittoli/node-scripts/badge.svg
[coverage-url]: https://coveralls.io/github/alessiofrittoli/node-scripts
[downloads-badge]: https://img.shields.io/npm/dm/%40alessiofrittoli%2Fnode-scripts.svg
[deps-badge]: https://img.shields.io/librariesio/release/npm/%40alessiofrittoli%2Fnode-scripts
[deps-url]: https://libraries.io/npm/%40alessiofrittoli%2Fnode-scripts

[sponsor-badge]: https://img.shields.io/static/v1?label=Fund%20this%20package&message=%E2%9D%A4&logo=GitHub&color=%23DB61A2
[sponsor-url]: https://github.com/sponsors/alessiofrittoli

## Utility library with common Node.js scripts

### Table of Contents

- [Getting started](#getting-started)
- [API Reference](#api-reference)
  - [Post-Install scripts](#post-install-scripts)
    - [TypeScript Type Reference Management](#typescript-type-reference-management)
      - [Type Reference Interfaces](#type-reference-interfaces)
        - [`CommonOptions`](#commonoptions)
        - [`AddTypesReferenceOptions`](#addtypesreferenceoptions)
      - [Type Reference Functions](#type-reference-functions)
        - [`createReferenceFile`](#createreferencefile)
        - [`updateTsConfig`](#updatetsconfig)
        - [`addTypesReference`](#addtypesreference)
      - [Add Types Reference Example usage](#add-types-reference-example-usage)
  - [Publish Scripts](#publish-scripts)
    - [Publish](#publish)
- [Development](#development)
  - [Install depenendencies](#install-depenendencies)
  - [Build the source code](#build-the-source-code)
  - [ESLint](#eslint)
  - [Jest](#jest)
  - [Contributing](#contributing)
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

### API Reference

#### Post-Install scripts

##### TypeScript Type Reference Management

The `addTypesReference` function allows you to create and manage TypeScript reference files and update the related `tsconfig.json` file for a project installing your node module.

Below are the detailed descriptions of the interfaces and functions included.

###### Type Reference Interfaces

###### `CommonOptions`

<details>

<summary>Properties</summary>

| Property     | Type     | Description |
|--------------|----------|-------------|
| `root`       | `string` | The root directory of the project which is installing your node module. |
| `name`       | `string` | The name of your node module. |
| `outputFile` | `string` | The output file name. |

</details>

---

###### `AddTypesReferenceOptions`

<details>

<summary>Properties</summary>

| Property     | Type     | Default | Description |
|--------------|----------|---------|-------------|
| `name`       | `string` | - | The project name currently executing the script. |
| `outputFile` | `string` | 'alessiofrittoli-env.d.ts' | The *.d.ts output file name. |

</details>

---

###### Type Reference Functions

###### `createReferenceFile`

Creates or updates a reference file with type definitions for a project.

<details>

**Parameters**

| Parameter    | Type            | Description |
|--------------|-----------------|-------------|
| `options`    | `CommonOptions` | Common options for the reference file creation. |

- See [CommonOptions](#commonoptions) interface.

**Returns**

`void`

**Throws**

`Error` - Throws an error if there is an issue creating or updating the file.

</details>

###### `updateTsConfig`

Updates the tsconfig.json file by adding the specified output file to the `include` array.

<details>

**Parameters**

| Parameter    | Type            | Description |
|--------------|-----------------|-------------|
| `options`    | `CommonOptions` | Common options for the reference file creation. |

- See [CommonOptions](#commonoptions) interface.

**Returns**

`void`

**Throws**

`Error` - Throws an error if the tsconfig.json file cannot be read or updated.

</details>

###### `addTypesReference`

Adds a TypeScript reference file and updates the tsconfig.json for the project installing your node module.

If the `options.outputFile` already exists, it will be updated with the new package reference if not already in there.

<details>

**Parameters**

| Parameter    | Type            | Description |
|--------------|-----------------|-------------|
| `options`    | `AddTypesReferenceOptions` | The options for adding the types reference. |

- See [AddTypesReferenceOptions](#addtypesreferenceoptions) interface.

**Returns**

`void`

**Error**

Exit the process with code `1` on failure.

</details>

---

###### Add Types Reference Example usage

<details>

Add the `postinstall` script in your `package.json` file which will execute the script once your package get installed in an external project.

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

Then in your `ts-setup.js` file simply import the script and execute it with a few options.

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

##### `publish`

The `publish` function automates the process of building, tagging, and optionally publishing a project to npm.

<details>

<summary>Process Options</summary>

| Option           | Type                   | Default                 | Description |
|------------------|------------------------|-------------------------|-------------|
| `--version`      | `string`               | Value from package.json | The version to release. Retrieved from package.json if omitted. |
| `--verbose`      | `boolean \| undefined` | `false`                 | Enables detailed logging. |
| `--origin`, `-o` | `string`               | 'origin'                | The Git origin for pushing tags. |
| `--npm`          | `boolean \| undefined` | `false`                 | Indicates whether to publish the package to npm. |
| `--access`       | `public \| restricted` | 'public'                | Sets npm access level (public or restricted). |

</details>

---

<details>

<summary>Performed steps</summary>

<ol>
<li>
Retrieve package.json:

- Attempts to load and parse the `package.json` file.
- Exits the process with code "1" if the file is unavailable or invalid.
- Retrieve the version to use as fallback if no `--version` option has been provided.

</li>
<li>
Parse Options:

- Retrieves CLI options using `getProcessOptions()`.
- Validates critical parameters such as `version` and `access`.

</li>
<li>
Prepare Git and Build:

- Stashes any uncommitted changes with a stash name (`pre-release`).
- Executes the `npm run build` or `pnpm build` command (if `pnpm` is globally installed).
- Create the Git Tag as `v{version}`
- Push the Git Tag the the specified `origin` or to the default Git Repository Remote.

</li>
<li>
Publish to npm (Optional):

- Publishes the package using `npm publish` if the `--npm` flag is set.

</li>
<li>
Restore Stash:

- Restores the stashed changes if any were saved during the process.

</li>
<li>
Verbose Logging:

- Logs details of the publish process if the `--verbose` flag is set.

</li>
</ol>

</details>

---

<details>

<summary>Example usage</summary>

Add the `release` script in your `package.json` file so you can easly run from your terminal.

```json
{
    // ...
    "scripts": {
        // ...
        "release": "node path-to-my-scripts/publish.js --verbose --npm --access restricted"
    }
}
```

Then in your `publish.js` file simply import the script and execute it.

⚠️ Remember to add this file to `.npmignore` so it won't be published within you package.

```ts
// path-to-my-scripts/publish.js
require( '@alessiofrittoli/node-scripts/publish' )
    .publish()
```

</details>

---

### Development

#### Install depenendencies

```bash
npm install
```

or using `pnpm`

```bash
pnpm i
```

#### Build the source code

Run the following command to test and build code for distribution.

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
pnpm test:watch

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
test:coverage:serve
```

---

### Contributing

Contributions are truly welcome!

Please refer to the [Contributing Doc](./CONTRIBUTING.md) for more information on how to start contributing to this project.

Help keep this project up to date with [GitHub Sponsor][sponsor-url].

[![GitHubSponsor][sponsor-badge]][sponsor-url]

---

### Security

If you believe you have found a security vulnerability, we encourage you to **_responsibly disclose this and NOT open a public issue_**. We will investigate all legitimate reports. Email `security@alessiofrittoli.it` to disclose any security vulnerabilities.

### Made with ☕

<table style='display:flex;gap:20px;'>
  <tbody>
    <tr>
      <td>
        <img alt="avatar" src='https://avatars.githubusercontent.com/u/35973186' style='width:60px;border-radius:50%;object-fit:contain;'>
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
