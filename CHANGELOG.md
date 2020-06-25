# Change Log

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
