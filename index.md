[![GitHub issues](https://img.shields.io/github/issues/hetalang/heta-compiler.svg)](https://GitHub.com/hetalang/heta-compiler/issues/)
[![GitHub license](https://img.shields.io/github/license/hetalang/heta-compiler.svg)](https://github.com/hetalang/heta-compiler/blob/master/LICENSE)
[![GitHub npm](https://img.shields.io/npm/v/heta-compiler/latest.svg)](https://www.npmjs.com/package/heta-compiler)

# Heta compiler

**Heta compiler** is a software tool for the compilation of Heta-based QSP modeling platforms. Heta compiler can also be used as a JavaScript/Node package to develop modeling tools.

## Introduction

**Heta compiler** is a tool for the development of Quantitative Systems Pharmacology and Systems Biology platforms. It allows combining modules written in different formats like: [Heta language code](/specifications/), Excel sheets, [JSON](https://en.wikipedia.org/wiki/JSON)/[YAML](https://en.wikipedia.org/wiki/YAML) formatted structures, [SBML](https://sbml.org/) and transforming them into the dynamical model/models of different formats.

Quantitative Systems Pharmacology (QSP) is a discipline that uses mathematical computer models to characterize biological systems, disease processes, and drug pharmacology. QSP typically deals with mechanism-based dynamical models described by ODE systems. Sometimes the modeling systems include hundreds or thousands of components and are developed by a research group involving people with different expertise.

Heta compiler can be used as the framework for a QSP modeling project of any size and complexity. It can be easily integrated with existed infrastructure, workflows or used as a part of the CI/CD strategy. The pre-formulated requirements of Heta compiler are:

- storing the QSP models and data in integrated infrastructure;
- support iterative modeling platform updates (continuous development approach);
- support of models written in human-readable text and table formats;
- export models and data to different popular formats on the fly.

## How to cite

Metelkin, E., (2021). Heta compiler: a software tool for the development of large-scale QSP models and compilation into simulation formats. __Journal of Open Source Software, 6(67), 3708__, [DOI: 10.21105/joss.03708](https://doi.org/10.21105/joss.03708)

## Installation

### Installation in Windows

[Download -win-x64-installer.msi from release page](https://github.com/hetalang/heta-compiler/releases/latest) and install or update.

### Installation with Chocolatey in Windows

If you have [Chocolatey](https://chocolatey.org/) installed, you can install Heta compiler using the following commands:
```powershell
choco install heta-compiler
```

Or install a specific version:
```
choco install heta-compiler --version=0.9.5
```

Update Heta compiler
```powershell
choco upgrade heta-compiler
```

Uninstall Heta compiler
```powershell
choco uninstall heta-compiler
```

### Installation in Ubuntu/Debian Linux

Install/Update as .deb package
```bash
wget https://github.com/hetalang/heta-compiler/releases/latest/download/heta-compiler-x64.deb
sudo dpkg -i heta-compiler-x64.deb
```

Uninstall .deb package
```bash
sudo dpkg -r heta-compiler
```

### Installation in other Linux systems

Install/Update for all users (requires sudo privileges)
```bash
sudo wget -O /usr/local/bin/heta https://github.com/hetalang/heta-compiler/releases/latest/download/heta-compiler-linux-x64 && sudo chmod +x /usr/local/bin/heta
```

Uninstall for all users
```bash
sudo rm /usr/local/bin/heta
```

Install/Update for single user without sudo previleges
```bash
mkdir -p ~/bin
wget -O ~/bin/heta https://github.com/hetalang/heta-compiler/releases/latest/download/heta-compiler-linux-x64
chmod +x ~/bin/heta
echo "export PATH=$PATH:~/bin" >> ~/.bashrc
source ~/.bashrc
```

Uninstall for single user
```bash
rm ~/bin/heta
```

### Installation with Homebrew in MacOS

If you have [Homebrew installed](https://brew.sh/), you can install Heta compiler using the following commands:
```bash
brew tap hetalang/heta-compiler
brew install heta-compiler
```

Update Heta compiler
```bash
brew update
brew upgrade heta-compiler
```

Uninstall Heta compiler
```bash
brew uninstall heta-compiler
```

### Installation in Macos

Install/Update for all users (requires sudo privileges)
```bash
sudo wget -O /usr/local/bin/heta https://github.com/hetalang/heta-compiler/releases/latest/download/heta-compiler-macos-x64 && sudo chmod +x /usr/local/bin/heta
```

Uninstall for all users
```bash
sudo rm /usr/local/bin/heta
```

Install/Update for single user without sudo previleges
```bash
mkdir -p ~/bin
wget -O ~/bin/heta https://github.com/hetalang/heta-compiler/releases/latest/download/heta-compiler-macos-x64
chmod +x ~/bin/heta
echo "export PATH=$PATH:~/bin" >> ~/.bashrc
source ~/.bashrc
```

Uninstall for single user
```bash
rm ~/bin/heta
```

Troubleshooting:

In some cases you may need to install Rosetta to run the tool on MacOS. To install Rosetta, run the following command in the terminal:

```bash
softwareupdate --install-rosetta
```

### Installation in NodeJS environment

[NodeJS](https://nodejs.org/en/) must be installed prior to Heta compiler installation. Currently the recommended version is **NodeJS v16 and newer**, but NodeJS v14 is also supported.

The next steps should be taken using console (shell): **cmd**, **PowerShell**, **sh**, **bash** depending on your operating system.

1. Check Node version.
    ```bash
    node -v
    # must be v14.0.0 or newer
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

>for more information see [export formats](./export-formats)

Heta compiler was created to support exporting to different popular modeling and analysis formats.
One of the main development effort is to extend a list of supporting formats and allow people to have the same results working in different tools.
The current version supports the following formats:

- DBSolveOptimum .SLV files [link](https://insysbio.com/en/software/db-solve-optimum)
- SBML L2V4 [link](https://sbml.org/)
- mrgsolve .CPP files [link](https://mrgsolve.github.io/user_guide/)
- Simbiology/Matlab .M files [link](https://www.mathworks.com/products/simbiology.html)
- Matlab describing ODEs file [link](https://www.mathworks.com/help/matlab/ordinary-differential-equations.html)
- Julia format
- JSON formatted file
- YAML formatted file
- Excel sheets
- Dot language files (Graphviz) [link](https://graphviz.org/)

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

>If you would like to load the platform form several files using `include` statement inside "index.heta", see [specifications](/specifications/actions?id=include).

## Creating a Heta platform template

Platform can be structured using a prepared template of folders and pre-constructed embedded files.
Heta compiler provides the `heta init` tool for creating a such a modeling platform template.

The tool creates a draft platform including supplementary files and directories, such as the `platform.js` file, and files for the __git__ repository.

>For more information see the [CLI references](./cli-references?id=quotheta-initquot-command) documentation.

```
heta init
$ heta init
Creating a template platform in directory: "Y:\draft"...
? Platform id (template) draft
? Platform id draft
? Platform notes (platform notes)
? Platform notes platform notes
? Platform version (v0.1.0)
? Platform version v0.1.0
? Platform license (UNLICENSED)
? Platform license UNLICENSED
? Set options (y/N)
? Set options No
? Select file types (Use arrow keys)
> heta
  heta+xlsx
  heta+xlsx extended
  xlsx
  json
  yaml
```

## Usage in NodeJS packages

Heta compiler has been written in NodeJS environment and can be used as a package for browser or server-side tools and applications.

```javascript
const { Builder } = require('./src');
let builder = new Builder();

// platform code in Q-array format
let qArr = [
    { class: 'Compartment', id: 'comp1', assignments: {start_: '1'} },
    { class: 'Species', id: 's1', compartment: 'comp1', assignments: {start_: '10'} },
    { class: 'Reaction', id: 'r1', actors: 's1 =>', assignments: {ode_: 'k1*s1*comp1'} },
    { class: 'Const', id: 'r1', actors: 's1 =>', num: 1e-2 }
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

## Getting help

 - Read Heta documentation on <https://hetalang.github.io/>
 - Use [Gitter Chatroom](https://gitter.im/hetalang/community?utm_source=readme).
 - Use [Issue Tracker](https://github.com/hetalang/heta-compiler/issues)

## Contribute

- [Source Code](https://github.com/hetalang/heta-compiler)
- [Issue Tracker](https://github.com/hetalang/heta-compiler/issues)
- See also contributing in [Heta project](/contributing)

## License

Licensed under the Apache License, Version 2.0. See the [LICENSE](https://raw.githubusercontent.com/hetalang/heta-compiler/refs/heads/master/LICENSE) text.

## Authors and history

The original author of the project is [Evgeny Metelkin](https://metelkin.me). The tool was inspired by the idea that large-scale dynamical systems used in QSP and SB require a specific tool that allows writing model code in unified formats and transforming them depending on one's needs: to database-like format or ODEs. Working with large models should be as easy as with small ones.

- The initial prototype 0.1.x was developed in 2017 and named as **qs3p** (quantitative systems pharmacology programming platform). It was used in several [InSysBio](https://insysbio.com) projects including [IRT](https://irt.insysbio.com/) and **Alzheimer disease consortium**.

- The next versions of **qs3p-js** used the updated format of platform components and a new approach for storing them. A set of new exporting formats was supported. The current version supports Heta code including actions, modules, namespaces. It was used as the main infrastructure for the development of the large- and middle-scale QSP platforms developed in the framework of InSysBio services.

- In 2020 the tool was renamed to **Heta compiler** and published as a Free Open Source project on [GitHub](https://GitHub.com/hetalang/heta-compiler) under Apache 2.0 license. Since then Heta compiler has been developed in the framework of **Heta project**.

Copyright 2019-2025, Heta project