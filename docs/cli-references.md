# Command Line Interface

*This page describe how to work with Heta compiler from console (shell).*

If command are not available check your Heta compiler installation and content of system paths (`PATH` variable in Windows).

## Table of contents

- ["heta" command](#"heta"-command)
- ["heta build" command](#"heta-build"-command)
- ["heta init" command](#"heta-init"-command)
- ["heta help" command](#"heta-help"-command)
- [Declaration file format](#declaration-file-format)

## "heta" command

`heta` is prefix command for the other commands. Writing the command alone prints the information about the tool and available options. `heta help` does the same.

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
  build [dir]    Compile Heta based platform and create set of export files.
  init [dir]     Create template platform files in directory
  help [cmd]     display help for [cmd]
```

## "heta build" command

`heta build` runs the compilation of the platform.
It uses the main source (index) file as a module to compile the platform.

The default run of `heta build` (no options set, no declaration file) does the following:

1. Looking for **index.heta** in parent working directory of shell.
2. Run parsing of index file as module of type "heta" and all files (modules) mentioned by `include` statement inside `index.heta`.
4. Creation of export files created by `@Export` instances to **dist/** directory.
5. If there are compiling errors the file **build.log** will be created in working directory.

### Running build without declaration file

CLI options allow setting specific options for build command. Use `heta build -h` to see the list of options.

**dir** here is a dirpath which will be a working directory (WD) of Heta compiler run. Absolute and relative path are possible here. If not set the shell WD will be used as WD of Heta.

List of build options:
| option | type | default | description |
|--|--|--|--|
| --source | \<string\>| index.heta | Path to main heta module. This allows using another name and path of index Heta module. |
| --type | \<string\> | heta | Type of source file. This option allows to select type of module which will be applied for parsing. Available values: heta/xlsx/json/yaml/sbml. |
| --debug | | | Working in debugging mode. All parsed files will be saved in JSON files in **meta** directory.|
| --skip-export | | | If set no export files will be created. |
| --log-mode | string | error | The rule in which case the log file should be created. Possible values are: never/error/always |
| -d, --declaration| string | platform | The filepath to declaration file (see below) without extension. The command will search the declaration file based on option trying a set of extensions: .json/.json5/.yml.

#### Example 1

Let's our shell working directory is **/path/to/platform/**. Our Heta module is located in **src/table.xlsx** subdirectory and has a type xlsx (Excel sheet). To run compilation and save export files to **dir** one should use the command.
```
heta build --source src/table.xlsx --type xlsx
```

#### Example 2

Run compilation without exporting files.
```
heta build --skip-export
```

### Running build with declaration file

Declaration is a file in specific format which is located in working directory of modeling platform. As default it has name **platform.json** and it is JSON formatted. It has two purposes:
- It annotates the developed modeling platform by some specific properties like id, title, authors, references, etc.
- It declares the specific options of modeling platform: files location, outputs, etc. It substitutes of using `platform build` options but has much more options.

The declaration file can be in one of the following formats:  [JSON](https://en.wikipedia.org/wiki/JSON), [JSON5](https://json5.org/), [YAML](https://en.wikipedia.org/wiki/YAML) with the same schema.

It is a good idea to start the model development from creation of **platform.json** file. If declaration file is set you have not to use additional options in `heta build`.

To create a draft declaration file use ["heta init" command](#"heta-init"-command). To see all properties of declaration file see [declaration file format](#declaration-file-format).

## "heta init" command

`heta init` creates template files for QSP platform. Running the command without options will create template in current working directory. You can set another directory for creating template using **dir** at the end of command.

| option | type | description |
|--|--|--|
| -f, --force || This option allows rewriting the existed files and directories. |
| -s, --silent || Run initialization without any questions with default options. |

After running the command a developer should answer to series of questions about the initialized platform in prompt mode. To create the default platform use `--silent` option.

#### Example
```
$ heta init -f test
Creating a template platform in directory: "Y:\qs3p-js\test"...
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

There are properties in declaration file which do not change compilation process. They can be used for annotation of a developed QSP platform for summarizing annotation and  auxilary information.

| option | type | CLI option | default value | description |
|--|--|--|--|--|
| id | ID ||| Identifier of platform. It should be an unique string without spaces. *Annotation element*  |
| notes | string ||| Text describing QSP platform. *Annotation element.*|
| version | string ||| Version of the developed QSP platform. It is recommended to follow [semver](https://semver.org/) rules. |
| keywords | string[] ||| Array of keywords for future indexing platform. *Annotation element.* |
| homepage | string ||| URL to the page supporting the developed platform if it exists. *Annotation element.* |
| repository | object || {} | Container for storing info where project source code is located. |
| repository.type | string ||| Type of repository, for exmple: "git". *Annotation element.* |
| repository.url | string ||| URL of source repository, for example: "https://github.com/insysbio/heta-case-mini.git". *Annotation element.* |
| license | string ||| Short udentifier under which license the platform is distributed. *Annotation element.* |
| private | boolean ||| Set true if a platform must not be shared in public repositories. *Annotation element.*|
| contributors | string[] ||| Array of authors and contributors. *Annotation element.* |
| builderVersion | string ||| The required version of Heta compiler which should analyze the code. The string must follow the rules of [semantic versioning](https://docs.npmjs.com/about-semantic-versioning). See also [semantic versioning calculator](https://semver.npmjs.com/). |
| importModule | object | | {} | Container for the description of index module. |
| importModule.source | string | --source | index.heta | Path to main heta module. This allows using any name and path of index Heta module. Absolute and relative filepaths are applicable. Example: "src/table.xlsx" |
| importModule.type | string | --type | heta | Type of source file. This option set type of module which will be applied for parsing. Available values: heta/xlsx/json/yaml/sbml. |
| options | object | | {} | Container to store compiler options. |
| options.logMode | string | --log-mode | error | The rule in which case the log file should be created. Possible values are: never/error/always. |
| options.logPath | string | | build.log | Filename or filepath where the log file should be created. |
| options.logLevel | string | | info | When parsing the compiler prints the messages to the shell. Here you can set a level of printing messages. Possible values: "info", "warning", "error". For example if you set "warning", only warnings and errors will be printed. |
| options.skipExport | boolean | --skip-export | false | If set no export files will be created. |
| options.distDir | string | | dist | At default all export files are created inside **dist** directory. The option can set the another target for storing outputs. |
| options.debug | boolean | --debug | false | Working in debugging mode. All parsed files will be saved in JSON files in meta directory. |
| options.metaDir | string | | meta | If `options.debug` is set this option changes the target directory for meta files. |
| options.exitWithoutError | boolean | | false | As default if there are some errors in compilation the `heta build` command return status 1 to console (which means error). If you set true this will return 0. This can be helpful for using autotesting and CI/CI automatization. |

Using neither declaration file nor CLI options is equivalent to the following declaration:
```json
{
    "builderVersion": "*",
    "options": {
        "logMode": "error",
        "logPath": "build.log",
        "logLevel": "info",
        "distDir": "dist",
        "metaDir": "meta",
        "debug": false,
        "skipExport": false,
        "exitWithoutError": false
    },
    "importModule": {
        "source": "index.heta",
        "type": "heta",
        "sheet": 1,
        "omitRows": 0
    }
}
```
