# Command Line Interface

*This page describe how to work with Heta compiler from the console (shell).*

If `heta` command is not available check your Heta compiler [installation](./index) and content of system paths (`PATH` variable in Windows).

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

`heta build` runs the compilation of the platform with the default settings.

The default run of `heta build` (no options set, no `platform.yml` declaration file) will do the following:

1. Looking for **index.heta** in working directory (current directory for shell).
2. Running parsing of index.heta file as module of type "heta" and all files (modules) mentioned by `#include` action inside `index.heta`.
3. If there are compiling errors the file **build.log** will be created in working directory.

### Running build with CLI options

CLI options allow setting specific options for build command. Use `heta build -h` to see the list of options.

At the end of the command line you can set **[dir]** path which will be used as a working directory (WD) of Heta compiler run instead of shell working directory. Absolute and relative path are possible here.

List of `heta build` options:

| option | type | default | description |
|--|--|--|--|
| --source | \<string\> | `index.heta` | Path to main heta module. This allows using another name and path of index Heta module. |
| --type | \<string\> | `heta` | Type of source file. This option allows to select type of module which will be applied for parsing. Available values: heta/xlsx/json/yaml/sbml. |
| --debug | | | Working in debugging mode. All parsed files will be saved in JSON files in **meta** directory. |
| --units-check | | | If set all records will be checked for units consistency. |
| --dist-dir | \<string\> | |  Set export directory path, where to store exported files. Path can be absolute or relative to the project directory. |
| --meta-dir | \<string\> | |  Set meta directory path. Path can be absolute or relative to the project directory.|
| --log-mode | string | `error` | The rule in which case the log file should be saved to file. Possible values are: never/error/always. Path can be absolute or relative to the project directory. |
| --log-path | string | `build.log` | Filepath where the log file should be saved. Path can be absolute or relative to the project directory. |
| -d, --declaration | string | `platform` | The filepath to declaration file (see below) without extension. The command will search the declaration file based on option trying a set of extensions: .json/.yml. |
| --log-level | string | `info` | The level of log information to display. Possible values are: crit/error/warn/info/debug. |
| --skip-updates | | | Do not check available new version in npm. |
| -e, --export | \<string\> | | List of export formats to run divided by colon. It should be in single quotation. It can be list of format names or objects including settings for export. see more details in [export-formats](./export-formats.md). |

#### Example 1

Let's our shell working directory is **/path/to/my-platform/**. Our Heta module is located in **src/table.xlsx** subdirectory and has a type xlsx (Excel sheet). To run compilation and save export files you should use the command.
```
heta build --source src/table.xlsx --type xlsx
```

#### Example 2

Setting export formats. The following command will create two export directories: **table** and **json** in **dist** directory.
```
heta build -e '{format:Table,bookType:xlsx,omitRows:3},JSON'
```

#### Example 3

Declaring working directory (WD) inside command line. 
```
heta build y:/my-platform
```

### Running build with declaration file

Declaration is a file in specific format which is located in working directory of modeling platform. As default it has a name **platform.yml** and it is YAML/JSON formatted. It has two purposes:
- It annotates the developed modeling platform by some specific properties like id, notes, constibutors, repository, etc.
- To customize compiler's behavior: files location, outputs, etc. It can be used instead of CLI options.

>To use the arbitrary name of declaration file use `--declaration [filename]` option.

The declaration file can be in one of the following formats:  [JSON](https://en.wikipedia.org/wiki/JSON), [YAML](https://en.wikipedia.org/wiki/YAML) with the same schema.

>It is a good idea to start the model development from creation of **platform.yml** file. If declaration file is set you have not to use additional options in `heta build`.

To create a draft declaration file use ["heta init" command](#"heta-init"-command). To learn all properties of declaration file see [declaration file format](#declaration-file-format).

#### Example

The following declaration file uses non-default **dist** directory.

```json
{
  "id": "test",
  "options": {
    "distDir": "output"
  }
}
```

## "heta init" command

`heta init` creates template files for QSP platform. Running the command without options will create template in current working directory. You can set another directory for creating template using optional path **[dir]** at the end of command line.

After running the command a developer should answer to series of questions about the initialized platform in prompt mode. To use the default setting without prompts use `--silent` option.

| option | type | description |
|--|--|--|
| -f, --force || This option allows rewriting the existed files and directories or creates new ones. |
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

**src/index.heta** : the default heta file containing platform template. [index.heta](https://raw.githubusercontent.com/hetalang/heta-compiler/master/bin/init/index0.heta)

**src/qsp-units.heta** : pre-defined list of units. You don't have to use it. [qsp-units.heta](https://raw.githubusercontent.com/hetalang/heta-compiler/master/bin/init/qsp-units.heta)

**src/qsp-functions.heta** : pre-defined set of additional functions. You may not need it. [qsp-functions.heta](https://raw.githubusercontent.com/hetalang/heta-compiler/master/bin/init/qsp-functions.heta)

**src/table.xlsx** : pre-defined [table module](/specifications/tabular-format.html) template. It is created only if you select the "table" file type initializing directory. [table.xlsx](https://raw.githubusercontent.com/hetalang/heta-compiler/master/bin/init/table.xlsx)

**platform.yml** : default declaration file.

**.gitattributes, .gitignore** : templates to help working with [Git](https://git-scm.com/)

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
| options.unitsCheck | boolean | --units-check | false | If `true` all Record will be checked for units consistency. |
| options.distDir | string | --dist-dir | dist | At default all export files are created inside **dist** directory. The option can set the another target for storing outputs. |
| options.debug | boolean | --debug | false | Working in debugging mode. All parsed modules will be saved in JSON files in meta directory. |
| options.metaDir | string | --meta-dir | meta | If `options.debug` is set as `true` this option changes the target directory for meta files. |
| export | object[] | -e, --export | `[]` | List of export formats to run divided by colon. Each component includes `format` option and optional settings. see more details in [export-formats](./export-formats.md). |

Using neither declaration file nor CLI options is equivalent to the following declaration file:
```json
{
    "builderVersion": "<current buider version>",
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
