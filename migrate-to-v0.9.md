# Migrate from v0.8 to v0.9

Heta compiler of **version 0.9** follows the [Heta standard](https://hetalang.github.io/#/specifications/) of **version 0.5.0**.

To use the newer Heta compiler you should make some updates to the platform files. To see the other updates see [change log](./CHANGELOG).

See also [Migrate to v0.6](./migrate-to-v0.6), [Migrate to v0.7](./migrate-to-v0.7), [Migrate to v0.8](./migrate-to-v0.8).

## Changes in declaration (platform.json) file

The new version uses YAML format (instead of JSON) for declaration file. The new format is more flexible and allows to use comments and multiline strings.

Users can use JSON format for declaration file without restrictions but default YAML files will be generated with `heta init`.

## Replacement of inline #export actions by export array in declaration

The new version uses `export` array in declaration file to define the list of actions which should be exported.

Another option is to use `--export` property in CLI command. See details in [CLI documentation](./cli-references.md).

The old inline export syntax will be supported in the current version (as depricated) but it will be removed in the future.

## Update platforms to support new features

1. **Check** that your platform can be build without errors in the current builder v0.8.x.

    *If you use Git you should commit the latest changes before updating formats.*

1. Install the latest version of **Heta compiler**.

    ```bash
    npm install -g heta-compiler
    heta -v
    # must be v0.9.0 or newer
    ```

1. If you use declaration file **platform.json** update the property to `builderVersion: ^0.9.0` and change file name to **platform.yml** (optional).

    ```yml
    # in platform.yml
    {
        "builderVersion": "^0.9.0",
        "id": "my-platform",
        "notes": "platform notes",
        "version": "v0.1.0",
        ...
    }
    ```

1. Remove unnecessary properties from the declaration file if you used them before:
    
        - `options.skipExport`: use `export: []` instead
        - `options.juliaOnly`: use `export: [{format: Julia}]` instead

1. If you used command line options to supress export with `heta build --no-export` then you should use now `heta build --export ''`.

If you used line options to build julia code only with `heta build --julia-only` then you should use now `heta build --export 'Julia'`.

1. Remove all inline `#export` actions from the .heta files and add them to the `export` array in the declaration file.

See details in [export formats](./export-formats.md)

    **Before**
    ```hetas
    // in index.heta
    #export {format: DBSolve, filepath: model, powTransform: function};
    #export {format: SBML, version: L3V2};
    ```

    **After**
    ```yaml
    # in platform.yml
    ...
    export: [
        {format: DBSolve, filepath: model, powTransform: function},
        {format: SBML, version: L3V2}
    ]
    ```

    **Or After**
    ```json
    # in platform.json
    ...
    "export": [
        {"format": "DBSolve", "filepath": "model", "powTransform": "function"},
        {"format": "SBML", "version": "L3V2"}
    ]
    ```

1. Check building with `heta build` and make a commit if you use git.
