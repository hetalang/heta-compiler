# Migrate from v0.5 to v0.6

Heta compiler of **version 0.6** follows the [Heta standard](/specifications/) of **version 0.4**.

The new Heta specifications has several incompatibilities. To use the newer Heta compiler you should make some updates to thee platform files. To see the other updates see [change log](https://github.com/hetalang/heta-compiler/blob/master/CHANGELOG.md).

You don't need it for newly created platform.

## Update platform

1. **Check** that your platform can be build without errors in the current builder v0.5.x.

    *If you use Git you should commit the latest changes before updating formats.*

1. Install the latest version of **Heta compiler**.

    ```bash
    npm install -g heta-compiler
    ```

1. If you use declaration file **platform.json** update the property `builderVersion: ^0.6.0`.

    ```json
    {
        "builderVersion": "^0.6.0",
        "id": "my-platform",
        "notes": "platform notes",
        "version": "v0.1.0",
        ...
    }
    ```

1. If you use **qsp-units.heta** substitute it by the downloaded file [qsp-units.heta](https://raw.githubusercontent.com/hetalang/heta-compiler/master/bin/init/qsp-units.heta ':target=_blank :download')

1. Update the `@UnitDef` instances by `#defineUnit` action.

    ```heta
    // version 0.5
    Da @UnitDef { units: g/mole };  
    ```

    ```heta
    // version 0.6
    Da #defineUnit { units: g/mole };
    ```

1. Now the numeration of sheets in module of XLSX type starts from zero. Update the code if you use them.

    **include statement for xlsx type**

    ```heta
    // version 0.5
    include table.xlsx type xlsx with { sheet: 1, omitRows: 3 }
    include table.xlsx type xlsx with { sheet: 2, omitRows: 3 }
    ```

    ```heta
    // version 0.6
    include table.xlsx type xlsx with { sheet: 0, omitRows: 3 }
    include table.xlsx type xlsx with { sheet: 1, omitRows: 3 }
    ```

1. Build and check errors.
