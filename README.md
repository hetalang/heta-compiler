[![Heta project](https://img.shields.io/badge/%CD%B1-Heta_project-blue)](https://hetalang.github.io/)
[![GitHub issues](https://img.shields.io/github/issues/hetalang/heta-compiler.svg)](https://GitHub.com/hetalang/heta-compiler/issues/)
[![Autotests](https://github.com/hetalang/heta-compiler/workflows/Autotests/badge.svg)](https://github.com/hetalang/heta-compiler/actions)
[![Coverage Status](https://coveralls.io/repos/github/hetalang/heta-compiler/badge.svg?branch=master)](https://coveralls.io/github/hetalang/heta-compiler?branch=master)
[![GitHub npm](https://img.shields.io/npm/v/heta-compiler/latest.svg)](https://www.npmjs.com/package/heta-compiler)
[![Documentation](https://img.shields.io/website?down_color=yellow&label=Documentation&up_color=green&url=https%3A%2F%2Fhetalang.github.io%2F#%2Fheta-compiler%2F)](https://hetalang.github.io/#/heta-compiler/)
[![status](https://joss.theoj.org/papers/ebff76c368d3adb720afe414ef6b29fb/status.svg)](https://joss.theoj.org/papers/ebff76c368d3adb720afe414ef6b29fb)
[![GitHub license](https://img.shields.io/github/license/hetalang/heta-compiler.svg)](https://github.com/hetalang/heta-compiler/blob/master/LICENSE)

# Heta compiler

**Heta compiler** is a software tool for the compilation of Heta-based QSP modeling platforms. Heta compiler can also be used as a JavaScript/Node package to develop modeling tools.

To read the full documentation, visit the Heta project homepage: <https://hetalang.github.io/#/heta-compiler/>.

## Table of contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Supported tools](#supported-tools)
- [Usage of command line interface](#usage-of-command-line-interface)
- [Usage in NodeJS packages](#usage-in-nodejs-packages)
- [Known issues and limitations](#known-issues-and-limitations)
- [Getting help](#getting-help)
- [Contribute](#contribute)
- [License](#license)
- [Authors and history](#authors-and-history)

## Introduction

**Heta compiler** is a tool for the development of Quantitative Systems Pharmacology and Systems Biology platforms. It allows combining modules written in different formats like: [Heta language code](https://hetalang.github.io/#/specifications/), Excel sheets, [JSON](https://en.wikipedia.org/wiki/JSON)/[YAML](https://en.wikipedia.org/wiki/YAML) formatted structures, [SBML](http://sbml.org/) and transforming them into the dynamical model/models of different formats.

Quantitative Systems Pharmacology (QSP) is a discipline that uses mathematical computer models to characterize biological systems, disease processes and drug pharmacology. QSP typically deals with mechanism-based dynamical models described by ODE systems. Sometimes the modeling systems includes hundred or thousand of components and developed by a research group involving people with different expertise.

Heta compiler can be used as the framework for a QSP modeling project of any size and complexity. It can be easily integrated with existed infrastructure, workflows or used as a part of the CI/CD strategy. The pre-formulated requirements of Heta compiler are:

- storing the QSP models and data in integrated infrastructure;
- support iterative modeling platform updates (continuous development approach);
- support of models written in human-readable text and table formats;
- export models and data to different popular formats on the fly.

## Installation

[NodeJS](https://nodejs.org/en/) must be installed prior to Heta compiler installation. Currently **NodeJS v8/v10** are recommended.

The next steps should be taken using console (shell): **cmd**, **PowerShell**, **sh**, **bash** depending on your operating system.

1. Check Node version. It should be >= 8.0.0.
    ```bash
    node -v
    # v8.0.0 or newer
    ```

2. The latest stable version of Heta compiler can be installed from npm
    ```bash
    npm i -g heta-compiler
    ```
    **OR** The development version can be installed directly from GitHub
    ```bash
    npm i -g git+https://github.com/hetalang/heta-compiler.git
    ```

## Supported tools

>for more information see [export formats](export-formats)

Heta compiler was created to support exporting to different popular modeling formats.
One of the main development effort is to extend a list of supporting formats and allow people to have the same results working in different tools.
The current version supports the following formats:

- DBSolveOptimum .SLV files [link](http://insysbio.com/en/software/db-solve-optimum)
- SBML L2V4 [link](http://sbml.org/)
- mrgsolve .CPP files [link](https://mrgsolve.github.io/user_guide/)
- Simbiology/Matlab .M files [link](https://www.mathworks.com/products/simbiology.html)
- Matlab describing ODEs file [link](https://www.mathworks.com/help/matlab/ordinary-differential-equations.html)
- Julia format
- JSON formatted file
- YAML formatted file
- Excel sheets

## Usage of command line interface

Heta compiler comes with a built-in CLI which can be used to compile files from the command line.

>To learn more about options, see [CLI references](./cli-references)

The following is the example where we create a Heta module and compile it into SBML format. For example you want to create platform in directory "/path/to/my-platform" (target directory)

1. Create Heta file: *index.heta* in the target directory with the content:
    ```heta
    comp1 @Compartment;
    s1 @Species { compartment: comp1 };
    r1 @Reaction { actors: s1 => };

    comp1 .= 1;
    s1 .= 10;
    r1 := k1*s1*comp1;
    k1 @Const = 1e-2;

    #export {
        format: SBML,
        filepath: model
    };
    ```

2. Be sure you are in the target directory, use command `cd /path/to/my-platform` or similar if not. Compile the platform:
    ```bash
    heta build
    ```
    Heta builder takes "index.heta" file (module) as default, reads it and transforms to SBML file as declared in *index.heta*.

3. See results of compilation in directory /path/to/my-platform/**dist**.

>If you would like to load the platform form several files using `include` statement inside "index.heta", see [specifications](https://hetalang.github.io/#/specifications/include).

## Usage in NodeJS packages

Heta compiler has been written in NodeJS environment and can be used as a package for browser or server-side tools and applications.

> To learn more more, see [API docs](https://hetalang.github.io/heta-compiler/dev)
(under development).

```javascript
const { Container } = require('heta-compiler');

// platform code in Q-array format
let qArr = [
    { class: 'Compartment', id: 'comp1', assignments: {start_: '1'} },
    { class: 'Species', id: 's1', compartment: 'comp1', assignments: {start_: '10'} },
    { class: 'Reaction', id: 'r1', actors: 's1 =>', assignments: {ode_: 'k1*s1*comp1'} },
    { class: 'Const', id: 'r1', actors: 's1 =>', num: 1e-2 },
    { action: 'export', format: 'SBML', filepath: 'model' }
];

// compilation
let c = (new Container)
    .loadMany(qArr)
    .knitMany();
// get export element
let output = c.exportStorage[0]
    .make();

// print sbml code to console
console.log(output[0].content);

// check errors
console.log(c.hetaErrors());
```

## Known issues and limitations

To see a list of the supported format features, go to [features support](export-formats#features-support) table.

The tool is under active development so there are a lot of features to implement. To help us prioritize them write an [issue](https://github.com/hetalang/heta-compiler/issues).

## Getting help

 - Read Heta documentation on <https://hetalang.github.io/>
 - Use [Gitter Chatroom](https://gitter.im/hetalang/community?utm_source=readme).
 - Use [Issue Tracker](https://github.com/hetalang/heta-compiler/issues)

## Contribute

- [Source Code](https://github.com/hetalang/heta-compiler)
- [Issue Tracker](https://github.com/hetalang/heta-compiler/issues)
- See also contributing in [Heta project](https://hetalang.github.io/#/CONTRIBUTING)

## License

Licensed under the Apache License, Version 2.0. See the [LICENSE](./LICENSE) text.

## Authors and history

The original author of the project is [Evgeny Metelkin](https://github.com/metelkin). The tool was inspired by the idea that large scale dynamical systems used in QSP and SB require the specific tool which allows writing model code in unified formats and transforming them depending on one's needs: to database-like format or ODEs. Working with large models should be as easy as with the small ones.

- The initial prototype 0.1.x was developed in 2017 and named as **qs3p** (quantitative systems pharmacology programming platform). It was used in several [InSysBio LLC](http://insysbio.com) projects including [IRT](https://irt.insysbio.com/) and **Alzheimer disease consortium**.

- The next versions of **qs3p-js** used the updated format of platform components and a new approach for storing them. A set of new exporting formats was supported. The current version supports Heta code including actions, modules, namespaces. It was used as the main infrastructure for the development of the large- and middle-scale QSP platforms developed in the framework of InSysBio services.

- In 2020 the tool was renamed to **Heta compiler** and published as a Free Open Source project on [GitHub](https://GitHub.com/hetalang/heta-compiler) under Apache 2.0 license. Since then Heta compiler has been developed in the framework of [Heta project](https://hetalang.github.io/).

Copyright 2019-2021, InSysBio LLC