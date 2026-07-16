# Migration from v0.10 to v0.11

The v0.11 release of Heta compiler improves stability and export consistency (DBSolve, SBML, JSON/YAML/Table), with no major breaking syntax changes for typical models.

The **v0.11** version keeps compatibility with the same Heta standard generation used in v0.10 projects.

For full details, see the [change log](https://github.com/hetalang/heta-compiler/blob/master/CHANGELOG.md).

See also: [Migrate to v0.8](./migrate-to-v0.8), [Migrate to v0.9](./migrate-to-v0.9), [Migrate to v0.10](./migrate-to-v0.10).

## What changed for users

- More robust validation and parsing for process expressions.
- Better DBSolve export behavior for events and `{boundary: true}`.
- Support for `#hasMeta` in SBML export.
- Fixed `{useUnitsExpr: true}` behavior in JSON, YAML, and Table exports.
- Security and documentation updates.

## How to update your platform

1. Ensure your current v0.10 project builds without errors.

2. Update Heta compiler to v0.11 or newer:

```bash
npm install -g heta-compiler
heta -v
# should return v0.11.0 or newer
```

3. Update `builderVersion` in your declaration file.

```yaml
# platform.yml
builderVersion: ^0.11.0
```

Or, if you still use JSON declaration:

```json
{
  "builderVersion": "^0.11.0"
}
```

4. Rebuild and validate your exports:

```bash
heta build
```
