# Migration from v0.11 to v0.12

The v0.12 release is a major user-facing update with a new DynMS export format, stronger SBML compatibility, and improved mrgsolve export behavior.

For full details, see the [change log](https://github.com/hetalang/heta-compiler/blob/master/CHANGELOG.md).

See also: [Migrate to v0.9](./migrate-to-v0.9), [Migrate to v0.10](./migrate-to-v0.10), [Migrate to v0.11](./migrate-to-v0.11).

## Important migration notes

### `@TimeSwitcher` no longer uses `atStart`

In v0.12, `atStart` was removed for `@TimeSwitcher`. If your models still include this property, remove it.

### Canonical/JSON metadata fields were simplified

Export metadata now uses `created` and `generator` fields. If you parse exported files in custom scripts, update field names accordingly.

### mrgsolve time variable naming changed

Generated mrgsolve code now uses `TIME` instead of `SOLVERTIME`. If you rely on custom post-processing or patched templates, update these references.

## New and improved capabilities

- New DynMS export format (with schema and docs).
- Better support for switchers and `#defineFunction` in mrgsolve export.
- SBML export fixes for events, trigger `initialValue` in L3, `piecewise`, `initialAssignment`, and user-defined functions.
- Improved event handling in DBSolve export.
- More robust regression checks and schema validation for DynMS, Canonical, and SBML.

## How to update your platform

1. Ensure your current v0.11 project builds without errors.

2. Update Heta compiler to v0.12 or newer:

```bash
npm install -g heta-compiler
heta -v
# should return v0.12.0 or newer
```

3. Update `builderVersion` in your declaration file.

```yaml
# platform.yml
builderVersion: ^0.12.0
```

Or, if you still use JSON declaration:

```json
{
  "builderVersion": "^0.12.0"
}
```

4. Remove `atStart` from all `@TimeSwitcher` declarations (if present).

5. Rebuild and verify generated outputs:

```bash
heta build
```
