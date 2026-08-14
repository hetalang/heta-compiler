# DynMS Change Log

## 0.2.1

- remove `Sign` from list of math functions

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
