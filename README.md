<h1 align="center">Node.js Scripts 🫧</h1>
<h2 align="center">
  Utility library with common Node.js scripts
</h2>
<p align="center">
  <a href="https://npmjs.org/package/@alessiofrittoli/node-scripts">
    <img src="https://img.shields.io/npm/v/@alessiofrittoli/node-scripts" alt="Latest version"/>
  </a>
  <a href="https://coveralls.io/github/alessiofrittoli/node-scripts">
    <img src="https://coveralls.io/repos/github/alessiofrittoli/node-scripts/badge.svg" alt="Test coverage"/>
  </a>
  <a href="https://socket.dev/npm/package/@alessiofrittoli/node-scripts/overview">
    <img src="https://socket.dev/api/badge/npm/package/@alessiofrittoli/node-scripts" alt="Socket Security score"/>
  </a>
  <a href="https://npmjs.org/package/@alessiofrittoli/node-scripts">
    <img src="https://img.shields.io/npm/dm/@alessiofrittoli/node-scripts.svg" alt="npm downloads"/>
  </a>
  <a href="https://bundlephobia.com/package/@alessiofrittoli/node-scripts">
    <img src="https://badgen.net/bundlephobia/dependency-count/@alessiofrittoli/node-scripts" alt="Dependencies"/>
  </a>
  <a href="https://libraries.io/npm/%40alessiofrittoli%2Fnode-scripts">
    <img src="https://img.shields.io/librariesio/release/npm/@alessiofrittoli/node-scripts" alt="Dependencies status"/>
  </a>
</p>
<p align="center">
  <a href="https://bundlephobia.com/package/@alessiofrittoli/node-scripts">
    <img src="https://badgen.net/bundlephobia/min/@alessiofrittoli/node-scripts" alt="minified"/>
  </a>
  <a href="https://bundlephobia.com/package/@alessiofrittoli/node-scripts">
    <img src="https://badgen.net/bundlephobia/minzip/@alessiofrittoli/node-scripts" alt="minizipped"/>
  </a>
  <a href="https://bundlephobia.com/package/@alessiofrittoli/node-scripts">
    <img src="https://badgen.net/bundlephobia/tree-shaking/@alessiofrittoli/node-scripts" alt="Tree shakable"/>
  </a>
</p>
<p align="center">
  <a href="https://github.com/sponsors/alessiofrittoli">
    <img src="https://img.shields.io/static/v1?label=Fund%20this%20package&message=%E2%9D%A4&logo=GitHub&color=%23DB61A2" alt="Fund this package"/>
  </a>
</p>

[sponsor-badge]: https://img.shields.io/static/v1?label=Fund%20this%20package&message=%E2%9D%A4&logo=GitHub&color=%23DB61A2
[sponsor-url]: https://github.com/sponsors/alessiofrittoli

### Table of Content

- [Getting started](#getting-started)
- [Development](#development)
  - [Local development](#local-development)
  - [Production build](#production-build)
  - [Unit tests](#unit-tests)
    - [Run tests with coverage](#run-tests-with-coverage)
  - [Contributing](#contributing)
  - [Security](#security)
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
  - [Release Scripts](#release-scripts)
    - [Release](#release)
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

### Development

Run the following to start development

```shell
nvm use

pnpm i
```

#### Local development

Run the following

```shell
pnpm dev
```

This will generate unminified output code, sourcemaps and will enable source file watcher.

---

#### Production build

Run the following to create a local production build

```shell
pnpm build
```

This will generate minified output code without sourcemaps.

---

#### Unit tests

Run all the defined test suites by running the following:

```shell
# Run tests and watch file changes.
pnpm test:watch

# Run tests in a CI environment.
pnpm test:ci
```

---

##### Run tests with coverage

An HTTP server is then started to serve coverage files from `./coverage` folder.

⚠️ You may see a blank page the first time you run this command. Simply refresh the browser to see the updates.

```shell
pnpm test:coverage:serve
```

---

#### Contributing

Contributions are truly welcome!

Please refer to the [Contributing Doc](./CONTRIBUTING.md) for more information on how to start contributing to this project.

Help keep this project up to date with [GitHub Sponsor][sponsor-url].

[![GitHub Sponsor][sponsor-badge]][sponsor-url]

---

#### Security

If you believe you have found a security vulnerability, we encourage you to **_responsibly disclose this and NOT open a public issue_**. We will investigate all legitimate reports. Email `security@alessiofrittoli.it` to disclose any security vulnerabilities.

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

| Property     | Type     | Description                                                             |
| ------------ | -------- | ----------------------------------------------------------------------- |
| `root`       | `string` | The root directory of the project which is installing your node module. |
| `name`       | `string` | The name of your node module.                                           |
| `outputFile` | `string` | The output file name.                                                   |

</details>

---

###### `AddTypesReferenceOptions`

<details>

<summary>Properties</summary>

| Property     | Type     | Default                    | Description                                      |
| ------------ | -------- | -------------------------- | ------------------------------------------------ |
| `name`       | `string` | -                          | The project name currently executing the script. |
| `outputFile` | `string` | 'alessiofrittoli-env.d.ts' | The \*.d.ts output file name.                    |

</details>

---

###### Type Reference Functions

###### `createReferenceFile`

Creates or updates a reference file with type definitions for a project.

<details>

**Parameters**

| Parameter | Type            | Description                                     |
| --------- | --------------- | ----------------------------------------------- |
| `options` | `CommonOptions` | Common options for the reference file creation. |

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

| Parameter | Type            | Description                                     |
| --------- | --------------- | ----------------------------------------------- |
| `options` | `CommonOptions` | Common options for the reference file creation. |

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

| Parameter | Type                       | Description                                 |
| --------- | -------------------------- | ------------------------------------------- |
| `options` | `AddTypesReferenceOptions` | The options for adding the types reference. |

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
const { addTypesReference } = require('@alessiofrittoli/node-scripts/postinstall')
const project = require('../../package.json')

addTypesReference({
  name: project.name,
  outputFile: `${project.name}.d.ts`, // optional
})
```

Or you can statically pass a `outputFile` to add all your scoped packages in a single file.

```ts
// path-to-my-scripts/ts-setup.js
const { addTypesReference } = require('@alessiofrittoli/node-scripts/postinstall')
const project = require('../../package.json')

addTypesReference({
  name: project.name,
  outputFile: 'my-package-scope-env.d.ts',
})
```

</details>

---

#### Release scripts

##### `release`

The `release` function automates the process of building, tagging, and optionally releasing a project to npm.

This function either works with process options (passed via CLI) or function arguments (function arguments takes precedence over process options).

<details>

<summary>Arguments</summary>

| Argument  | Type                 | Default                                     | Description                                                                           |
| --------- | -------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------- |
| `version` | `string`             | `--version` process option or package.json. | The version to release.                                                               |
|           |                      |                                             | Retrieved from `--version` process option or package.json if omitted.                 |
| `build`   | `string`             | 'build'                                     | A custom build command that will build your project before publish.                   |
|           |                      |                                             | Retrieved from `--build` process option or fallback to `build` if omitted.            |
| `verbose` | `boolean`            | false                                       | Enables detailed logging.                                                             |
|           |                      |                                             | Retrieved from `--verbose` process option or fallback to `false` if omitted.          |
| `origin`  | `string`             | 'origin'                                    | The Git origin name used for pushing version tags.                                    |
|           |                      |                                             | Retrieved from `--origin` or `--o` process option or fallback to `origin` if omitted. |
| `npm`     | `boolean`            | false                                       | Indicates whether to publish the package to npm.                                      |
|           |                      |                                             | Retrieved from `--npm` process option or fallback to `false` if omitted.              |
| `access`  | `public\|restricted` | 'public'                                    | Sets npm package access level.                                                        |
|           |                      |                                             | Retrieved from `--access` process option or fallback to `public` if omitted.          |

</details>

---

<details>

<summary>Process Options - CLI</summary>

| Option           | Type                 | Default                 | Description                                                         |
| ---------------- | -------------------- | ----------------------- | ------------------------------------------------------------------- |
| `--version`      | `string`             | Value from package.json | The version to release. Retrieved from package.json if omitted.     |
|                  |                      |                         | Retrieved from package.json if omitted.                             |
| `--build`        | `string`             | `build`                 | A custom build command that will build your project before publish. |
| `--verbose`      | `boolean`            | `false`                 | Enables detailed logging.                                           |
| `--origin`, `-o` | `string`             | 'origin'                | The Git origin name used for pushing version tags.                  |
| `--npm`          | `boolean`            | `false`                 | Indicates whether to publish the package to npm.                    |
| `--access`       | `public\|restricted` | 'public'                | Sets npm package access level.                                      |

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

- Logs details of the release process if the `--verbose` flag is set.

</li>
</ol>

</details>

---

<details>

<summary>Example usage</summary>

###### Using function arguments

Add the `release` script in your `package.json` file so you can easly run from your terminal.

```json
{
  // ...
  "scripts": {
    // ...
    "release": "node path-to-my-scripts/release.js"
  }
}
```

Then in your `release.js` file simply import the script and execute it.

⚠️ Remember to add this file to `.npmignore` so it won't be published within you package.

```ts
// path-to-my-scripts/release.js
require('@alessiofrittoli/node-scripts/release').release({
  verbose: true,
  npm: true,
  access: 'restricted',
})
```

---

###### Using CLI options

Add the `release` script in your `package.json` file so you can easly run from your terminal.

```json
{
  // ...
  "scripts": {
    // ...
    "release": "node path-to-my-scripts/release.js --verbose --npm --access restricted"
  }
}
```

Then in your `release.js` file simply import the script and execute it.

⚠️ Remember to add this file to `.npmignore` so it won't be published within you package.

```ts
// path-to-my-scripts/release.js
require('@alessiofrittoli/node-scripts/release').release()
```

</details>

---

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
