[![GitHub issues](https://img.shields.io/github/issues/hetalang/heta-compiler.svg)](https://GitHub.com/hetalang/heta-compiler/issues/)[![GitHub license](https://img.shields.io/github/license/hetalang/heta-compiler.svg)](https://github.com/hetalang/heta-compiler/blob/master/LICENSE)[![GitHub npm](https://img.shields.io/npm/v/heta-compiler/latest.svg)](https://www.npmjs.com/package/heta-compiler)

# Heta compiler

**Heta compiler** is a tool for building QSP modeling platforms and compiling [Heta models](/) into different simulation formats.

> See also [Heta online](https://heta-online.insysbio.com/) - a web application based on Heta compiler

## What it does

- checks syntax and semantics of Heta code
- combines model modules from multiple formats
- resolves dependencies and builds a complete model
- exports models to multiple simulation formats
- integrates with development workflows and CI pipelines

## How to cite

Metelkin, E., (2021). Heta compiler: a software tool for the development of large-scale QSP models and compilation into simulation formats. __Journal of Open Source Software, 6(67), 3708__, [DOI: 10.21105/joss.03708](https://doi.org/10.21105/joss.03708)

## Quick start

Create platform in directory "/path/to/my-platform" (target directory)

1. Create Heta file: *index.heta* in the target directory with the content:
    ```heta
    comp1 @Compartment;
    s1 @Species { compartment: comp1 };
    r1 @Reaction { actors: s1 => };

    comp1 .= 1;
    s1 .= 10;
    r1 := k1*s1*comp1;
    k1 @Const = 1e-2;
    ```

2. Compile the code into SBML format using the command line tool:
    ```bash
    heta build --export=SBML
    ```

3. The compiled model will appear in directory: /path/to/my-platform/**dist**.

## Supported export formats

- SBML L2/L3 [link](https://sbml.org/)
- Simbiology [link](https://www.mathworks.com/products/simbiology.html)
- DBSolveOptimum [link](https://insysbio.com/en/software/db-solve-optimum)
- mrgsolve [link](https://mrgsolve.github.io/user_guide/)
- Matlab [link](https://www.mathworks.com/help/matlab/ordinary-differential-equations.html)
- Julia [link](https://julialang.org/)
- DOT / Graphviz [link](https://graphviz.org/)
- JSON / YAML
- XLSX / CSV / TSV
- Model summary reports

## How to use

- [Installation](./installation)
- [Console commands](./cli-references)
- [Platform declaration file](./platform-file)
- [Export formats](./export-formats)
- [qsp-units.heta file](./qsp-units.heta)
- [qsp-functions.heta file](./qsp-functions.heta)

## JavaScript API

Heta compiler has been written in Node.js environment and can be used as a package for browser or server-side tools.

```javascript
const { Builder } = require('./src');
let builder = new Builder();

// platform code in Q-array format
let qArr = [
    { class: 'Compartment', id: 'comp1', assignments: {start_: '1'} },
    { class: 'Species', id: 's1', compartment: 'comp1', assignments: {start_: '10'} },
    { class: 'Reaction', id: 'r1', actors: 's1 =>', assignments: {ode_: 'k1*s1*comp1'} },
    { class: 'Const', id: 'k1', num: 1e-2 }
];

// compilation
builder.container
    .loadMany(qArr)
    .knitMany();

// export to SBML
let sbmlExport = new builder.exportClasses.SBML();
let sbmlOutput = sbmlExport.makeText();
console.log(sbmlOutput[0].content);

// check errors
console.log(builder.container.hetaErrors());
```

## Support and contributing

- Use [Issue Tracker](https://github.com/hetalang/heta-compiler/issues)
- Heta project documentation: <https://hetalang.github.io/>
- [Source Code](https://github.com/hetalang/heta-compiler)

## License

Licensed under the Apache License, Version 2.0. See the [LICENSE](https://raw.githubusercontent.com/hetalang/heta-compiler/refs/heads/master/LICENSE) text.

## Authors and history

The original author of the project is [Evgeny Metelkin](https://metelkin.me). The tool was inspired by the idea that large-scale dynamical systems used in QSP and SB require a specific tool that allows writing model code in unified formats and transforming them depending on the user's needs: to database-like format or ODEs. Working with large models should be as easy as with small ones.

- The initial prototype 0.1.x was developed in 2017 and named as **qs3p** (quantitative systems pharmacology programming platform). It was used in several [InSysBio](https://insysbio.com) projects including [IRT](https://irt.insysbio.com/) and **Alzheimer disease consortium**.

- The next versions of **qs3p-js** used the updated format of platform components and a new approach for storing them. A set of new exporting formats was supported. The current version supports Heta code including actions, modules, namespaces. It was used as the main infrastructure for the development of the large- and middle-scale QSP platforms developed in the framework of InSysBio services.

- In 2020 the tool was renamed to **Heta compiler** and published as a Free Open Source project on [GitHub](https://GitHub.com/hetalang/heta-compiler) under Apache 2.0 license. Since then Heta compiler has been developed in the framework of **Heta project**.

Copyright 2019-2026, Heta project