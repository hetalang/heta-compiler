# Change Log

## 0.7.2

- `#export {format: dot}` for abstract namespace
- calculate units for `pow(x, 2/3)`, `x ^ (2/3)`
- `heta update` for CLI
- `#deleteNS`
- update heta-parser to use comments in dictionary
- update deps to the latees possible versions

## 0.7.1

- use 1/0 as boolean
- fix errors if platform.json is incorrect
- `splitByClass` for table export
- update deps

## 0.7.0 - export interface updates

- supports heta standard of v0.4.4
- Support of SLV26, fix issues with lost events
- set default `filepath` for export formats
- store export files in personal folders
- remove support of deprecated `@Export` class
- `spaceFilter` as regular expression
- check and display empty export
- minor code refactoring
- remove unnecessary lodash dependences
- node support starting from 14
- update and fix deps

## 0.6.20

- support webpack: do not use constructor.name
- fix `heta init -s`
- more info when id is skipped
- fix meta files in `heta build`

## 0.6.19

- update syntax of RCT A > B together with A => B
- adaptation for webpack
- remove 'fs' lib from core

## 0.6.18

- support for Node 12 and newer

## 0.6.17

- fix fatal error for wrong unit syntax
- `functionDef` warning for unsupported languages
- minor `Matlab` code fixes: `max(), min()`

## 0.6.16

- add option `heta build --skip-updates`

## 0.6.15

- fix bug in Julia export: use `__constants__` in `tstops`

## 0.6.14

- update Julia export format

## 0.6.13 - draft defineFunction

- `#defineFunction` support for imports: SBML, Heta,
- `#defineFunction` supports for exports: HetaCode, SBML
- minor fixes for Julia export for big numbers like 6e+23 
- minor updates to mrgsolve export

## 0.6.12

- fix NaNMath problem in julia export
- display error if `id` is not set

## 0.6.11

- optimize saving_generator in julia export
- Implement `include ... type table`
- Implement export to CSV and other tabular formats
- Julia export: log10, log2, log, pow, sqrt => NaNMath.log10, etc.

## 0.6.10

- add `format: Dot` support
- do not support units syntax like this `{units: mL2}`
- fix bug: Simbio event without period
- Simbio storage name: nameless => nameless_ns
- use NaNMath in Julia export

## 0.6.9 - multispace

- remove support of `DSwitcher`, `CSwitcher` in `{format: SLV}`
- support of `CSwitcher`, `DSwitcher` in `{format: DBSolve}`
- support active/inactive events for `format: Matlab` 
- multispace export for `format: Matlab`
- multispace export for `format: Mrgsolve`, `format: DBSolve`, `format: SLV`
- multispace export for `format: SBML`, `format: Simbio`
- `spaceFilter` prop for `format: HetaCode`
- remove unnecessary rules from `format: Julia`

## 0.6.8

- `TimeSwitcher`, `DSwitcher`, `CSwitcher` support in mrgsolve
- support `#setScenario` and `Scenario` (no export)
- sbml export: proper sequence of listOf, remove garbage
- remove `SimSolver` export

## 0.6.7 - ready for JOSS

- error messages for unsupported switchers in SLV, DBSolve, mrgsolve
- update reserved words list with "default" (to support mrgsolve)
- extend api documentation
- export only concrete namespaces in Simbio

## 0.6.6

- remove `@SimpleTask` Class
- export to SBML L3 + timeUnits from `@TimeScale`
- replace "markdown" package by "markdown-it"
- support HetaCode export
- fix error with SLV events export
- fix log file creation
- fix error message in case of circular assignments
- support `piecewise` function in SBML, Matlab, Simbio, Julia
- support `piecewise` function in SBML module
- remove unsupported period in Simbio message

## 0.6.5

- Added `JuliaExport` format
- Add `@StopSwitcher` class as experimental
- Remove mathjs-translate deps
- Fix bug in comments inside dictionary
- ban `<-` syntax in Process expression
- remove npm dependance
- prettify internal errors
- skip units check if errors on previous stages

## 0.6.4

- `@TimeScale` component and time terms checking
- support periodic `@TimeEvent` in SBML and Simbio
- bug fix: temporally remove support of `{active: false}` events in Matlab
- bug fix: `powTransform` in SLV
- `atStart` and` {active: true}` in SimSolver
- fix renaming of function names

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
