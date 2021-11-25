# TODO

## modules:

[x] xlsx
[x] json
[x] yaml
[x] sbml
[ ] markdown -> Page
[ ] csv

## exports

[x] DBSolve & SLV (DBSolve)
[x] JSON + YAML
[x] SBML L2
[x] SBML L3
[x] mrgsolve (R)
[x] simbio (Matlab)
[x] simsolver (Julia)
[x] xlsx (Heta)
[x] another xlsx
[x] matlab
[x] Julia
[x] Heta-code (Heta)
[ ] csv
[ ] rxode (R)
[ ] dat (DBSolve)
[ ] ModelingToolkit (Julia)
[ ] ODEs in markdown/latex/ascii

## bugs

- critical error when units id is "xxx_yyy"

## features

- calculate units for pow function
- AnyUnit for zero numbers
- checking legal functions inside Expressions and its arguments
- highlight multiline comments in Heta dictionary and array (with/without comma)
- `#move`, `#moveNS`
- support `@Switcher {active: false}` in Matlab
- check unit consistency for Species: amount/area if compartment is area 
- multi-space export in Matlab, DBSolve, SLV, SBML, Simbio, Mrgsolve, SimSolver
- atStart to exports: Matlab, DBSolve

## ideas

- check file format for modules
- syntax highlight in web
- add "ignoreCompartment" property in Species
- do not translate base units in SBML export like second => _second
- automatic creation of modifiers in SBML
- avoid insert for existed elements: get warning or #forceInsert 
- `@Dose` class to use with simbiology/mrgsolve/nonmem doses
- `heta update` => `npm i heta-compiler`
- support null for properties: highlight, parse, heta standard
- stoichiometry as `@Const` and `@Record`
- #defineFunction + function checking
- updating properties with `one::s1.assignments.start_ 5.5;`
- remove `isAmount`, `compartment` properties from `@Reaction`

## remove lodash

https://medium.com/swlh/are-we-ready-to-replace-lodash-60cd651f6c58
https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore

- merge
- defaults
- sortBy
- has
- get
- set
- flatten => flat
- omit
- pick
- times
- trim => trim
- cloneDeep !
- unique
- mapValues
- groupBy
- fromPairs
- drop
- cloneDeepWith
- intersection

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
