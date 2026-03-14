# Console commands

*This page describes how to work with Heta compiler from the console (shell).*

If `heta` command is not available check your Heta compiler [installation](./installation) and content of system PATH.

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

The default run of `heta build` will do the following:

1. Searches for a platform declaration file: **platform.yml**, **platform.json**, or **platform** declaration file in working directory.
1. If declaration file is found it will be used for setting options for compilation and export. If not the default options will be applied.
1. If no declaration file is found, looking for **index.heta** in working directory.
2. Parses of index.heta file as module of type "heta" and all files (modules) referenced by `#include` action inside `index.heta`.
3. If compilation errors occur, the file **build.log** will be created in working directory.

### Running "heta build" with options

CLI options allow setting specific options for build command. Use `heta build -h` to see the list of options.

At the end of the command line you can set **[dir]** path which will be used as a working directory (WD) of Heta compiler run instead of working directory. Both absolute and relative paths are supported.

CLI options override options defined in the declaration file. For example, if you have `source` option set in both declaration file and CLI, the CLI option will take precedence.

List of `heta build` options:

| option | type | default | description |
|--|--|--|--|
| --source | \<string\> | `index.heta` | Path to main heta module. This allows using another name and path of index Heta module. |
| --type | \<string\> | `heta` | Type of source file. This option allows to select type of module which will be applied for parsing. Available values: heta/xlsx/json/yaml/sbml. |
| --debug | | | Working in debugging mode. All parsed files will be saved in JSON files in **meta** directory. |
| --units-check | | | If set all records will be checked for units consistency. |
| --dist-dir | \<string\> | |  Set export directory path, where to store exported files. Path can be absolute or relative to the project directory. |
| --meta-dir | \<string\> | |  Set meta directory path. Path can be absolute or relative to the project directory.|
| --log-mode | string | `error` | The rule in which case the log file should be saved to file. Possible values are: never/error/always. |
| --log-path | string | `build.log` | Filepath where the log file should be saved. Path can be absolute or relative to the project directory. |
| -d, --declaration | string | `platform` | The filepath to declaration file (see below) without extension. The command will search the declaration file based on option trying a set of extensions: .json/.yml. |
| --log-level | string | `info` | The level of log information to display. Possible values are: crit/error/warn/info/debug. |
| --skip-updates | | | Do not check available new version in npm. |
| -e, --export | \<string\> | | List of export formats to run separated by colon. It should be in single quotation. It can be list of format names or objects including settings for export. see more details in [export-formats](./export-formats.md). |

#### Example 1

Assume the working directory is **/path/to/my-platform/**. Our Heta module is located in **src/table.xlsx** and its type is xlsx (Excel sheet). To run compilation and save export files you should use the command.
```
heta build --source src/table.xlsx --type xlsx
```

#### Example 2

Setting export formats. The following command will create two export directories: **table** and **json** in **dist** directory.
```
heta build -e '{format:Table,bookType:xlsx,omitRows:3},JSON'
```

#### Example 3

Specifying working directory in the command line. 
```
heta build y:/my-platform
```

## "heta init" command

`heta init` creates template files for a QSP platform. Running the command without options will create template in current working directory. You can set another directory for creating template using optional path **[dir]** at the end of command line.

After running the command a developer should answer a series of questions about the initialized platform in prompt mode. To use the default settings without prompts use `--silent` option.

| option | type | description |
|--|--|--|
| -f, --force || This option allows rewriting the existed files and directories or creates new ones. |
| -s, --silent || Run initialization in silent mode with default options. |

#### Example

The current working directory is "Y:\my-folder". We are going to create a new heta project creating subdirectory "test".

```
heta init -f test
```

```
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

To obtain a list of options and command description use the command help.
It can be done in two ways:
```
heta help <command>
```
or
```
heta <command> -h
```
