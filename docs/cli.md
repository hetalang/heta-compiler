# Command Line Interface

## "heta" command

## "heta init" command

## "heta build" command

## Running build without declaration file

## Running build with declaration file

## Declaration file format

**Root properties**
| option | type | CLI option | default value | description |
|--|--|--|--|--|
| id | ID ||| Identifier of platform |
| title | string ||| Title of platform |
| notes | string ||| 

**option properties**
| option | type | CLI option | default value | description |
|--|--|--|--|--|

**importModule properties**
| option | type | CLI option | default value | description |
|--|--|--|--|--|
| source | string | --source | index.heta |Filepath of index Heta module |
| type | "heta"/"xlsx"/"json"/"yaml"/"sbml" | --type | heta | Path to the main (index) module of platform |

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
        "debuggingMode": false,
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
