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

- lost ref in actors
- error for slv export step

## features

- test empty assignments for @Record + to specifications
- Export to SBML without standard units like _litre
- #move, #moveNS
- heta update => npm i heta-compiler
- automatic creation of modifiers in SBML
- parameter switching: see "parameter-swithcing.md"
- @Dose class to use with simbiology/mrgsolve/nonmem doses
- Check latest version at start
- atStart to exports: SimSolver, Matlab, DBSolve

## ideas

- support null for properties: highlight, parse, heta standard, 
- remove UnitDef from components 
- check units for expressions after compilation
- stoichiometry as @Const and @Record
- add {output: true} for @Record
- FunctionDef + function checking
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
