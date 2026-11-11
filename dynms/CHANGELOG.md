# DynMS Change Log

## 0.3.0

- Expressions are direct MathJSON values. The legacy `{ "expr": ..., "format": "math-json" }` wrapper and alternate expression formats were removed from DynMS.
- Added required model-level `timeVariable` with an `id` that identifies simulation time in expressions.
- Removed the globally reserved identifier `t`. Simulation time is now resolved through `timeVariable.id`.
- Expanded `constants[].value` from finite JSON numbers to JSON numbers or MathJSON number objects for `NaN` and positive or negative infinity. The exporter also preserves these extended values in state initial expressions.
- Changed `timeEvents[].priority` and `events[].priority` from integers with default `0` to optional MathJSON expressions. The exporter omits priority when it is not set.

## 0.2.2

- Schema id `https://raw.githubusercontent.com/hetalang/heta-compiler/v0.12.3/src/dynms/dynms.schema.json`.
- Added top-level `scenarios` for simulation settings and exported Heta scenarios to DynMS; every scenario requires `tspan`.
- Allowed identifiers to start with an underscore.
- Reserved `t`, `Pi`, `ExponentialE`, `NaN`, `Infinity`, `True`, and `False` as model identifiers.
- Fixed export of state initial values containing `pi` or `e` and nested user-defined functions.

## 0.2.1

- Schema id `https://raw.githubusercontent.com/hetalang/heta-compiler/v0.12.2/src/dynms/dynms.schema.json`
- The `dynms` field now must be exactly `"0.2.1"`.
- `t` is reserved for simulation time and cannot be used as a model identifier.
- `constants[].value` accepts only JSON numbers. Arbitrary expression objects are no longer permitted.

## 0.2.0

- Schema id `https://raw.githubusercontent.com/hetalang/heta-compiler/v0.12.1/src/dynms/dynms.schema.json`
- Replaced model-level `states` with `dynamic` and `static`
- Removed `states[].static`; static states are now stored in `static`
- Moved state derivatives from top-level `derivatives[]` to `dynamic[].derivative`, including `derivatives[].algebraic` to `dynamic[].algebraic`
- Removed top-level `derivatives[]`
- Added model-level `timeEvents` for events with `trigger.type: "time"`
- Kept `events` for non-time triggers: `crossing` and `conditional`
- Removed schema default for non-time trigger `detection`

## 0.1.0

- Initial release of DynMS format (part of heta-compiler)
- Schema id `https://raw.githubusercontent.com/hetalang/heta-compiler/v0.12.0/src/dynms/dynms.schema.json`
