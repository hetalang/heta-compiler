# Migration from v0.12 to v0.13

Heta Compiler v0.13.x adopts Heta language specification 0.6.0, updates DynMS to 0.2.1, and makes SBML conversion stricter and more reproducible.

For full details, see the [change log](https://github.com/hetalang/heta-compiler/blob/master/CHANGELOG.md).

See also: [Migrate to v0.10](./migrate-to-v0.10), [Migrate to v0.11](./migrate-to-v0.11), [Migrate to v0.12](./migrate-to-v0.12).

## Important migration notes

### Update identifiers and mathematical constants

Identifiers can no longer start with `_`. Rename affected components, function arguments, unit definitions, namespace prefixes, and their references.

Replace the old Euler constant `e` with `exponentiale`:

```heta
// v0.12.x
x @Record := exp(-k * t) + e;

// v0.13.x
x @Record := exp(-k * t) + exponentiale;
```

`true` and `false` are now reserved Boolean literals. They cannot be used as component identifiers.

### Update switchers and time scales

`@TimeSwitcher` no longer defaults to `start: 0`. Add an explicit start value:

```heta
dose @TimeSwitcher { start: 0 };
```

Custom `@TimeScale` components must explicitly define both `slope` and `intercept`. The built-in `t` time scale requires no changes.

### Review expression syntax

- Use canonical `piecewise(value, condition, ..., otherwise)` argument order.
- Replace bundled inverse hyperbolic helper names such as `arcsinh` and `arccosh` with `asinh` and `acosh`.
- `add()` and `multiply()` now support zero, one, or multiple arguments.
- Boolean user-defined functions are supported. Numeric literals other than `0` and `1` are rejected in Boolean positions.
- Table modules no longer coerce arbitrary numeric values to Boolean. Use `true`, `false`, `0`, or `1` in Boolean columns.

### Review process and reaction defaults

`reversible` is no longer implicitly stored as `true`. If downstream tooling depends on an explicit value, add it to the model:

```heta
r1 @Reaction { actors: A = B, reversible: true } := k * A;
```

or use explicit expression as `A <=> B` in the reaction definition.

### Review SBML import and generated output

SBML import is stricter in v0.13.x. Models using required Level 3 packages, event delay, event priority, `CSymbolDelay`, or a `SpeciesReference` identifier in MathML now fail with an explicit error instead of being partially interpreted.

Invalid or reserved SBML identifiers are renamed automatically. Generated local-parameter, rate-rule, and anonymous-event identifiers also changed, so snapshots and scripts that depend on generated names must be updated.

Unit hashes and generated SBML unit identifiers now start with `units_` instead of `_`.

## How to update your platform

1. Ensure the project builds successfully with v0.12.1.

2. Update Heta Compiler:

```bash
npm install -g heta-compiler@^0.13.0
heta --version
```

3. Update `builderVersion` in the platform declaration:

```yaml
builderVersion: ^0.13.0
```

4. Apply the identifier, expression, switcher, and time-scale changes described above.

5. Rebuild the platform and compare all generated outputs:

```bash
heta build
```
