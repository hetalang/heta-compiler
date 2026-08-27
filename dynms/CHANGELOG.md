# DynMS Change Log

## 0.3.0

- Expressions are direct MathJSON values. The legacy `{ "expr": ..., "format": "math-json" }` wrapper and alternate expression formats were removed from DynMS.
- Added required model-level `timeVariable` with an `id` that identifies simulation time in expressions.
- Removed the globally reserved identifier `t`. Simulation time is now resolved through `timeVariable.id`.

## 0.2.1

- Schema id `https://raw.githubusercontent.com/hetalang/heta-compiler/v0.13.0/src/dynms/dynms.schema.json`
- The `dynms` field now must be exactly `"0.2.1"`.
- `t` is reserved for simulation time and cannot be used as a model identifier.
- `constants[].value` accepts only finite JSON numbers or extended numeric objects. Arbitrary expression objects are no longer permitted.
- Extended numeric constants and MathJSON literals use `{"num": "NaN"}`, `{"num": "+Infinity"}`, and `{"num": "-Infinity"}`. The exporter also preserves special state initial values as MathJSON expressions.
- `timeEvents[].priority` and `events[].priority` are optional numbers, including non-integer values. The default value `0` was removed, and the exporter omits priority when it is not set.

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
