[![Heta project](https://img.shields.io/badge/%CD%B1-Heta_project-blue)](https://hetalang.github.io/)
[![GitHub issues](https://img.shields.io/github/issues/hetalang/heta-compiler.svg)](https://GitHub.com/hetalang/heta-compiler/issues/)
[![GitHub license](https://img.shields.io/github/license/hetalang/heta-compiler.svg)](https://github.com/hetalang/heta-compiler/blob/master/LICENSE)
[![status](https://joss.theoj.org/papers/ebff76c368d3adb720afe414ef6b29fb/status.svg)](https://joss.theoj.org/papers/ebff76c368d3adb720afe414ef6b29fb)
\
[![Autotests](https://github.com/hetalang/heta-compiler/workflows/Autotests/badge.svg)](https://github.com/hetalang/heta-compiler/actions)
[![Coverage Status](https://coveralls.io/repos/github/hetalang/heta-compiler/badge.svg?branch=master)](https://coveralls.io/github/hetalang/heta-compiler?branch=master)
[![GitHub npm](https://img.shields.io/npm/v/heta-compiler/latest.svg)](https://www.npmjs.com/package/heta-compiler)
[![CodeQL](https://github.com/hetalang/heta-compiler/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/hetalang/heta-compiler/actions/workflows/github-code-scanning/codeql)


# Heta-compiler

**Heta-compiler** is a command-line tool for building and transforming models written in the [Heta modeling language](https://hetalang.github.io/).

It combines modular model definitions and exports them to widely used simulation formats such as **SBML**, **SimBiology**, and tabular representations.

Heta-compiler is part of the **Heta modeling project** for quantitative systems pharmacology (QSP) and Systems Biology.

📚 **Documentation**\
https://hetalang.github.io/hetacompiler/

## Quick start

The example below shows how to create a **simple reaction model** and convert it to SBML, Simbiology, and Heta-Table format.

### Step 1

Create a new directory called `heta-conversion`.

### Step 2

Create a file `index.heta` inside the directory with the following content:

```heta
comp1 @Compartment .= 1;

A @Species { compartment: comp1 } .= 10;
B @Species { compartment: comp1 } .= 0;
r1 @Reaction { actors: A => 2B } := k1 * A * comp1;

k1 @Const = 1.2e-1;
```

This model describes a simple reaction converting A to B inside a compartment.

### Step 3

Open the terminal (console) and run the following command in the project directory:

```bash
heta build --export=SBML,Table,Simbio
```

The compiler reads the `index.heta` entry file and generates output files in the `dist` directory.

## Features

-   Modular model development using Heta language
-   Integration of model components from multiple sources (Heta, Excel, JSON/YAML, SBML)
-   Export to popular simulation formats
-   Suitable for automated workflows and CI pipelines
-   CLI tool suitable for scripting and CI pipelines

## Installation

Heta Compiler can be installed on major operating systems.\
See the [installation guide](https://hetalang.github.io/hetacompiler/installation.html) for details.

## Reproducibility reports

This section collects automated reproducibility checks for format conversion, simulations, and other validation workflows.

| Test set | Conversion check | Latest **master** |
| --- | --- | --- |
| sbmlteam/sbml-test-suite | SBML L3V2 → canonical JSON + DynMS | [![SBML L3V2 conversion](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fhetalang%2Fheta-compiler%2Freports%2Fsbml-report%2Fbranches%2Fmaster%2Fl3v2%2Fbadge.json)](https://hetalang.github.io/format-conversion-test-suite/report/?ref=https%3A%2F%2Fraw.githubusercontent.com%2Fhetalang%2Fheta-compiler%2Freports%2Fsbml-report%2Fbranches%2Fmaster%2Fl3v2%2Freport.json) |
| sbmlteam/sbml-test-suite | SBML L3V1 → canonical JSON + DynMS | [![SBML L3V1 conversion](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fhetalang%2Fheta-compiler%2Freports%2Fsbml-report%2Fbranches%2Fmaster%2Fl3v1%2Fbadge.json)](https://hetalang.github.io/format-conversion-test-suite/report/?ref=https%3A%2F%2Fraw.githubusercontent.com%2Fhetalang%2Fheta-compiler%2Freports%2Fsbml-report%2Fbranches%2Fmaster%2Fl3v1%2Freport.json) |
| sbmlteam/sbml-test-suite | SBML L2V5 → canonical JSON + DynMS | [![SBML L2V5 conversion](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fhetalang%2Fheta-compiler%2Freports%2Fsbml-report%2Fbranches%2Fmaster%2Fl2v5%2Fbadge.json)](https://hetalang.github.io/format-conversion-test-suite/report/?ref=https%3A%2F%2Fraw.githubusercontent.com%2Fhetalang%2Fheta-compiler%2Freports%2Fsbml-report%2Fbranches%2Fmaster%2Fl2v5%2Freport.json) |

## About Heta

[Heta](https://hetalang.github.io) is a domain‑specific modeling
language (DSL) for dynamic models used in Quantitative Systems
Pharmacology (QSP) and Systems Biology.

Heta-compiler provides a command-line interface and JavaScript API 
for checking, compilation, and transforming models written in Heta to different formats.

## Getting help

-   📖 Documentation: https://hetalang.github.io/
-   🐞 Issue tracker: https://github.com/hetalang/heta-compiler/issues

## Citation

Metelkin, E. (2021).
**Heta compiler: a software tool for the development of large-scale QSP
models and compilation into simulation formats.**
*Journal of Open Source Software, 6(67), 3708.*
https://doi.org/10.21105/joss.03708

## License

Licensed under the **Apache License 2.0**.\
See the [LICENSE](./LICENSE) file for details.

_This software is provided "as is", without any warranties or guarantees. Use it at your own risk. The author is not responsible for any issues, data loss, or damages resulting from its use._

Copyright © 2019-2026 Heta project
