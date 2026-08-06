# TODO

## modules:

[x] json
[x] yaml
[x] sbml
[x] table
[ ] markdown -> Page

## exports

[x] DBSolve & SLV (DBSolve)
[x] JSON + YAML
[x] SBML L2
[x] SBML L3
[x] mrgsolve (R)
[x] simbio (Matlab)
[x] xlsx (Heta)
[x] matlab
[x] Julia
[x] Heta-code (Heta)
[x] csv
[x] DOT language / Graphviz
[ ] PGF and TikZ
[x] Summary
[ ] Berkley Madonna
[x] DynMS (JSON)

## bugs

- update libs
  - mathjs => 12.4.3 => 13.2.3 => 14.3.1

## features

- automatic creation of modifiers in SBML

## ideas

- use MathJSON https://mathlive.io/math-json/ format for math expressions
- allow to use const expressions in `TimeSwitcher.start`, `TimeSwitcher.period` and `TimeSwitcher.stop`
- support SBML's delay
- AnyUnit for zero numbers
- updating properties with `one::s1.assignments.start_ 5.5;`
- check and warning if core component was replaced
- check file format for modules
- `@Dose` class to use with simbiology/mrgsolve/nonmem doses
- stoichiometry as `@Const` and `@Record`

### Dose class

```heta
dose1 @Dose {
  target: A,
  amount: 100,
  start: 0,
  period: 12,
  repeatCount: 4,
  rate: 0.1, // for injection
  duration: 1
};
dose2 @Dose {
  target: A,
  amount: dose_amount,
  start: start1,
  period: period1,
  repeatCount: 4,
  rate: rate1 // for injection
};
```

## check license

license-checker --json > licenses.json
license-checker --production --onlyAllow "MIT;Apache-2.0;ISC;Python-2.0;BSD-2-Clause;BSD-3-Clause;0BSD"
license-checker --production --summary
├─ MIT: 82
├─ ISC: 7
├─ Apache-2.0: 6
├─ BSD-2-Clause: 4
├─ BSD-3-Clause: 2
├─ Python-2.0: 1
├─ 0BSD: 1
└─ (MIT OR CC0-1.0): 1
