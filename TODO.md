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

## features

- add `scale`, `upper`, `lower` to `@Const` for fitting
- Check units for Simbiology
- Check units in expressions
- #move, #moveNS
- FunctionDefinition + function checking
- heta update => npm i heta-compiler
- automatic creation of modifiers in SBML
- parameter switching: see "parameter-swithcing.md"
- @Dose class to use with simbiology/mrgsolve/nonmem doses
- Check latest version at start

## ideas

- Is it better to develop the specific tools in all languages instead of supporting the third-party software? 
  1. Julia (SimSolver.jl)
  2. Matlab (SimSolver.m)
  3. R (SimSolver.r)
  4. GUI

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
