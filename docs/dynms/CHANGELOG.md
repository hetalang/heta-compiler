# DynMS Change Log

## 0.2.1

- Added extended numeric values for constants and MathJSON expressions: `NaN`, `+Infinity`, and `-Infinity` are encoded as `{"num": "NaN"}`, `{"num": "+Infinity"}`, and `{"num": "-Infinity"}` respectively.
- The `dynms` field now must be exactly `"0.2.1"`.
- A document must contain at least one model.
- `t` is reserved for simulation time and cannot be used as a model identifier.
- Constants accept only numeric values, including extended MathJSON numeric values; expression objects are no longer permitted as `constants[].value`.
- Added `stopSimulation` to time events and state events.
- MathJSON symbols must use the DynMS identifier syntax, and MathJSON function calls are limited to the supported operator and function names. User-defined functions must be expanded before DynMS export.

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
