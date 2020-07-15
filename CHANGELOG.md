# Change Log

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
- methos references() to _Component
- add "omit" property to #export formats: JSON, YAML, XLSX
- exclude "fs" and "path" libs from core code for browser support
- updates to nunjucks temmplates for easy usage in browser apps
- remove specific JS errors from Container and components
- multiple dependensies updates

## 0.5.0 - first public

- corresponds to Heta standard v0.2.4, see <https://hetalang.github.io/>
