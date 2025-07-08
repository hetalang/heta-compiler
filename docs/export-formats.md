# Export formats

The following formats are implemented in Heta compiler.

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
- [Dot](#dot)
- [Summary](#summary)

See also [Features support table](#features-support)

## Declaration exports

There are two recommended ways to export models in Heta compiler: using [`export` property](./cli-references.md#declaration-file-format) in declaration file or using CLI [`--export` property](./cli-references.md#running-build-with-CLI-options). If no --export option is set, the compiler will use the `export` property from the declaration file.

The `export` property is an array of objects with the `format` and `filepath` properties and other format-specific properties.

- `format` is a case-sensitive string with the name of the format. The list of supported formats is below.
- `filepath` is an *optional* property, which is a string with the path to the output directory. The path is relative to the output (`dist`) directory.

**Example**

```yaml
{
    export: [
        {
            format: JSON,
            filepath: output,
            omit: ['aux.wiki'],
            noUnitsExpr: false,
            spaceFilter: "nameless|another"
        },
        {
            format: SBML,
            version: L2V4,
            filepath: model
        },
        {
            format: Table
        }
    ]
}
```

Instead of `export` property in the declaration file, one can use CLI `--export` option. The option is an comma-separated list of format names. The list ai also supports structures in JSON format. If the `--export` option is set, the compiler will ignore the `export` property in the declaration file.

**Example**

```bash
heta build --export '{format: JSON, filepath: output, omit: ["aux.wiki"], spaceFilter: "nameless|another"}, {format: SBML, version: L2V4, filepath: model}, Table'
```

## Inline export (deprecated)

Heta of versions 0.4.6 and earlier supported inline export.
It was removed in version 0.5.0. 

The inline export to different formats could be done in heta code by using `#export` action.

Example 1

```heta
#export {format: JSON, filepath: output};
```

Example 2

```heta
#export {format: SBML, version: L2V4, filepath: model};
```

Starting from heta-compiler version 0.9.0 the inline export is supported but it is deprecated.
One should use `export` property in declaration file or use CLI `--export` property.
See [migrate to v0.9](./migrate-to-v0.9.md) and [CLI references](./cli-references.md) for details.

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

```yaml
{
    format: JSON,
    filepath: output, // save result in file "dist/output.json"
    omit: [aux.wiki], // omit aux.wiki properties from components
    noUnitsExpr: false, // save units in format UnitsExpr
    spaceFilter: "nameless|another"
}
```

## YAML

Export to [YAML structure](https://yaml.org/) (array) representing the content of namespace.
Can work with `abstract` namespaces.

### Properties

All options is the same as for [JSON format](#json).

### Output files

**[filepath]/output.yml** : all content created for selected space.

**Example**

```yaml
{
    format: YAML,
    filepath: output, // save result in file "dist/output.json"
    omit: [aux.wiki], // omit aux.wiki properties from components
    noUnitsExpr: false, // save units in format UnitsExpr
    spaceFilter: ".+" // all namespaces
}
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

```yaml
{
    format: DBSolve,
    filepath: model, // save results in file "dist/model.slv"
    spaceFilter: nameless, // namespace used for model generation
    powTransform: keep // use x^y and pow(x, y) without changes
    version: "25"
}
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

```yaml
{
    format: SLV,
    filepath: model, // save results in file "dist/model.slv"
    spaceFilter: "^nameless$", // namespace used for model generation
    eventsOff: false, // all switchers will be transformed to DBSolve events
    powTransform: keep, // use x^y and pow(x, y) without changes
    groupConstBy: "tags[1]" // use the second tag
}
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

```yaml
{
    format: SBML,
    filepath: model, // save results in file "dist/model.xml"
    spaceFilter: nameless, // namespace used for model generation
    version: L2V4 // Level 2 Version 4
}
```

## Simbio

Export to [Simbiology](https://www.mathworks.com/products/simbiology.html)/Matlab code (m files). The code can be run to create simbiology project.

### Properties


| property | type | required | default | ref | description | 
| ---------|------|----------|---------|-----|-------------|
| auxAsNotes | boolean | | `false` | | If `true`, `aux` content will be appended to Simbio `Notes` as JSON object |

### Output files

**[filepath]/[namespace].m** : Code which can be run in Matlab environment to generate Simbio model.
**[filepath]/fun.m** : Auxilary mathematical functions to support Simbio code. This code should be placed in the same directory as simbio project.

**Example:**
```yaml
{
    format: Simbio,
    filepath: model, // save results in directory "dist/model"
    spaceFilter: nameless // namespace used for model generation
}
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

```yaml
{
    format: Mrgsolve,
    filepath: model, // save results in file "dist/model.cpp"
    spaceFilter: nameless // namespace used for model generation
}
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

```yaml
{
    format: Table,
    filepath: platform
}
```

**Example 2:**

```yaml
{
    format: Table,
    filepath: output, // save result in file "dist/output.xlsx"
    spaceFilter: nameless, // output everything from nameless namespace
    omitRows: 5, // include 5 empty rows between header and the first line
    omit: [aux.wiki], // omit aux.wiki properties from components
    bookType: html // save as HTML table
}
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

```yaml
{
    format: XLSX,
    filepath: output, // save result in file "dist/output.xlsx"
    omitRows: 3, // include 3 empty rows between header and the first line
    omit: [aux.wiki], // omit aux.wiki properties from components
    splitByClass: true // split classed to different sheets
}
```

## Julia

Creation of Julia files (.jl).

### Properties

- 

### Output files

**[filepath]/model.jl** : File storing model code for all namespaces.
**[filepath]/run.jl** : Code to run model.

**Example:**

```yaml
{
    format: Julia,
    filepath: julia_code, // save result in directory "dist/julia_code"
    spaceFilter: nameless // create model based on nameless namespace
}
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

```yaml
{
    format: Matlab,
    filepath: matlab_code, // save result in directory "dist/matlab_code"
    spaceFilter: (nameless|another_one) // create two models based on namespaces
}
```

## Dot

Export namespaces to the graph in format (See detaild in https://graphviz.org/).
Each namespace in separate file.

### Properties

-

### Output files

**[filepath]/[namespace].m** : File storing model code.

**Example:**

```yaml
{
    format: Dot,
    filepath: schemes, // save result in directory "dist/schemes"
}
```

## Summary

Summarize model content and present statistics of the model components. It also can be used to debug the model.

### Properties

-

### Output files

**[filepath]/summary.md** : File storing model summary.

**Example:**

```yaml
{
    format: Summary,
    filepath: summary, // save result in file "dist/summary.md"
}
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
|`#defineFunction`, (sub) means substitution             |+(sub) |+(sub) |+ |+(sub) |+ |+(sub) |+ |+ |+ |na

## Math expressions conversions

_Skipped cell means no conversion_

| | SLV/DBSolve | Julia | Mrgsolve/R | Simbio/Matlab |
|--|--|--|--|--|
|`abs(x)`| | |`fabs(x)`| |
|`add(x, y)`|`x + y`|`+(x, y)`| | |
|`ceil(x)`| | | | |
|`cube(x)`|`pow(x, 3) or x ^ 3`|`NaNMath.pow(x, 3)`| | |
|`divide(x, y)`|`x / y`|`/(x, y)`| | |
|`exp(x)`| | | | |
|`floor(x)`| | | | |
|`ln(x)`| |`NaNMath.log(x)`| | |
|`log(x)`| |`NaNMath.log(x)`| |`log(x)`|
|`logbase(x, base)`|`log(x) / log(base)`|`NaNMath.log(base, x)`| |`(log(x)/log(base))`|
|`log10(x)`| |`NaNMath.log10(x)`| | |
|`log2(x)`|`log(x) / log(2)`|`NaNMath.log2(x)`| |`(log(x)/log(2))`|
|`multiply(x, y)`|`x * y`|`*(x, y)`| | |
|`pow(x, y)`| `pow(x, y)` or `x ^ y`|`NaNMath.pow(x, y)`| |`power(x, y)`|
|`sign(x)`| | | | |
|`sqrt(x)`| |`NaNMath.sqrt(x)`| | |
|`nthRoot(x, n)`|`pow(x, 1/n)` or `x ^ (1/n)`|`NaNMath.pow(x, (1/n))`| | |
|`square(x)`|`pow(x, 2)` or `x ^ 2`|`NaNMath.pow(x, 2)`| | |
|`subtract(x, y)`|`x - y`|`-(x, y)`| | |
|`max(x, y)`|`max2(x, y)`| |`std::max(x, y)`|`max(x, y)`|
|`max(x, y, z)`|`max3(x, y, z)`| |`std::max(x, y, z)`|`max([x, y, z])`|
|`min(x, y)`|`min2(x, y)`| |`std::min(x, y)`|`min(x, y)`|
|`min(x, y, z)`|`min3(x, y, z)`| |`std::min(x, y, z)`|`min([x, y, z])`|
|`factorial(n)`| |`fact(n)`| | |
|`ifgt(x, y, z1, z2)`| |`x > y ? z1 : z2`| |`tern__(x>y, z1, z2)`|
|`ifge(x, y, z1, z2)`| |`x >= y ? z1 : z2`| |`tern__(x>=y, z1, z2)`|
|`iflt(x, y, z1, z2)`| |`x < y ? z1 : z2`| |`tern__(x<y, z1, z2)`|
|`ifle(x, y, z1, z2)`| |`x <= y ? z1 : z2`| |`tern__(x<=y, z1, z2)`|
|`ifeq(x, y, z1, z2)`| |`x == y ? z1 : z2`| |`tern__(x==y, z1, z2)`|
|`x ^ y`|`x ^ y` or `pow(x, y)`|`NaNMath.pow(x, y)`|`pow(x, y)`| |
|`e`|`exp(1)`|`exp(1.0)`| | |
|`pi`|`acos(-1)` | | | |
|`Infinity`| |`Inf`| | |
|`NaN`| |`NaN`| | |
|`t`| | |`SOLVERTIME`|`time`|
|`a and b`| |`a && b`| |`a & b`|
|`a or b`| |`a \|\| b`| |`a \| b`|
|`a xor b`| |`xor(a, b)`| |`xor(a, b)`|
|`not a`| |`!a`| |`~a`|
|`b1 < b2 ? x : y`| `ifgt(b1, b2, x, y)`| | |`tern__(b1 < b2, x, y)`|
|`piecewise(value1, cond1, value2, cond2, ..., otherwise)`|not supported| + |not supported| |
|`acos(x)`, `acot(x)`, `acsc(x)`,`asec(x)`, `asin(x)`, `atan(x)`, `cos(x)`, `cot(x)`, `csc(x)`, `sec(x)`, `sin(x)`, `tan(x)`| | | | |

_Conversion to SBML's MathML_

| | SBML |
|--|--|
|`abs(x)`|`<apply><abs/>(x)</apply>`|
|`add(x, y)`|`<apply><plus/>(x) (y)</apply>`|
|`ceil(x)`|`<apply><ceiling/>(x)</apply>`|
|`cube(x)`|`<apply><power/>(x)<cn>3</cn></apply>`|
|`divide(x, y)`|`<apply><divide/>(x) (y)</apply>`|
|`exp(x)`|`<apply><exp/>(x)</apply>`|
|`floor(x)`|`<apply><floor/>(x)</apply>`|
|`ln(x)`|`<apply><ln/>(x)</apply>`|
|`log(x)`|`<apply><ln/>(x)</apply>`|
|`logbase(x, base)`|`<apply><log/><logbase>(base)</logbase>(x)</apply>`|
|`log10(x)`|`<apply><log/>(x)</apply>`|
|`log2(x)`|`<apply><log/><logbase><cn>2</cn></logbase>(x)</apply>`|
|`multiply(x, y)`|`<apply><times/>(x) (y)</apply>`|
|`pow(x, y)`|`<apply><power/>(x) (y)</apply>`|
|`sign(x)`|`<apply><sign/>(x)</apply>`|
|`sqrt(x)`|`<apply><root/>(x)</apply>`|
|`nthRoot(x, n)`|`<apply><root/><degree>(n)</degree>(x)</apply>`|
|`square(x)`|`<apply><power/>(x)<cn>2</cn></apply>`|
|`subtract(x, y)`|`<apply><minus/>(x) (y)</apply>`|
|`max(x, y)`|`<apply><max/>(x) (y)</apply>`|
|`max(x, y, z)`|`<apply><max/>(x) (y) (z)</apply>`|
|`min(x, y)`|`<apply><min/>(x) (y)</apply>`|
|`min(x, y, z)`|`<apply><min/>(x) (y) (z)</apply>`|
|`factorial(n)`|`<apply><factorial/>(x)</apply>`|
|`ifgt(x, y, z1, z2)`|not supported|
|`ifge(x, y, z1, z2)`|not supported|
|`iflt(x, y, z1, z2)`|not supported|
|`ifle(x, y, z1, z2)`|not supported|
|`ifeq(x, y, z1, z2)`|not supported|
|`x ^ y`|`<apply><pow/>(x) (y)</apply>`|
|`e`|`<exponentiale/>`|
|`pi`|`<pi/>`|
|`Infinity`|`<infinity/>`|
|`NaN`|`<notanumber/>`|
|`t`|`<csymbol definitionURL="http://www.sbml.org/sbml/symbols/time">t</csymbol>`|
|`a and b`|`<apply><and/>(a) (b)</apply>`|
|`a or b`|`<apply><or/>(a) (b)</apply>`|
|`a xor b`|`<apply><xor/>(a) (b)</apply>`|
|`not a`|`<apply><not/>(a)</apply>`|
|`b1 < b2 ? x : y`|`<piecewise><piece>(x)<apply><lt/>(b1) (b2)</apply></piece><otherwise>(y)</otherwise></piecewise>`|
|`piecewise(value1, cond1, value2, cond2, ..., otherwise)`|`<piecewise><piece>(value1) (cond1)</piece><piece>(value2) (cond2)</piece><otherwise>(otherwise)</otherwise></piecewise>`|
|`acos(x)`, `acot(x)`, `acsc(x)`,`asec(x)`, `asin(x)`, `atan(x)`, `cos(x)`, `cot(x)`, `csc(x)`, `sec(x)`, `sin(x)`, `tan(x)`|`<apply><arccos/>(x)</apply>`...|
