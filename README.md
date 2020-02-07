[![Documentation](https://img.shields.io/badge/docs-latest-blue.svg)](https://insysbio.github.io/qs3p-js)
[![GitHub issues](https://img.shields.io/github/issues/insysbio/qs3p-js.svg)](https://GitHub.com/insysbio/qs3p-js/issues/)
[![Travis](https://travis-ci.org/insysbio/qs3p-js.svg?branch=master)](https://travis-ci.org/insysbio/qs3p-js)
[![AppVeyor](https://ci.appveyor.com/api/projects/status/github/insysbio/qs3p-js?branch=master&svg=true)](https://ci.appveyor.com/project/metelkin/qs3p-js)
[![Coverage Status](https://coveralls.io/repos/github/insysbio/qs3p-js/badge.svg?branch=master)](https://coveralls.io/github/insysbio/qs3p-js?branch=master)
[![GitHub release](https://img.shields.io/github/release/insysbio/qs3p-js.svg)](https://github.com/insysbio/qs3p-js/releases/)
[![GitHub npm](https://img.shields.io/npm/v/qs3p-js/latest.svg)](https://www.npmjs.com/package/qs3p-js)
[![GitHub license](https://img.shields.io/github/license/insysbio/qs3p-js.svg)](https://github.com/insysbio/qs3p-js/blob/master/LICENSE)

# qs3p-js

**Q**uantitative **S**ystems **P**harmacology **P**rogramming **P**latform in **J**ava**S**cript

This is part of [heta-lang](https://insysbio.github.io/heta-lang/) project.

## Intro

## Installation
[NodeJS](https://nodejs.org/en/) is required. Currently NodeJS v6 and newer are supported.

The stable version can be installed from npm
```bash
npm i -g qs3p-js
```
The latest version can be installed directly from git
```bash
npm i -g git+https://github.com/insysbio/qs3p.git
```

## Usage in JavaScript

```javascript
const { Container } = require('qs3p-js');

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
npm i -g qs3p-js
cd ./path/to/platform/folder
qs3p init
qs3p build
```

## Copyright

&copy; 2019-2020 InSysBio LLC
