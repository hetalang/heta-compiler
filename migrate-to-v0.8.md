# Migrate from v0.7 to v0.8

Heta compiler of **version 0.8** follows the [Heta standard](/specifications/) of **version 0.4.5**.

To use the newer Heta compiler you should make some updates to the platform files. To see the other updates see [change log](https://github.com/hetalang/heta-compiler/blob/master/CHANGELOG.md).

See also [Migrate to v0.6](./migrate-to-v0.6), [Migrate to v0.7](./migrate-to-v0.7).

## Changes in core mathematical functions

The most critical changes in heta-compiler refers to list of supported mathematical functions.
It follows the new Heta standard v0.4.5, see details [here](/specifications/math?id=list-of-functions). 

## Update of units check

The new version extends checking units of measurements, namely it checks units consintency not only in left and right sides of expressions but also in ODEs which will be producesed after compilation.

## Update modeling code

1. **Check** that your platform can be build without errors in the current builder v0.7.x.

    *If you use Git you should commit the latest changes before updating formats.*

1. Install the latest version of **Heta compiler**.

    ```bash
    npm install -g heta-compiler
    heta -v
    # must be v0.8.0 or newer
    ```
1. If you use declaration file **platform.json** update the property to `builderVersion: ^0.7.0`.

    ```json
    {
        "builderVersion": "^0.8.0",
        "id": "my-platform",
        "notes": "platform notes",
        "version": "v0.1.0",
        ...
    }
    ```

1. Check if you use the mathematical functions which change their rules and update the code based on the list.

- `log(x, b)` => `logbase(x, b)` Only for two argument version
- `nthRoot(x)` => `sqrt(x)` Only for one argument version

1. Check if you use the mathematical functions which currently is not supported and add `#defineFunction` to support them.

__List of unsupported functions__

`acosh(x)`, `acoth(x)`, `acsch(x)`, `asech(x)`, `asinh(x)`, `atanh(x)`, `cosh(x)`, `coth(x)`, `csch(x)`, `sech(x)`, `sinh(x)`, `tanh(x)`

__Example:__

Old code
```heta
x1 := 15 * sinh(l1);
```

New code
```heta
#defineFunction sinh {
    arguments: [x],
    math: "(exp(x) - exp(-x)) / 2"
};

x1 := 15 * sinh(l1);
```

1. Run build to check units consistency and fix if necessary.

1. Check building with `heta build` and make a commit if you use git.
