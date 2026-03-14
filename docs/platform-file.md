# Platform declaration file

The platform declaration file describes the configuration of a Heta modeling platform.  
It is located in the root directory of the project and is used by the `heta build` command.

By default, the file is named **platform.yml**, but **platform.json** and **platform** (without extension) are also supported.

The declaration file can be in one of the following formats:  [JSON](https://en.wikipedia.org/wiki/JSON) or [YAML](https://en.wikipedia.org/wiki/YAML) with the same schema.

The declaration file serves two purposes:

- **Platform annotation** – provides metadata about the modeling platform such as identifier, version, contributors, repository, and other descriptive information.
- **Compiler configuration** – defines how Heta compiler should locate model sources, configure compilation options, and export results.

Using a declaration file allows storing the build configuration inside the project instead of specifying many options in the command line.

## Using platform file with `heta build`

When a platform declaration file is present, the `heta build` command automatically reads it and applies the configuration defined inside the file.

By default the compiler searches for the declaration file. If the file is found, its settings are used to configure the compilation process.

If no declaration file is present, Heta compiler runs with default settings. Command line options override values defined in the declaration file.

If you want to use a declaration file with a different name, specify it using the `--declaration` option:

```bash
heta build --declaration my-platform
```

## Platform file structure

There are properties in the declaration file which do not change the compilation process. They can be used for annotation of a developed QSP platform for summarizing annotations and auxiliary information.

| option | type | CLI option | default value | description |
|--|--|--|--|--|
| id | string ||| This is a unique identifier of modeling platform. Do not use spaces. *Annotation element*  |
| notes | string ||| Put a description in it. This helps people discover your package. *Annotation element.*|
| version | string ||| Version of the platform. Substantial changes to the platform should come along with changes to the version. It is recommended to follow [semver](https://semver.org/) rules. |
| keywords | string[] ||| Array of keywords for possible indexing platform. This helps people discover your package. *Annotation element.* |
| homepage | string ||| The URL to the page supporting the platform. *Annotation element.* |
| repository | object || {} | Specify the place where your code lives. This is helpful for people who want to contribute. |
| repository.type | string ||| Type of repository, for example: "git", "svn". *Annotation element.* |
| repository.url | string ||| The URL of source repository, for example: "https://github.com/insysbio/heta-case-mini.git". *Annotation element.* |
| license | string ||| Short identifier under which license the platform is distributed. It is important especially for Open source platfroms. If you’re using a common license such as BSD-2-Clause or MIT, add a current [SPDX license identifier](https://spdx.org/licenses/). *Annotation element.* |
| private | boolean ||| Set true if a platform must not be shared in public repositories. *Annotation element.* |
| contributors | string[] ||| Array of authors and contributors. Please follow the format "Albert Einstein <albert.einstein@gmail.com> (https://einstein.org/cv)" *Annotation element.* |
| builderVersion | string ||| The required version of Heta compiler which should compile the code. This prevents running the old compiler for the updated QSP platforms. The string must follow the rules of [semantic versioning](https://docs.npmjs.com/about-semantic-versioning). See also [semantic versioning calculator](https://semver.npmjs.com/). |
| importModule | object | | {} | Container for the description of index module. |
| importModule.source | string | --source | index.heta | Path to index heta module. Absolute and relative filepaths are applicable. Example: "src/table.xlsx" |
| importModule.type | string | --type | heta | Type of source file. This option sets the type of module which will be applied for parsing. Available values: heta/xlsx/json/yaml/sbml. |
| options | object | | {} | A set of compiler options. |
| options.unitsCheck | boolean | --units-check | false | If `true` all Record will be checked for units consistency. |
| options.distDir | string | --dist-dir | dist | By default all export files are created inside **dist** directory. The option can set the another target for storing outputs. |
| options.debug | boolean | --debug | false | Working in debugging mode. All parsed modules will be saved in JSON files in the meta directory. |
| options.metaDir | string | --meta-dir | meta | If `options.debug` is set as `true` this option changes the target directory for meta files. |
| export | object[] | -e, --export | `[]` | List of export formats to run separated by colon. Each component includes `format` option and optional settings. See more details in [export-formats](./export-formats.md). |

## Default configuration

Using neither declaration file nor CLI options is equivalent to the following declaration file:
```json
{
    "builderVersion": "*",
    "options": {
        "distDir": "dist",
        "metaDir": "meta",
        "debug": false,
        "unitsCheck": false
    },
    "importModule": {
        "source": "index.heta",
        "type": "heta"
    },
    "export": []
}
```
