# Command Line Interface

*This page describe how to work with Heta compiler from the console (shell).*

If `heta` command is not available check your Heta compiler [installation](./README) and content of system paths (`PATH` variable in Windows).

## Table of contents

- ["heta" command](#quothetaquot-command)
- ["heta build" command](#quotheta-buildquot-command)
- ["heta init" command](#quotheta-initquot-command)
- ["heta help" command](#quotheta-helpquot-command)
- [Declaration file format](#declaration-file-format)

## "heta" command

`heta` is the prefix command for working with the tools. Writing the command alone prints the information about the tool and available options. `heta help` does the same.

```
$ heta
Usage: heta [options] [command]

Command line utilities for working with Heta compiler
  version: 0.4.31
  license: Apache-2.0

Options:
  -v, --version  output the version number
  -h, --help     output usage information

Commands:
  build [dir]    Compile Heta-based platform and create set of export files.
  init [dir]     Create template platform files in directory
  help [cmd]     display help for [cmd]
```

## "heta build" command

`heta build` runs the compilation of the platform.
It uses the main source file (index) as an initial point to compile the platform.

The default run of `heta build` (no options set, no configuration file) will do the following:

1. Looking for **index.heta** in parent working directory of shell.
2. Running parsing of index file as module of type "heta" and all files (modules) mentioned by `include` statement inside `index.heta`.
4. Creation of export files declared by `#export` actions to **dist/** directory.
5. If there are compiling errors the file **build.log** will be created in working directory.

### Running build with CLI options

CLI options allow setting specific options for build command. Use `heta build -h` to see the list of options.

At the end of the command line you can set **[dir]** path which will be used as a working directory (WD) of Heta compiler run instead of shell working directory. Absolute and relative path are possible here. If the path not set the shell WD will be used as WD of Heta.

List of `heta build` options:

| option | type | default | description |
|--|--|--|--|
| --source | \<string\> | index.heta | Path to main heta module. This allows using another name and path of index Heta module. |
| --type | \<string\> | heta | Type of source file. This option allows to select type of module which will be applied for parsing. Available values: heta/xlsx/json/yaml/sbml. |
| --debug | | | Working in debugging mode. All parsed files will be saved in JSON files in **meta** directory. |
| --units-check | | | If set all records will be checked for units consistency. |
| --skip-export | | | If set no export files will be created. |
| --julia-only | | | Run in Julia supporting mode: skip declared exports, add default export to Julia. |
| --dist-dir | \<string\> | |  Set export directory path, where to store exported files. |
| --meta-dir | \<string\> | |  Set meta directory path. |
| --log-mode | string | error | The rule in which case the log file should be created. Possible values are: never/error/always |
| -d, --declaration | string | platform | The filepath to declaration file (see below) without extension. The command will search the declaration file based on option trying a set of extensions: .json/.json5/.yml. |
| --skip-updates | | | Do not check available new version in npm. |

#### Example 1

Let's our shell working directory is **/path/to/my-platform/**. Our Heta module is located in **src/table.xlsx** subdirectory and has a type xlsx (Excel sheet). To run compilation and save export files you should use the command.
```
heta build --source src/table.xlsx --type xlsx
```

#### Example 2

Run compilation without exporting files using "index.heta" as entry point.
```
heta build --skip-export
```

#### Example 3

Declaring working directory (WD) inside command line. 
```
heta build y:/my-platform
```

### Running build with declaration file

Declaration is a file in specific format which is located in working directory of modeling platform. As default it has a name **platform.json** and it is JSON formatted. It has two purposes:
- It annotates the developed modeling platform by some specific properties like id, notes, constibutors, repository, etc.
- To customize compiler's behavior: files location, outputs, etc. It can be used instead of CLI options.

>To use the arbitrary name of declaration file use `--declaration [filename]` option.

The declaration file can be in one of the following formats:  [JSON](https://en.wikipedia.org/wiki/JSON), [JSON5](https://json5.org/), [YAML](https://en.wikipedia.org/wiki/YAML) with the same schema.

>It is a good idea to start the model development from creation of **platform.json** file. If declaration file is set you have not to use additional options in `heta build`.

To create a draft declaration file use ["heta init" command](#"heta-init"-command). To learn all properties of declaration file see [declaration file format](#declaration-file-format).

#### Example

The following declaration file changes the default **dist** directory and displays only Heta error in console.

```json
{
  "id": "test",
  "options": {
    "distDir": "output",
    "logLevel": "error"
  }
}
```

## "heta init" command

`heta init` creates template files for QSP platform. Running the command without options will create template in current working directory. You can set another directory for creating template using optional path **[dir]** at the end of command line.

After running the command a developer should answer to series of questions about the initialized platform in prompt mode. To create the default platform use `--silent` option.

| option | type | description |
|--|--|--|
| -f, --force || This option allows rewriting the existed files and directories. |
| -s, --silent || Run initialization in silent mode with default options. |

#### Example

The current working directory is "Y:\my-folder". We are going to create a new heta project creating subdirectory "test".

```
$ heta init -f test
Creating a template platform in directory: "Y:\my-folder\test"...
? Platform id test-platform       
? Platform notes Temporal platform to test initialization
? Platform version v0.1.0
? Platform license UNLICENSED
? Set options No
? Select file types xlsx
Platform template is created.
{
  ...
}
DONE.
```

If we check the content of the created "test" directory we will see the following:

**src/index.heta** : the default heta file containing platform template. [index.heta](https://raw.githubusercontent.com/hetalang/heta-compiler/master/bin/init/index.heta ':target=_blank :download')

**src/qsp-units.heta** : pre-defined list of units. You didn't have to use it. [qsp-units.heta](https://raw.githubusercontent.com/hetalang/heta-compiler/master/bin/init/qsp-units.heta ':target=_blank :download')

**platform.json** : default declaration file.

**.gitattributes, .gitignore** : templates to help working with [Git](https://git-scm.com/)

## "heta update" command

`heta update` installs the latest version of heta-compiler available on NPM.

If the additional argument `[version]` is set then it will install the selected version.

The command is equivalen to `npm install --global heta-compiler`.

#### Example

To install the selected version.

```bash
heta update 0.7.1
```

## "heta help" command

To obtain a list of options and command description one can use command help.
It can be done by two ways:
```
heta help <command>
```
or
```
heta <command> -h
```

## Declaration file format

There are properties in declaration file which do not change compilation process. They can be used for annotation of a developed QSP platform for summarizing annotation and auxilary information.

| option | type | CLI option | default value | description |
|--|--|--|--|--|
| id | string ||| This is an unique identifier of modeling platform. Do not use spaces. *Annotation element*  |
| notes | string ||| Put a description in it. This helps people discover your package. *Annotation element.*|
| version | string ||| Version of the platform. Substantial changes to the platform should come along with changes to the version. It is recommended to follow [semver](https://semver.org/) rules. |
| keywords | string[] ||| Array of keywords for possible indexing platform. This helps people discover your package. *Annotation element.* |
| homepage | string ||| The URL to the page supporting the developed platform. *Annotation element.* |
| repository | object || {} | Specify the place where your code lives. This is helpful for people who want to contribute. |
| repository.type | string ||| Type of repository, for example: "git", "svn". *Annotation element.* |
| repository.url | string ||| The URL of source repository, for example: "https://github.com/insysbio/heta-case-mini.git". *Annotation element.* |
| license | string ||| Short udentifier under which license the platform is distributed. It is important especially for Open source platfroms. If you’re using a common license such as BSD-2-Clause or MIT, add a current [SPDX license identifier](https://spdx.org/licenses/). *Annotation element.* |
| private | boolean ||| Set true if a platform must not be shared in public repositories. *Annotation element.* |
| contributors | string[] ||| Array of authors and contributors. Please follow the format "Albert Einstein <albert.einstein@gmail.com> (https://einstein.org/cv)" *Annotation element.* |
| builderVersion | string ||| The required version of Heta compiler which should compile the code. This prevents running the old compiler for the updated QSP platforms. The string must follow the rules of [semantic versioning](https://docs.npmjs.com/about-semantic-versioning). See also [semantic versioning calculator](https://semver.npmjs.com/). |
| importModule | object | | {} | Container for the description of index module. |
| importModule.source | string | --source | index.heta | Path to index heta module. Absolute and relative filepaths are applicable. Example: "src/table.xlsx" |
| importModule.type | string | --type | heta | Type of source file. This option set type of module which will be applied for parsing. Available values: heta/xlsx/json/yaml/sbml. |
| options | object | | {} | A set of compiler options. |
| options.logMode | string | --log-mode | error | The rule in which case the log file should be created. Possible values are: never/error/always. |
| options.logPath | string | | build.log | Filepath where the log file should be created. |
| options.logLevel | string | | info | When parsing the compiler prints the messages to the shell. Here you can set a level of printing messages. Possible values: "info", "warn", "error". For example if you set "warn", only warnings and errors will be printed. |
| options.logFormat | string | | `string` | The format of saving logs to file. The default value is `string` which corresponds the format similar to console. Full list of options is : `string`, `json`.|
| options.unitsCheck | boolean | --units-check | false | If `true` all Record will be checked for units consistency. |
| options.skipExport | boolean | --skip-export | false | If `true` no export files will be created. |
| options.juliaOnly | boolean | --julia-only | false | If `true` the compilation will run Julia supporting mode. |
| options.distDir | string | --dist-dir | dist | At default all export files are created inside **dist** directory. The option can set the another target for storing outputs. |
| options.debug | boolean | --debug | false | Working in debugging mode. All parsed modules will be saved in JSON files in meta directory. |
| options.metaDir | string | --meta-dir | meta | If `options.debug` is set as `true` this option changes the target directory for meta files. |

Using neither declaration file nor CLI options is equivalent to the following declaration:
```json
{
    "builderVersion": "*",
    "options": {
        "logMode": "error",
        "logPath": "build.log",
        "logLevel": "info",
        "logFormat": "string",
        "distDir": "dist",
        "metaDir": "meta",
        "debug": false,
        "unitsCheck": false,
        "skipExport": false,
        "juliaOnly": false
    },
    "importModule": {
        "source": "index.heta",
        "type": "heta"
    }
}
```
