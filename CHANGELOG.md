# Change Log

## 0.9.3

- build debinan package
- build cholatatey package
- build homebrew package
- update .MSI build
- display error if absolute paths in include and export
- remove `logFormat`, `logPath`, `logLevel`, `logMode` from `platform.yaml`
- display heta version in logs
- write full logs into `build.log`
- add `--log-mode` option to CLI
- rewrite build process to exclude absolute paths

## 0.9.2

- remove logLevel option from `platform.yaml`, use `--log-level info` instead in CLI
- fix bug with SBML import when use `<initialAssignment>`
- fix bug with Simbio export with zero outputs
- add Avogadro as base unit

- documentation updates

## 0.9.1

- more information in error messages
- bug fix: return `undefined` for empty string in table-module, clean only strings
- velnurability fix: update xlsx module

## 0.9.0

- Added support for Heta standard v0.5.0.
- Fixed minor parser bugs.
- **SimbioExport**: Introduced the `ausAsNotes` option and added `aux` as UserData.
- **Component**: Added `xmlAnnotation` property for SBML Annotation.
- Fixed issues with `HetaCodeExport` related to the `aux` property.
- **API**: Made `Component` a subclass of `Top`.
- Enhanced error messages for JSON schema validation.
- **Builder API**: Now supports both backend and frontend.
- All file paths are now relative.
- Moved export statements to `platform.yml`.
- Replaced `platform.json` with `platform.yml`.
- **CLI**: Removed `--skip-export` and `--julia-only`, added the new `--export` option.

## 0.8.7

- check and warn context without Switchers
- build win and linux,macos distributives separately

## 0.8.6

- fix bug in qsp-units.heta: wrong `#defineUnits` for `mm`
- fix strings for Simbio export
- replace `ln` to `log` for Matlab/Simbio

## 0.8.5

- fix bug with class names for easy renaming of class by webpack
- support `#forceInsert` action
- support `null` as values of Component properties

## 0.8.4

- support `defineFunction` in all exports
- fix SBML import: local parameters for L2, avogadro, bugs
- update uproach for checking next heta version
- remove `heta update` command

## 0.8.3

- Update syntax of units `(m)^2`
- Fix multiple issues with critical build error
- remove exitWithoutError option in Builder settings
- fig issues in SBML module: zero dimentions, delay, defineFunction, csymbol
- add time units import from SBML L3
- add qsp-functions.heta file in init
- prettify HetaCode export
- defineFunction rules: do not allow empty math and arguments

## 0.8.2

- fix error with comments in base syntax
- fix error in webpack entry

## 0.8.1

- fix bug with checking units for `isAmount: true` and ODE
- julia format changes `saving_generator`
- add windows MSI generation
- documention for standalone installation
- fix path regexp in export to allow `C:\xxx`

## 0.8.0

- update Julia format: p vector structure
- additional check of expresions parsed: use only allowed Nodes
- replace `log(x, base)` by `logbase(x, base)`
- remove `nthRoot(x)` support
- remove hyperbolic functions support
- fix bug with SBML import without products
- extend units check for generated ODE and `defineFunction`
- check number of arguments in `defineFunction`
- export of format `Summary`: lost and orphan components, units
- set defineFunction for core elements
- build standalone heta

## 0.7.4

- use `@Reaction {compartment: comp1, ...}` in DOT format if set
- Add `ss` property in `@Record` to describe algebraic equations
- check unit consistency for Species - amount/area if compartment is area
- Julia format update to include ss

## 0.7.3

- extend `heta update to select version`
- fix logPath in init
- Node version in default `heta` cli
- use ; at the end of include statements

## 0.7.2

- `#export {format: dot}` for abstract namespace
- calculate units for `pow(x, 2/3)`, `x ^ (2/3)`
- `heta update` for CLI
- `#deleteNS`
- update heta-parser to use comments in dictionary
- update deps to the latest possible versions

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
