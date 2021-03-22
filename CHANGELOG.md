# Change Log

## 0.6.3

- check expressions for (=) sign
- bug fix: JS error in case of circular refs

## 0.6.2

- update to support SimSolver v0.3

## 0.6.1

- fix bug with units checking and dimensionless

## 0.6.0 - supports Heta standard of v0.4

- add #defineUnit instead of @UnitDef class
- checking terms for @Compartment, @Species, @Reaction
- checking units consistency for all @Record's assignments
- options.unitsCheck in declaration file
- supporting of dimensionless units in format [], 1, (1e-3)
- excel sheets numeration from 0 not from 1
- optional "id" property for #export
- advanced units checking for #export {format: Simbio, ...}
- support @_Switcher {active: false}
- fix support of logical operators: and, or, not, xor
- add `reversible` property (default `true`) to `@Process`

## 0.5.18

- Message for user to install the latest version
- Stop export if compilation errors exist
- support of ternary operator in Simbio

## 0.5.17

- replace SimSolverPlatform by Platform function in SimSolver export
- output property in @Record
- support `output` prop for SimSolver
- support `output` prop for DBSolve, SLV
- support `output` prop for Mrgsolve
- support `output` prop for Matlab
- bug fix in XLSX module

## 0.5.16

- fix bugs in sbml-module: unary minus in <plus>

## 0.5.15

- add scope prop in julia's events
- use > instead of >= in SBML and Simbio events to support run at start
- add `atStart` prop to `_Switcher`
- extend julia format
- rename #export Julia to SimSolver
- add properties to @Const: scale, lower, upper
- sbml-module: use dimensionless for simplified units
- sbml-module: support base units
- minor bug fixes

## 0.5.14

- update matlab run
- ternary operators support in Matlab
- remove ifg0 support

## 0.5.13 - SimSolver support

- add default tasks to Julia export
- notify in limitation in SBML module: StoichiometryMath, EventWithDelay, FastReaction
- fix Julia export for static and dynamic when switches compartment
- add --distDir, --metaDir, --juliaOnly to CLI options
- add "options.juliaOnly" to declaration
- week unit support in Matlab

## 0.5.12

- fix transformation in Julia: nthRoot, exponentiale, zero dynamic, ode_ priority, factorial
- add bind() method to `DSwitcher`
- export `DSwitcher` to formats: SLV, DBSolve, Matlab, Simbiology, SBML
- multispace Julia export
- use `trigger` instead of `condition` in `CSwitcher`
- export `CSwitcher` to formats: SLV, DBSolve, Matlab, Simbiology, SBML

## 0.5.11

- fix bug when `trigger` is empty
- add messages about unsupported SBML features
- add `logFormat` builder option for saving logs in JSON
- fix slv/dbsolve multiple `stop`

## 0.5.10 - skipped

## 0.5.9

- remove `repeatCount` prop from `@TimeSwitcher`
- support of multiple `@TimeSwitcher` in Matlab
- prettify code in SLV/DBSolve with `groupConstBy` prop
- fix error in DBSolve event target

## 0.5.8

- add spaceFilter for Mrgsolve, Julia
- version selection in #export {format: SBML}: support for L2V3, L2V4, L2V5
- add support @TimeSwitcher as event in SimBiology (instead of doses)
- fix bug with "not a deep clone in Expression"
- fix bug with empty period in Matlab
- include correct description of TimeSwitcher in Julia
- update structure of Julia format

## 0.5.7

- add spaceFilter for SLV, DBSolve, Simbio, Matlab, SBML
- fix UnitsExpr: empty units prop, dot in string
- output all dynamic in SLV, DBSolve

## 0.5.6 - multispace export

- default export of `units` as UnitExpr in `@UnitDef`
- multispace for JSON, YAML, XLSX: `spaceFilter` property
- catch error when XLSX file is busy

## 0.5.5 - sbml export

- fixes in unit conversion for SBML export
- support time symbol in SBML export
- remove name from SBML assignments

## 0.5.4

- add AnotherXLSX export
- fix rounding problems in units with prefixes
- fix name of container in Simbio export

## 0.5.3

- Add Export of format DBSolve
- Fix errors in unit rebase
- Add DSwitcher class
- Rename CondSwitcher to CSwitcher
- draft DSwitcher in Julia export

## 0.5.2

- rewrites Heta logs: all logs are stored in container
- fix Matlab export without event
- SBML module: support speciesType
- pretty Unit.toHTML
- faster clone() method for components
- support multiplier in Unit's hash
- minute as qsp unit

## 0.5.1 - IRT ready

- support {free: true} in #export DBSolve
- update _Component.clone() method to exclude cloning of namespace
- fixes to sbmlParse() function for clear math expressions
- "src/browser.js" is an entry point for browser apps and webpack
- method references() to _Component
- add "omit" property to #export formats: JSON, YAML, XLSX
- exclude "fs" and "path" libs from core code for browser support
- updates to nunjucks templates for easy usage in browser apps
- remove specific JS errors from Container and components
- multiple dependencies updates

## 0.5.0 - first public

- corresponds to Heta standard v0.2.4, see <https://hetalang.github.io/>
