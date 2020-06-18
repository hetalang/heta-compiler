# Export formats

Following [Heta specifications](specifications/) exporting to different formats can be done by `#export` action. The following formats are implemented in Heta compiler.

- [JSON](#json)
- [YAML](#yaml)
- [SLV](#slv)
- [SBML](#sbml)
- [Simbio](#simbio)
- [Mrgsolve](#mrgsolve)
- [XLSX](#xlsx)
- [Julia](#julia)
- [Matlab](#matlab)

The general format for all export actions is the following:
```heta
#export {
    format: JSON, // or other supported formats, required
    filepath: path/to/output, // Relative or absolute path to generated directory or file
    ... // other options
};
```

## JSON

Export to [JSON structure](https://www.json.org/) (array) storing the content of selected namespace.

### Properties

| property | type | required | default | ref | description | 
| ---------|------|----------|---------|-----|-------------|
| space | string | true | nameless | | Name of namespace to export. |
| omit | string[] | | | | Array of properties paths to exclude from output. |
| noUnitsExpr | boolean | | false | | If `false` or not set all units will be written in format of UnitsExpr.  |

### Output files

**[filepath].json** : all content created for selected space.

**Example**

```heta
#export {
    format: JSON,
    filepath: output, // save result in file "dist/output.json"
    space: nameless, // output all from nameless namespace
    omit: [aux.wiki], // omit aux.wiki properties from components
    noUnitsExpr: false // save units in format UnitsExpr
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
    space: nameless, // output all from nameless namespace
    omit: [aux.wiki], // omit aux.wiki properties from components
    noUnitsExpr: false // save units in format UnitsExpr
};
```

## SLV

Export to SLV format which is the model format for [DBSolveOptimum](http://insysbio.com/en/software/db-solve-optimum).

### Properties

| property | type | required | default | ref | description | 
| ---------|------|----------|---------|-----|-------------|
| space | string | true | nameless | | Name of namespace to export. |
| eventsOff | boolean | | | | if `eventsOff = true` the switchers will not be exported to DBSolve events. |
| powTransform | "keep" / "operator" / "function" | | "keep" | | This is option describing if the transformation of x^y and pow(x, y) is required. |

### Output files

**[filepath].slv** : model created based on namespace which can be opened by DBSolveOptimum.

### Known restrictions

- `Compartment` which changes in time may result in wrong ODE.
- `CondSwitcher` is not supported and will be skipped.
- Initialization of `Record` by expression do not work: `x1 .= k1 * A` (not supported).

**Example**

```heta
#export {
    format: SLV,
    filepath: model, // save results in file "dist/model.slv"
    space: nameless, // namespace used for model generation
    eventsOff: false, // all switchers will be transformed to DBSolve events
    powTransform: keep // use x^y and pow(x, y) without changes
};
```

## SBML

Export to [SBML format](http://sbml.org/Main_Page).

### Properties

| property | type | required | default | ref | description | 
| ---------|------|----------|---------|-----|-------------|
| space | string | true | nameless | | Name of namespace to export. |
| version | string | | L2V4 | | SBML version in format: `L2V4` |

### Output files

**[filepath].xml** : SBML formatted model

### Known restrictions

- Currently only Level 2 Version 4 `L2V4` is supported
- Some `CondSwitcher` exported incorrectly 

**Example:**

#export {
    format: SBML,
    filepath: model, // save results in file "dist/model.xml"
    space: nameless, // namespace used for model generation
    version: L2V4 // Level 2 Version 4
};

## Simbio

Export to [Simbiology](https://www.mathworks.com/products/simbiology.html)/Matlab code (m files). The code can be run to create simbiology project.

### Properties

| property | type | required | default | ref | description | 
| ---------|------|----------|---------|-----|-------------|
| space | string | true | nameless | | Name of namespace to export. |

### Output files

**[filepath]/model.m** : Code which can be run in Matlab environment to generate Simbio model.
**[filepath]/fun.m** : Auxilary mathematical functions to support Simbio code. This code should be placed in the same directory as simbio project.

### Known restrictions

*Nothing*

**Example:**
```heta
#export {
    format: Simbio,
    filepath: model, // save results in directory "dist/model"
    space: nameless // namespace used for model generation
};
```

## Mrgsolve

Export to [mrgsolve](http://mrgsolve.github.io/) model format (cpp file).

### Properties

| property | type | required | default | ref | description | 
| ---------|------|----------|---------|-----|-------------|
| space | string | true | nameless | | Name of namespace to export. |

### Output files

**[filepath]/model.cpp** : Code which can be run in mrgsolve environment.

### Known restrictions

*Nothing*

**Example:**

```heta
#export {
    format: Mrgsolve,
    filepath: model, // save results in file "dist/model.cpp"
    space: nameless // namespace used for model generation
};
```

## XLSX

Creation of Excel file (.xlsx) which contains components of namespace.

### Properties

| property | type | required | default | ref | description | 
| ---------|------|----------|---------|-----|-------------|
| space | string | true | nameless | | Name of namespace to export. |
| omitRows | number | | | | If set this creates empty rows in output sheets. |
| omit | string[] | | | | Array of properties paths to exclude from output. |
| splitByClass | boolean | | | | If `true` the components will be splitted by class and saved as several sheets: one sheet per a class. |

### Output files

**[filepath].xlsx** : File which can be opened in Excel.

### Known restrictions

*Nothing*

**Example:**

```heta
#export {
    format: XLSX,
    filepath: output, // save result in file "dist/output.xlsx"
    space: nameless, // output all from nameless namespace
    omitRows: 5, // include 5 empty rows between header and the first line
    omit: [aux.wiki], // omit aux.wiki properties from components
    splitByClass: true // split classed to different sheets
};
```

## Julia

Creation of Julia files (.jl) supported by SimSolver.

### Properties

| property | type | required | default | ref | description | 
| ---------|------|----------|---------|-----|-------------|
| space | string | true | nameless | | Name of namespace to export. |

### Known restrictions

*Nothing*

### Output files

**[filepath]/model.jl** : File storing model code.
**[filepath]/run.jl** : Code to run model.

### Known restrictions

*Nothing*

**Example:**

```heta
#export {
    format: Julia,
    filepath: julia_code, // save result in directory "dist/julia_code"
    space: nameless // create model based on nameless namespace
};
```

## Matlab

Creation of Matlab files (.m) which represent ODE and code to run ODE.

### Properties

| property | type | required | default | ref | description | 
| ---------|------|----------|---------|-----|-------------|
| space | string | true | nameless | | Name of namespace to export. |

### Output files

**[filepath]/model.m** : File storing model code.
**[filepath]/param.m** : storing constants initialization
**[filepath]/run.m** : Code to run model.

### Known restrictions

- supports only one switcher per model

**Example:**

```heta
#export {
    format: Matlab,
    filepath: matlab_code, // save result in directory "dist/matlab_code"
    space: nameless // create model based on nameless namespace
};
```