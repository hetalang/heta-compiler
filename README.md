[![Heta project](https://img.shields.io/badge/%CD%B1-Heta_project-blue)](https://hetalang.github.io/)
[![Documentation](https://img.shields.io/badge/docs-latest-blue.svg)](https://insysbio.github.io/heta-compiler)
[![GitHub issues](https://img.shields.io/github/issues/insysbio/heta-compiler.svg)](https://GitHub.com/insysbio/heta-compiler/issues/)
[![Travis](https://travis-ci.org/insysbio/heta-compiler.svg?branch=master)](https://travis-ci.org/insysbio/heta-compiler)
[![Coverage Status](https://coveralls.io/repos/github/insysbio/heta-compiler/badge.svg?branch=master)](https://coveralls.io/github/insysbio/heta-compiler?branch=master)
[![GitHub npm](https://img.shields.io/npm/v/heta-compiler/latest.svg)](https://www.npmjs.com/package/heta-compiler)
[![GitHub license](https://img.shields.io/github/license/insysbio/heta-compiler.svg)](https://github.com/insysbio/heta-compiler/blob/master/LICENSE)

# Heta compiler JS

Heta compiler JS is Quantitative Systems Pharmacology Programming Platform in JavaScript

This is part of [heta-lang](https://insysbio.github.io/heta-lang/) project.

## Intro

## Installation
[NodeJS](https://nodejs.org/en/) is required. Currently NodeJS v8 and newer are supported.

The stable version can be installed from npm
```bash
npm i -g heta-compiler
```
The latest version can be installed directly from git
```bash
npm i -g git+https://github.com/insysbio/heta-compiler.git
```

## Usage in JavaScript

```javascript
const { Container } = require('heta-compiler');

let c = new Container();
let k1 = c.insert({
    class: 'Const',
    id: 'k1',
    num: 1;
});
```

## Console
To build the dist files from source.

```bash
npm i -g heta-compiler
cd ./path/to/platform/folder
heta init
heta build
```

## Copyright

Copyright 2019-2020 InSysBio LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

<http://www.apache.org/licenses/LICENSE-2.0>

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.