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

## features

- add CSV module
- new @TimeScale Class
- support @Switcher {active: false} in Matlab
- check file type for modules
- informative output when critical error
- check unit consistency for Species: amount/area if compartment is area 
- multi-space export in Matlab, DBSolve, SLV, SBML, Simbio, Mrgsolve, SimSolver
- #move, #moveNS
- parameter switching: see "parameter-switching.md"
- atStart to exports: Matlab, DBSolve
- support of comments inside Heta dictionary and array

## ideas

- automatic creation of modifiers in SBML
- avoid insert for existed elements: get warning or #forceInsert 
- AnyUnit for zero numbers
- @Dose class to use with simbiology/mrgsolve/nonmem doses
- heta update => npm i heta-compiler
- support null for properties: highlight, parse, heta standard
- stoichiometry as @Const and @Record
- #defineFunction + function checking
- updating properties with `one::s1.assignments.start_ 5.5;`
- remove `isAmount`, `compartment` properties from `@Reaction`

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
