# Migrate from v0.6 to v0.7

Heta compiler of **version 0.7** follows the [Heta standard](/specifications/) of **version 0.4.4**.

To use the newer Heta compiler you should make some updates to the platform files. To see the other updates see [change log](https://github.com/hetalang/heta-compiler/blob/master/CHANGELOG.md).

See also [Migrate to v0.6](./migrate-to-v0.6).

## Changes in exports

The most critical changes in Heta compiler of version 0.7.x relate to `#export` interface.

### Support of new SLV format (DBSolve)

Previously the Heta compiler generated SLV files of version 25 which was partially compartible with DBSolve Optimum 2020.
There was an issue when DBSolve Optimum 2020 lost the events from the SLV files after reloading the model.

The new Heta compiler v0.7 generates SLV of version 26 by default. If you need the version 25 for previous DBSolve versions compartibility, please clarify it in `export` action: `#export { format: DBSolve, version: "25", filepath: model };`.

### Default filepaths for export

Previously the `filepath` property in `#export` was obligatory. The new version has the default value for each export format.

```heta
...
#export {format: Simbio};                     // files will be saved to `./dist/simbio/` directory
#export {format: Simbio, filepath: my-model}; // files will be saved to `./dist/my-model/` directory
```

See more details in documentation [Export formats](./export-formats).

### Another file structure for exports

The Heta compiler v0.7.x stores each export output in separate directory. In previous versions it stored in directories or files.

```heta
...
#export {format: XLSX, filepath: my-model}; 
// now the file will be saved to ./dist/my-model/output.xlsx
// for v0.6.x it was ./dist/my-model.xlsx
```

### Deprecated @Export class is not longer supported

Currently the export syntax of type `@Export {format: SBML, ...};` is not supported; use always `#export {format: SBML, ...};`.

### RegExp expressions in spaceFilter

The previous format of `#export` action included `spaceFilter` property which clarified namespace name or array of namespaces names to be exported.

```heta
// in heta v0.6.x
#export { format: JSON, filepath: one, spaceFilter: nameless }; // only components from "nameless" space will be exported
#export { format: JSON, filepath: two, spaceFilter: [nameless, another]}; // components from "nameless" and "another" spaces will be exported
#export { format: JSON, filepath: two}; // all components will be exported 
```

Starting from Heta compiler v0.7.0 `spaceFilter` is an regular expression which tests the space names to export. See details in [Export formats](./export-formats).

```heta
// in heta v0.7.x
#export { format: JSON, filepath: one, spaceFilter: "^nameless$" }; // only components from "nameless" space will be exported
#export { format: JSON, filepath: two, spaceFilter: "^(nameless|another)$"}; // components from "nameless" and "another" spaces will be exported
#export { format: JSON, filepath: two}; // all components will be exported 
```

## Update modeling code

1. **Check** that your platform can be build without errors in the current builder v0.6.x.

    *If you use Git you should commit the latest changes before updating formats.*

1. Check Node version

    ```bash
    node -v
    # must be 14.0.0 or newer
    ```

1. Install the latest version of **Heta compiler**.

    ```bash
    npm install -g heta-compiler
    heta -v
    # must be v0.7.0 or newer
    ```
1. If you use declaration file **platform.json** update the property to `builderVersion: ^0.7.0`.

    ```json
    {
        "builderVersion": "^0.7.0",
        "id": "my-platform",
        "notes": "platform notes",
        "version": "v0.1.0",
        ...
    }
    ```

1. If you use `#export` actions of formats `SLV/DBSolve` you should clarify which version of SLV you need.

    Use this if you need supporting DBSolve of older versions  
    ```heta
    #export {format: DBSolve, version: "25"};
    ```

    Default version of SLV is 26.
    ```heta
    #export {format: DBSolve, version: "26"}; // you can skip version clarification here
    ```

1. If you use `spaceFilter` then replace the value to the new standard:

    `#export { format: SBML, spaceFilter: mm }` will be `#export { format: SBML, spaceFilter: "^mm$" }`

    `#export { format: SBML, spaceFilter: [mm, nn] }` will be `#export { format: SBML, spaceFilter: "^(mm|nn)$" }`

    `#export { format: SBML }` will be `#export { format: SBML }`

    Keep in mind that abstract namespaces will not be exported for such formats as `DBSolve`, `SLV`, `Matlab`, `Mrgsolve`, `Simbio`.

1. Delete __dist__ directory to avoid storing old exports. Try not to delete important files. Storing something important in the dist directory is a bad idea anyway.

1. Check building with `heta build` and make a commit if you use git.
