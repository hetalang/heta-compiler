# Export formats

Following [Heta specifications](specifications/) exporting to different formats can be done by `#export` action. The following formats are implemented in Heta compiler.

- [JSON](#json)
- [YAML](#yaml)
- [DBSolve](#dbsolve)
- [SLV](#slv)
- [SBML](#sbml)
- [Simbio](#simbio)
- [Mrgsolve](#mrgsolve)
- [Table](#table)
- [XLSX](#xlsx)
- [Julia](#julia)
- [Matlab](#matlab)
- [DOT](#dot)

See also [Features support table](#features-support)

The general format for all export actions is the following:
```heta
#export {
    format: JSON, // or other supported formats, required
    filepath: path/to/output, // Relative or absolute path to generated directory or file, not required
    spaceFilter: "regex-expression" // only filtered namespaces will be exported, see RegExp rules
    ... // other options
};
```

See also [Regular expressions syntax](https://en.wikipedia.org/wiki/Regular_expression).

## JSON

Export to [JSON structure](https://www.json.org/) (array) storing the content of whole platform or selected namespaces (see spaceFilter option).
Can work with `abstract` namespaces.

### Properties

| property | type | required | default | ref | description | 
| ---------|------|----------|---------|-----|-------------|
| omit | string[] | | | | Array of properties paths to exclude from output. |
| noUnitsExpr | boolean | | false | | If `false` or not set all units will be written in format of UnitsExpr. If `true` all unit will be written in Unit array format. |

### Output files

**[filepath]/output.json** : all content created for selected space.

**Example**

```heta
#export {
    format: JSON,
    filepath: output, // save result in file "dist/output.json"
    omit: [aux.wiki], // omit aux.wiki properties from components
    noUnitsExpr: false, // save units in format UnitsExpr
    spaceFilter: "nameless|another"
};
```

## YAML

Export to [YAML structure](https://yaml.org/) (array) representing the content of namespace.
Can work with `abstract` namespaces.

### Properties

All options is the same as for [JSON format](#json).

### Output files

**[filepath]/output.yml** : all content created for selected space.

**Example**

```heta
#export {
    format: YAML,
    filepath: output, // save result in file "dist/output.json"
    omit: [aux.wiki], // omit aux.wiki properties from components
    noUnitsExpr: false, // save units in format UnitsExpr
    spaceFilter: ".+" // all namespaces
};
```

## DBSolve

Export to DBSolve format which is the model format for [DBSolveOptimum](http://insysbio.com/en/software/db-solve-optimum).

This is the updated version of SLV export format which supports compartment volumes changed in time and initializing records by arbitrary expressions.

### Properties

| property | type | required | default | ref | description | 
| ---------|------|----------|---------|-----|-------------|
| powTransform | "keep" / "operator" / "function" | | "keep" | | This is option describing if the transformation of x^y and pow(x, y) is required. |
| groupConstBy | string/path | | `tags[0]` | | How to group const in Initial Values of DBSolve file. Should be written in format of JSON path |
| version | string | | `26` | | SLV file version: `26` (for DBSolveOptimum 2020) or `25` (for earlier versions) |

### Output files

**[filepath]/[namespace].slv** : model created based on namespace which can be opened by DBSolveOptimum.

### Known restrictions

- `Infinity`, `-Infinity`, `NaN` values is not supported
- boolean operators like `and`, `or`, etc. are not supported

**Example**

```heta
#export {
    format: DBSolve,
    filepath: model, // save results in file "dist/model.slv"
    spaceFilter: nameless, // namespace used for model generation
    powTransform: keep // use x^y and pow(x, y) without changes
    version: "25"
};
```

## SLV

Export to SLV format which is the model format for [DBSolveOptimum](http://insysbio.com/en/software/db-solve-optimum).

### Properties

| property | type | required | default | ref | description | 
| ---------|------|----------|---------|-----|-------------|
| eventsOff | boolean | | | | if `eventsOff = true` the switchers will not be exported to DBSolve events. |
| powTransform | "keep" / "operator" / "function" | | "keep" | | This is option describing if the transformation of x^y and pow(x, y) is required. |
| groupConstBy | string/path | | `tags[0]` | | How to group const in Initial Values of DBSolve file. Should be written in format of JSON path |
| version | string | | `26` | | SLV file version: `26` (for DBSolveOptimum 2020) or `25` (for earlier versions) |

### Output files

**[filepath]/[namespace].slv** : model created based on namespace which can be opened by DBSolveOptimum.

### Known restrictions

- `Compartment` which changes in time may result in wrong ODE.
- `CSwitcher` and `DSwitcher` are not supported.
- Initialization of `Record` by expression does not work: `x1 .= k1 * A` (not supported).
- `Infinity`, `-Infinity`, `NaN` values is not supported
- boolean operators like `and`, `or`, etc. are not supported

**Example**

```heta
#export {
    format: SLV,
    filepath: model, // save results in file "dist/model.slv"
    spaceFilter: "^nameless$", // namespace used for model generation
    eventsOff: false, // all switchers will be transformed to DBSolve events
    powTransform: keep, // use x^y and pow(x, y) without changes
    groupConstBy: "tags[1]" // use the second tag
};
```

## SBML

Export to [SBML format](http://sbml.org/Main_Page).
Can work with `abstract` namespaces.

### Properties

| property | type | required | default | ref | description | 
| ---------|------|----------|---------|-----|-------------|
| version | string | | L2V4 | | SBML version in format: `L2V4`. Possible values are `L2V3`, `L2V4`, `L2V5`, `L3V1`, `L3V2` |

### Output files

**[filepath]/[namespace].xml** : SBML formatted model

**Example:**

```heta
#export {
    format: SBML,
    filepath: model, // save results in file "dist/model.xml"
    spaceFilter: nameless, // namespace used for model generation
    version: L2V4 // Level 2 Version 4
};
```

## Simbio

Export to [Simbiology](https://www.mathworks.com/products/simbiology.html)/Matlab code (m files). The code can be run to create simbiology project.

### Properties

-

### Output files

**[filepath]/[namespace].m** : Code which can be run in Matlab environment to generate Simbio model.
**[filepath]/fun.m** : Auxilary mathematical functions to support Simbio code. This code should be placed in the same directory as simbio project.

**Example:**
```heta
#export {
    format: Simbio,
    filepath: model, // save results in directory "dist/model"
    spaceFilter: nameless // namespace used for model generation
};
```

## Mrgsolve

Export to [mrgsolve](http://mrgsolve.github.io/) model format (cpp file).

### Properties

- 

### Output files

**[filepath]/[namespace].cpp** : Code which can be run in mrgsolve environment.
**[filepath]/run.cpp** : Code for fast run.

### Known restrictions

- `CSwitcher` is not supported.
- `DSwitcher` is not supported.
- Initialization by MathExpr is not supported. Do not use `S1 .= x * y`.

**Example:**

```heta
#export {
    format: Mrgsolve,
    filepath: model, // save results in file "dist/model.cpp"
    spaceFilter: nameless // namespace used for model generation
};
```

## Table

To export platform content in tabular format: CSV, Excel, etc.
The format of tables corresponds to the tabular (xlsx) heta module. 
It can be loaded as a module in another projects.
Can work with `abstract` namespaces.

This statement combines a series of formats supported by <https://www.npmjs.com/package/xlsx> library.
For the list of supported files see the docs <https://github.com/SheetJS/sheetjs#supported-output-formats>.

### Properties

| property | type | required | default | ref | description | 
| ---------|------|----------|---------|-----|-------------|
| omitRows | number | | | | If set this creates empty rows in output sheets. |
| omit | string[] | | | | Array of properties paths to exclude from output. |
| bookType | string[] | | `csv` | | One of the supported file types, see xlsx docs. |
| splitByClass | boolean | | | | If `true` the components will be split by class and saved as several sheets: one sheet/file per a class. |

**bookType**

| Multi-scheets formats | Single-scheet format |
| --------------------- | -------------------- |
| xlsx (.xlsx), xlsm (.xlsm), xlsb (.xlsb), biff8 (.xls), | wk3 (.wk3), csv (.csv), txt (.txt), sylk (.sylk), |
  biff5 (.xls), biff4 (.xls), biff3 (.xls), biff2 (.xls), | html (.html), dif (.dif), dbf (.dbf), wk1 (.dbf), |
  xlml (.xls), ods (.ods), fods (.fods)                   | rtf (.rtf), prn (.prn), eth (.eth) |  

### Output files

**[filepath]/output.[extension]** : Table file. The extension depends on `bookType` property.
or
**[filepath]/[Class].[extension]** : If you use CSV and similar one-page file types.

**Example 1:**

```heta
// save a platform in CSV
#export {
    format: Table,
    filepath: platform
};
```

**Example 2:**

```heta
#export {
    format: Table,
    filepath: output, // save result in file "dist/output.xlsx"
    spaceFilter: nameless, // output everything from nameless namespace
    omitRows: 5, // include 5 empty rows between header and the first line
    omit: [aux.wiki], // omit aux.wiki properties from components
    bookType: html // save as HTML table
};
```

## XLSX

Creation of Excel file (.xlsx).
This works in the same way as the `Table` format with `bookType: xlsx`.
Can work with `abstract` namespaces.

### Properties

-

### Output files

**[filepath]/output.xlsx** : File which can be opened in Excel.

**Example:**

```heta
#export {
    format: XLSX,
    filepath: output, // save result in file "dist/output.xlsx"
    omitRows: 3, // include 3 empty rows between header and the first line
    omit: [aux.wiki], // omit aux.wiki properties from components
    splitByClass: true // split classed to different sheets
};
```

## Julia

Creation of Julia files (.jl).

### Properties

- 

### Output files

**[filepath]/model.jl** : File storing model code for all namespaces.
**[filepath]/run.jl** : Code to run model.

**Example:**

```heta
#export {
    format: Julia,
    filepath: julia_code, // save result in directory "dist/julia_code"
    spaceFilter: nameless // create model based on nameless namespace
};
```

## Matlab

Creation of Matlab files (.m) which represent ODE and code to run ODE.

### Properties

- 

### Output files

**[filepath]/model.m** : File storing model code.
**[filepath]/param.m** : storing constants initialization
**[filepath]/run.m** : Code to run model.

### Known restrictions

- `CSwitcher` is not supported.

**Example:**

```heta
#export {
    format: Matlab,
    filepath: matlab_code, // save result in directory "dist/matlab_code"
    spaceFilter: (nameless|another_one) // create two models based on namespaces
};
```

## Dot

Export namespaces to the graph in format (See detaild in https://graphviz.org/).
Each namespace in separate file.

### Properties

-

### Output files

**[filepath]/[namespace].m** : File storing model code.

**Example:**

```heta
#export {
    format: Dot,
    filepath: schemes, // save result in directory "dist/schemes"
};
```

## Features support

*na* means "not applicable"

| | SLV | DBSolve | Julia | Mrgsolve/R | Matlab | Simbio/Matlab | SBML | JSON, YAML | Table | Dot
|--|--|--|--|--|--|--|--|--|--|--|
|`@UnitDef` class                      |na |na |na |na |na |+ |+ |+ |+ |na 
|`@TimeSwitcher` class                 |+  |+  |+  |+  |+  |+ |+ |+ |+ |na 
|`@TimeSwitcher {start: 6}`                              |+ |+ |+ |+ |+ |+ |+ |+ |+ |na 
|`@TimeSwitcher {start: 0}`                              |+ |+ |+ |+ |+ |- |+ |+ |+ |na 
|`@TimeSwitcher {start: time_start}` with ref to `@Const`|+ |+ |+ |+ |+ |+ |+ |+ |+ |na 
|`@TimeSwitcher {period: 12}` infinite repeat            |+ |+ |+ |+ |+ |+ |+ |+ |+ |na 
|`@TimeSwitcher {stop: 120}` stop time for repeat        |+ |+ |+ |+ |+ |+ |+ |+ |+ |na 
|`@CSwitcher` class                                      |- |+ |+ |+ |+ |+ |+ |+ |+ |na 
|`@CSwitcher` with interpolation                         |- |- |+ |- |+ |+ |na |na |na |na 
|`@DSwitcher` class                                      |- |+ |+ |+ |+ |+ |+ |+ |+ |na 
|`@DSwitcher` with interpolation                         |- |- |+ |- |+ |+ |na|na|na |na 
|MathExpr: arithmetic functions                          |+ |+ |+ |+ |+ |+ |+ |+ |+ |na 
|MathExpr: boolean operators                             |- |- |+ |+ |+ |+ |+ |+ |+ |na 
|MathExpr: ternary operator                              |+ |+ |+ |- |+ |+ |+ |+ |+ |na 
|MathExpr: `piecewise` function                          |- |- |+ |- |+ |+ |+ |+ |+ |na 
|MathExpr: `e`, `pi`                                     |+ |+ |+ |+ |+ |+ |+ |+ |+ |na 
|MathExpr: `Infinity`, `NaN`                             |- |- |+ |+ |+ |+ |+ |+ |+ |na 
|Const: `Infinity`, `NaN`                                |- |- |+ |+ |+ |+ |+ |+ |+ |na 
|`@Scenario` support                                     |- |- |- |- |- |- |- |+ |+ |na
|`@Record {ss: true, ...}`                               |- |- |+ |- |- |- |- |+ |+ |na
