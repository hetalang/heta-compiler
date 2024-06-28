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
[x] Summary
[ ] Berkley Madonna

## bugs


## features

- AnyUnit for zero numbers
- atStart to exports: Matlab, DBSolve
- write reusable `Build` class
- alternative solution to substitute "pkg": Node.js 21 https://nodejs.org/api/single-executable-applications.html
  wait until Node.js 22 will be released
- support `null` for properties: highlight, parse, heta standard

## ideas

- support SBML's delay
- updating properties with `one::s1.assignments.start_ 5.5;`
- check and warning if core component was replaced
- remove unnecessary rules in export
- generation of 'platform.yml' by `heta init`
- `include` statement is deprecated, use `#include` action (v0.8.0)
- check file format for modules
- add "ignoreCompartment" property in Species
- automatic creation of modifiers in SBML
- `@Dose` class to use with simbiology/mrgsolve/nonmem doses
- stoichiometry as `@Const` and `@Record`
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
