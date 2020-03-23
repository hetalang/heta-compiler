[![Heta project](https://img.shields.io/badge/%CD%B1-Heta_project-blue)](https://hetalang.github.io/)
[![Documentation](https://img.shields.io/badge/docs-latest-blue.svg)](https://insysbio.github.io/heta-compiler)
[![GitHub issues](https://img.shields.io/github/issues/insysbio/heta-compiler.svg)](https://GitHub.com/insysbio/heta-compiler/issues/)
[![Travis](https://travis-ci.org/insysbio/heta-compiler.svg?branch=master)](https://travis-ci.org/insysbio/heta-compiler)
[![Coverage Status](https://coveralls.io/repos/github/insysbio/heta-compiler/badge.svg?branch=master)](https://coveralls.io/github/insysbio/heta-compiler?branch=master)
[![GitHub npm](https://img.shields.io/npm/v/heta-compiler/latest.svg)](https://www.npmjs.com/package/heta-compiler)
[![GitHub license](https://img.shields.io/github/license/insysbio/heta-compiler.svg)](https://github.com/insysbio/heta-compiler/blob/master/LICENSE)

# Heta compiler

**Heta compiler** is a software tool for the compilation of Heta-based QSP modeling platforms. Heta compiler can also be used as a JavaScript/Node package to develop modeling tools.

Read more about Heta format and Heta-based platforms on Heta project homepage: <https://hetalang.github.io/>.

## Installation

1. Install [NodeJS](https://nodejs.org/en/). Currently NodeJS v8 and newer are supported. Check version after install
    ```bash
    node -v
    ```

2. The latest stable version of Heta compiiler can be installed from npm
    ```bash
    npm i -g heta-compiler
    ```
    The development version can be installed directly from GitHub
    ```bash
    npm i -g git+https://github.com/insysbio/heta-compiler.git
    ```

## Command line interface (CLI) usage

*More options and examples see in [CLI page](./cli)*

1. Create simple Heta file: *index.heta*
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

2. Compile platform
    ```bash
    cd ./path/to/platform/folder
    heta build
    ```

3. See results in directory **dist**


## Usage in NodeJS packages

*See more information on [API page](./api).*

```javascript
const { Container } = require('heta-compiler');

// platform code in Queue format
let queue = [
    {
        class: 'Const',
        id: 'k1',
        num: 1;
    },
    {
        class: 'Record',
        id: 'p1',
        assignments: {start_: 0};
    }
];

// compilation
let c = (new Container)
    .loadMany(queue)
    .knitMany()
    .exportMany();

// print logs
console.log(c.logger.toString());
```

## Copyright

Copyright 2019-2020 InSysBio LLC

Licensed under the Apache License, Version 2.0;