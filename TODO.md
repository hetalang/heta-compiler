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
[x] another xlsx
[x] matlab
[x] Julia
[x] Heta-code (Heta)
[x] csv
[x] DOT language / Graphviz
[ ] ODEs in markdown/latex/ascii
[ ] rxode (R)
[ ] dat (DBSolve)
[ ] ModelingToolkit (Julia)
[ ] PGF and TikZ

## bugs


## features

- checking units for diff eq
- check unit consistency for Species: amount/area if compartment is area
- AnyUnit for zero numbers

- atStart to exports: Matlab, DBSolve
- checking legal functions inside Expressions and functionDefinition
- `#defineFunction`: circular dependences within functions, internal functions, different exports, functionDef vs units
- write reusable `Build` class
- remove `isAmount` properties from `@Reaction`

## ideas

- `heta update --dev`
- remove unnecessary rules in export
- generation of 'platform.yml' by `heta init`
- `include` statement is deprecated, use `#include` action (v0.8.0)
- check file format for modules
- add "ignoreCompartment" property in Species
- do not translate base units in SBML export like second => _second
- automatic creation of modifiers in SBML
- avoid insert for existed elements: get warning or #forceInsert
- `@Dose` class to use with simbiology/mrgsolve/nonmem doses
- support null for properties: highlight, parse, heta standard
- stoichiometry as `@Const` and `@Record`
- updating properties with `one::s1.assignments.start_ 5.5;`
- highlight for Vim https://ezpzdev.medium.com/create-a-vim-plugin-for-your-next-programming-language-structure-and-syntax-highlight-1dc0823a6b92
- highlight for notepad++ https://npp-user-manual.org/docs/user-defined-language-system/ https://ivan-radic.github.io/udl-documentation/numbers/ 

## remove lodash

- _get
- _set
- _omit
- _merge

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
