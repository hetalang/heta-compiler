# Export formats

Following [Heta specifications](specifications/) exporting to different formats can be done by `#export` action. The following formats are implemented in Heta compiler.

- [JSON](#json)
- [YAML](#yaml)
- [SLV](#slv)
- [DBSolve](#dbsolve)
- [SBML](#sbml)
- [Simbio](#simbio)
- [Mrgsolve](#mrgsolve)
- [XLSX](#xlsx)
- [Julia](#julia)
- [SimSolver](#simsolver)
- [Matlab](#matlab)

See also [Features support table](#features-support)

The general format for all export actions is the following:
```heta
#export {
    format: JSON, // or other supported formats, required
    filepath: path/to/output, // Relative or absolute path to generated directory or file
    ... // other options
};
```

## JSON

Export to [JSON structure](https://www.json.org/) (array) storing the content of whole platform or selected namespaces (see spaceFilter option).

### Properties

| property | type | required | default | ref | description | 
| ---------|------|----------|---------|-----|-------------|
| omit | string[] | | | | Array of properties paths to exclude from output. |
| noUnitsExpr | boolean | | false | | If `false` or not set all units will be written in format of UnitsExpr. If `true` all unit will be written in Unit array format. |
| spaceFilter | ID[]/ID | | | namespace | if set, namespaces out of the list will be skipped. |

### Output files

**[filepath].json** : all content created for selected space.

**Example**

```heta
#export {
    format: JSON,
    filepath: output, // save result in file "dist/output.json"
    omit: [aux.wiki], // omit aux.wiki properties from components
    noUnitsExpr: false, // save units in format UnitsExpr
    spaceFilter: [ nameless, another ]
};
```

## YAML

Export to [YAML structure](https://yaml.org/) (array) representing the content of namespace.

### Properties

All options is the same as for [JSON format](#json).

### Output files

**[filepath].yml** : all content created for selected space.

**Example**

```heta
#export {
    format: YAML,
    filepath: output, // save result in file "dist/output.json"
    omit: [aux.wiki], // omit aux.wiki properties from components
    noUnitsExpr: false, // save units in format UnitsExpr
    spaceFilter: [ nameless, another ]
};
```

## SLV

Export to SLV format which is the model format for [DBSolveOptimum](http://insysbio.com/en/software/db-solve-optimum).

### Properties

| property | type | required | default | ref | description | 
| ---------|------|----------|---------|-----|-------------|
| eventsOff | boolean | | | | if `eventsOff = true` the switchers will not be exported to DBSolve events. |
| powTransform | "keep" / "operator" / "function" | | "keep" | | This is option describing if the transformation of x^y and pow(x, y) is required. |
| spaceFilter | ID[]/ID | | nameless | namespace | the namespase to export |
| groupConstBy | string/path | | `tags[0]` | | How to group const in Initial Values of DBSolve file. Should be written in format of JSON path |

### Output files

**[filepath].slv** : model created based on namespace which can be opened by DBSolveOptimum.

### Known restrictions

- `Compartment` which changes in time may result in wrong ODE.
- `CSwitcher` is not supported.
- `DSwitcher` does not work for dynamic (ode variables) Records.
- Initialization of `Record` by expression does not work: `x1 .= k1 * A` (not supported).
- `Infinity`, `-Infinity`, `NaN` values is not supported
- boolean operators like `and`, `or`, etc. are not supported

**Example**

```heta
#export {
    format: SLV,
    filepath: model, // save results in file "dist/model.slv"
    spaceFilter: nameless, // namespace used for model generation
    eventsOff: false, // all switchers will be transformed to DBSolve events
    powTransform: keep, // use x^y and pow(x, y) without changes
    groupConstBy: "tags[1]" // use the second tag
};
```

## DBSolve

Export to DBSolve format which is the model format for [DBSolveOptimum](http://insysbio.com/en/software/db-solve-optimum).

This is the updated version of SLV export format which supports compartment volumes changed in time and initilazing records by arbitrary expressions.

### Properties

| property | type | required | default | ref | description | 
| ---------|------|----------|---------|-----|-------------|
| powTransform | "keep" / "operator" / "function" | | "keep" | | This is option describing if the transformation of x^y and pow(x, y) is required. |
| spaceFilter | ID[]/ID | | nameless | namespace | the namespase to export |
| groupConstBy | string/path | | `tags[0]` | | How to group const in Initial Values of DBSolve file. Should be written in format of JSON path |

### Output files

**[filepath]/model.slv** : model created based on namespace which can be opened by DBSolveOptimum.

### Known restrictions

- `CSwitcher` is not supported and will be skipped.
- `DSwitcher` does not work for dynamic (ode variables) Records.
- `Infinity`, `-Infinity`, `NaN` values is not supported
- boolean operators like `and`, `or`, etc. are not supported

**Example**

```heta
#export {
    format: DBSolve,
    filepath: model, // save results in file "dist/model.slv"
    spaceFilter: nameless, // namespace used for model generation
    powTransform: keep // use x^y and pow(x, y) without changes
};
```

## SBML

Export to [SBML format](http://sbml.org/Main_Page).

### Properties

| property | type | required | default | ref | description | 
| ---------|------|----------|---------|-----|-------------|
| version | string | | L2V4 | | SBML version in format: `L2V4`. Possible values are `L2V3`, `L2V4`, `L2V5` |
| spaceFilter | ID[]/ID | | nameless | namespace | the namespase to export |

### Output files

**[filepath].xml** : SBML formatted model

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

| property | type | required | default | ref | description | 
| ---------|------|----------|---------|-----|-------------|
| spaceFilter | ID[]/ID | | nameless | namespace | the namespase to export |

### Output files

**[filepath]/model.m** : Code which can be run in Matlab environment to generate Simbio model.
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

| property | type | required | default | ref | description | 
| ---------|------|----------|---------|-----|-------------|
| spaceFilter | ID[]/ID | | nameless | namespace | the namespase to export |

### Output files

**[filepath]/model.cpp** : Code which can be run in mrgsolve environment.

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

## XLSX

Creation of Excel file (.xlsx) which contains components of namespace.

### Properties

| property | type | required | default | ref | description | 
| ---------|------|----------|---------|-----|-------------|
| omitRows | number | | | | If set this creates empty rows in output sheets. |
| omit | string[] | | | | Array of properties paths to exclude from output. |
| splitByClass | boolean | | | | If `true` the components will be splitted by class and saved as several sheets: one sheet per a class. |
| spaceFilter | ID[]/ID | | | namespace | if set, namespaces out of the list will be skipped. |

### Output files

**[filepath].xlsx** : File which can be opened in Excel.

**Example:**

```heta
#export {
    format: XLSX,
    filepath: output, // save result in file "dist/output.xlsx"
    spaceFilter: nameless, // output all from nameless namespace
    omitRows: 5, // include 5 empty rows between header and the first line
    omit: [aux.wiki], // omit aux.wiki properties from components
    splitByClass: true // split classed to different sheets
};
```

## Julia

Creation of Julia files (.jl).

### Properties

| property | type | required | default | ref | description | 
| ---------|------|----------|---------|-----|-------------|
| spaceFilter | ID[]/ID | | | namespace | the namespase to export |

### Output files

**[filepath]/model.jl** : File storing model code.
**[filepath]/run.jl** : Code to run model.

**Example:**

```heta
#export {
    format: Julia,
    filepath: julia_code, // save result in directory "dist/julia_code"
    spaceFilter: nameless // create model based on nameless namespace
};
```

## SimSolver

Creation of Julia files (.jl) supported by SimSolver.

### Properties

| property | type | required | default | ref | description | 
| ---------|------|----------|---------|-----|-------------|
| spaceFilter | ID[]/ID | | | namespace | the namespase to export |

### Output files

**[filepath]/model.jl** : File storing model code.
**[filepath]/run.jl** : Code to run model.

**Example:**

```heta
#export {
    format: SimSolver,
    filepath: julia_code, // save result in directory "dist/julia_code"
    spaceFilter: nameless // create model based on nameless namespace
};
```

## Matlab

Creation of Matlab files (.m) which represent ODE and code to run ODE.

### Properties

| property | type | required | default | ref | description | 
| ---------|------|----------|---------|-----|-------------|
| spaceFilter | ID[]/ID | | nameless | namespace | the namespase to export |

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
    spaceFilter: nameless // create model based on nameless namespace
};
```

## Features support

*na* means "not applicable"

| | SLV | DBSolve | Julia | Mrgsolve/R | Matlab | Simbio/Matlab | SBML | JSON, YAML | XLSX |
|--|--|--|--|--|--|--|--|--|--|
|`@UnitDef` class                      |na |na |na |na |na |+ |+ |+ |+ 
|`@TimeSwitcher` class                 |+  |+  |+  |-  |+  |+ |+ |+ |+
|`@TimeSwitcher {start: 6}`                              |+ |+ |+ |- |+ |+ |+ |+ |+
|`@TimeSwitcher {start: 0}`                              |+ |+ |+ |- |+ |- |+ |+ |+
|`@TimeSwitcher {start: time_start}` with ref to `@Const`|+ |+ |+ |- |+ |+ |+ |+ |+
|`@TimeSwitcher {period: 12}` infinite repeat            |+ |+ |+ |- |+ |+ |+ |+ |+
|`@TimeSwitcher {stop: 120}` stop time for repeat        |+ |+ |+ |- |+ |+ |+ |+ |+
|`@CSwitcher` class                                      |+ (for static only) |+ (for static only) |+ |- |+ |+ |+ |+ |+
|`@CSwitcher` with interpolation                         |- |- |+ |- |+ |+ |na|na|na
|`@DSwitcher` class                                      |+ (for static only) |+ (for static only) |+ |- |+ |+ |+ |+ |+
|`@DSwitcher` with interpolation                         |- |- |+ |- |+ |+ |na|na|na
|`@Dose` class (experimental)                            |- |- |- |- |- |- |- |- |-
|multispace `#export`                                    |- |- |+ |- |- |- |- |+ |+
|MathExpr: arithmetic functions                          |+ |+ |+ |+ |+ |+ |+ |+ |+
|MathExpr: boolean operators                             |- |- |+ |+ |+ |+ |+ |+ |+
|MathExpr: ternary operator                              |+ |+ |+ |- |+ |+ |+ |+ |+
|MathExpr: `piecewise` function                          |- |- |+ |- |+ |+ |+ |+ |+
|MathExpr: `e`, `pi`                                     |+ |+ |+ |+ |+ |+ |+ |+ |+
|MathExpr: `Infinity`, `NaN`                             |- |- |+ |+ |+ |+ |+ |+ |+
|Const: `Infinity`, `NaN`                                |- |- |+ |+ |+ |+ |+ |+ |+
