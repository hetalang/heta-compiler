# TODO

## modules:

+ xlsx
? markdown -> Page
+ json
+ yaml
+ sbml

## exports

+ DBSolve & SLV (DBSolve)
+ JSON + YAML
+ SBML L2
+ mrgsolve (R)
+ simbio (Matlab)
+ simsolver (Julia)
+ xlsx (Heta)
+ another xlsx
+ matlab
- rxode (R)
- dat (DBSolve)
- heta-standard (Heta)
- ModelingToolkit (Julia)
- ODEs in markdown/latex/ascii

## bugs

- support of logical operators in export 
- test #export for units like 1, [], (1e-3)
- check boolean or numeric expression in Record and ternary

## features

- AnyUnit for zero numbers
- Export to SBML without standard units like _litre
- xlsx module: many tables in one #include, table numeration from 0
- multispace export in Matlab
- check units for expressions after compilation
- test empty assignments for @Record + to specifications
- #move, #moveNS
- automatic creation of modifiers in SBML
- parameter switching: see "parameter-swithcing.md"
- atStart to exports: SimSolver, Matlab, DBSolve

## ideas

- @Dose class to use with simbiology/mrgsolve/nonmem doses
- heta update => npm i heta-compiler
- support null for properties: highlight, parse, heta standard
- stoichiometry as @Const and @Record
- #setFunction + function checking
- updating properties: `one::s1.assignments.start_ 5.5;`

### Dose class

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
