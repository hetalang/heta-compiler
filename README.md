[![Heta project](https://img.shields.io/badge/%CD%B1-Heta_project-blue)](https://hetalang.github.io/)
[![GitHub issues](https://img.shields.io/github/issues/insysbio/heta-compiler.svg)](https://GitHub.com/insysbio/heta-compiler/issues/)
[![Travis](https://travis-ci.org/insysbio/heta-compiler.svg?branch=master)](https://travis-ci.org/insysbio/heta-compiler)
[![Coverage Status](https://coveralls.io/repos/github/insysbio/heta-compiler/badge.svg?branch=master)](https://coveralls.io/github/insysbio/heta-compiler?branch=master)
[![GitHub npm](https://img.shields.io/npm/v/heta-compiler/latest.svg)](https://www.npmjs.com/package/heta-compiler)
[![GitHub license](https://img.shields.io/github/license/insysbio/heta-compiler.svg)](https://github.com/insysbio/heta-compiler/blob/master/LICENSE)

# Heta compiler

**Heta compiler** is a software tool for the compilation of Heta-based QSP modeling platforms. Heta compiler can also be used as a JavaScript/Node package to develop modeling tools.

Read more about Heta format and Heta-based platforms on Heta project homepage: <https://hetalang.github.io/>.

## Table of contents

- [Introduction](#introduction)
- [Export formats](#export-formats)
- [Installation](#installation)
- [Usage of command line interface](#usage-of-command-line-interface)
- [Usage in NodeJS packages](#usage-in-nodejs-packages)
- [Known issues and limitations](#known-issues-and-limitations)
- [Getting help](#getting-help)
- [Contribute](#contribute)
- [License](#license)
- [Authors and history](#authors-and-history)

## Introduction

**Heta compiler** is a tool for the development of Quantitative Systems Pharmacology and Systems Biology platforms. It allows combining modules written in different formats like: [Heta language code](https://hetalang.github.io/#/specifications/), Excel sheets, [JSON](https://en.wikipedia.org/wiki/JSON)/[YAML](https://en.wikipedia.org/wiki/YAML) formatted structures, [SBML](http://sbml.org/) and transforming into the dynamical model/models of different formats.

Quantitative Systems Pharmacology (QSP) is a discipline that uses mathematical computer models to characterize biological systems, disease processes and drug pharmacology. QSP typically deals with mechanism-based dynamical models described by ODE systems. Sometimes the modeling systems includes hundred or thousand of components and developed by a research group involving people with different expertise.

Heta compiler can be used as the framework for a QSP modeling project of any size and complexity. It can be easily integrated with existed infrastructure, workflows or used as a part of the CI/CD strategy. The pre-formulated requirements are:

- storing the QSP models and data in integrated infrastructure;
- support iterative modeling platform updates (continuous development approach);
- support of models written in human-readable text and table formats;
- export models and data to different popular formats on the fly.

## Export formats

Heta compiler was created to support exporting to different popular modeling formats. One of the main effort of the developers is to extend a list of supporting formats and allow people to have the same results working in different tools. The current version supports the following formats:

- DBSolveOptimum .SLV files [link](http://insysbio.com/en/software/db-solve-optimum)
- SBML L2V4 [link](http://sbml.org/)
- mrgsolve
- mrgsolve .CPP files [link](https://mrgsolve.github.io/user_guide/)
- Simbiology/Matlab .M files [link](https://www.mathworks.com/products/simbiology.html)
- Matlab describing ODEs file [link](https://www.mathworks.com/help/matlab/ordinary-differential-equations.html)
- SimSolver/Julia module

- JSON formatted file
- YAML formatted file
- Excel sheets

## Installation

Before start [NodeJS](https://nodejs.org/en/) must be installed. Currently NodeJS v8 and newer are supported.

The next steps should be taken using console (shell): **cmd**, **PowerShell**, **sh**, **bash** depending on your operating system.

1. Check Node version. It should be >= 8.0.0.
    ```bash
    node -v
    # v8.9.2
    ```

2. The latest stable version of Heta compiiler can be installed from npm
    ```bash
    npm i -g heta-compiler
    ```
    The development version can be installed directly from GitHub
    ```bash
    npm i -g git+https://github.com/insysbio/heta-compiler.git
    ```

## Usage of command line interface

*More options and examples see on [CLI references](./docs/cli-references)*

The following example creates one Heta module and compiles the model it to SBML format. For example you want to create platform in directory "platform/directory/path/"

1. Create Heta file: *index.heta* in target directory:
    ```heta
    comp1 @Compartment;
    s1 @Species { compartment: comp1 };
    r1 @Reaction { actors: s1 => };

    comp1 .= 1;
    s1 .= 10;
    r1 := k1*s1*comp1;
    k1 @Const = 1e-2;

    sbml1 @SBMLExport;
    ```

2. Be sure you are in target directory: `cd platform/directory/path` if not. Compile platform
    ```bash
    heta build
    ```
Heta builder takes "index.heta" file (module) as default, reads it and transforms to SBML file as declared.

3. See results in directory **dist**.

Several files can be loaded using `include` statement inside "index.heta", see [specifications](https://hetalang.github.io/#/specifications/include).

## Usage in NodeJS packages

*See more information on 
~~[API references](./api-references)~~.*

```javascript
const { Container } = require('heta-compiler');

// platform code in Queue format
let queue = [
    { class: 'Compartment', id: 'comp1', assignments: {start_: '1'} },
    { class: 'Species', id: 's1', compartment: 'comp1', assignments: {start_: '10'} },
    { class: 'Reaction', id: 'r1', actors: 's1 =>', assignments: {ode_: 'k1*s1*comp1'} },
    { class: 'Const', id: 'r1', actors: 's1 =>', num: 1e-2 },
    { class: 'SBMLExport', id: 'sbml1' }
];

// compilation
let c = (new Container)
    .loadMany(queue)
    .knitMany();
let output = c.select({id: 'sbml1'})
    .make();

// print sbml code
console.log(output[0].content);

// check errors
console.log(c.logger.hasErrors);
```

## Known issues and limitations

The tool is under active development so there ara a lot of features to implement. To help us prioritize them write the issue.

## Getting help

 - Read the documentation of Heta on <https://hetalang.github.io/>
 - Use [Gitter Chatroom](https://gitter.im/hetalang/community?utm_source=readme) to chat.
 - Use [Issue Tracker](https://github.com/insysbio/heta-compiler/issues)

## Contribute

- [Source Code](https://github.com/insysbio/heta-compiler)
- [Issue Tracker](https://github.com/insysbio/heta-compiler/issues)
- See also contributing in [Heta project](https://hetalang.github.io/#/CONTRIBUTING)

## License

Licensed under the Apache License, Version 2.0. See the [LICENSE](./LICENSE) text.

## Authors and history

The original author of the project is [Evgeny Metelkin](https://github.com/metelkin). The tool was inspired by the idea that large scale dynamical systems used in QSP and SB require the specific tool which allows writing model code in unified formats and transforming them depending on one's needs. Working with large models should be as easy as with the small ones.

- The initial prototype 0.1.x was developed in 2017 and named as **qs3p** (quantitative systems pharmacology programming platform). It was used in several internal and service [InSysBio LLC](https://insysbio.com) projects including [IRT](https://irt.insysbio.com/) and **Alzheimer disease consortium**.

- The next version **qs3p-js** 0.3.x used the updated format of platfrorm components and a new approach for storing them (without database). A set of new exporting formats was supported.

- The **qs3p-js** of version 0.4.x was developed in 2019 to supports Heta code including actions, modules, namespaces. It was used as the main infrastructure for the development of the large- and middle-scale QSP platforms developed in the framework of InSysBio services.

- Starting from 2020 the tool was renamed to **Heta compiler** and published as a Free Open Source project on [GitHub](https://GitHub.com/insysbio/heta-compiler) under Apache 2.0 license. Since then Heta compiler has been developed in the framework of [Heta project](https://hetalang.github.io/).

Copyright 2019-2020 InSysBio LLC