---
title: 'Heta compiler: a software tool for the development of large scale QSP models and compilation them into different formats'
tags:
  - systems biology
  - quantitative systems pharmacology
  - mathematical modeling
  - pharmacometrics
  - format conversion
  - sbml
  - heta
authors:
  - name: Evgeny Metelkin
    orcid: 0000-0001-6612-5373
    affiliation: 1
affiliations:
 - name: InSysBio LLC
   index: 1
date: 20 August 2021
bibliography: paper.bib

---

# Summary

Today the mathematical modeling is becoming more and more popular in biomedicine and drug development. __Quantitative systems pharmacology__ (QSP) been a relatively new research discipline is devoted to complex models describing organisms, diseases and drug dynamics. The mission of the approach implies a set of challenging methodological problems like managing huge amount of data, dealing with large-scale models, time consuming calculations, etc. __Heta compiler__ is a small and fast software tool written in JavaScript which manages infrastructure for QSP modeling projects. The purpose of the tool is to build and integrate QSP platform modules, to check its completeness and consistency and then to compile everything into runnable code that will be executed in a simulation software. Heta compiler also provides the information on errors in a model and can be used for debugging process.  A user can apply command line interface to run the model building process. Alternatively, Heta compiler can be used as a package for developing of a web-based application or be integrated with a simulation software.

# Statement of need

The large and still growing QSP/SB modeling community utilizes a variety of software tools for simulation and data analysis [@Stephanou2018; @Mentre2020; @Knight-Schrijver2016]. Usually modelers solve the algebraic-differential equations or problems that are based on ODE solutions like parameters identification or sensitivity analysis. Having good facilities on tackling specific problems a particular software often has no user-friendly format for routine operations like step-by-step model creation and update. Furthermore, different tools have their own internal model format which cannot be reused in another tool.

This paper presents Heta compiler which provides the convenient and flexible way for the development of dynamic large-scale models based on the __Heta language__ code. Moreover, the compiler translates the source modeling code into variety of formats to be run in simulation software tools.

This tool is an effort to resolve the typical problems in a QSP project by creating the software infrastructure and to develop a shared and controllable working environment. The pre-formulated requirements are: 
-	store QSP models and data in integrated infrastructure, 
-	support iterative platform updates, 
-	support of models written in human-readable and human-writable formats as well as in tables, 
-	help for model code reuse and sharing,
- providing interface for storing several models in a single platform,
-	export models and data to different popular formats out-of-the-box.

# Heta formats

`Heta compiler` has been evolving alongside the Heta language [@metelkin2019] formalism. Heta is a series of human readable and writable formats generalizing models in QSP and Systems Biology projects: Heta code, table representation, JSON and YAML notation. Heta describes dynamic models in the process-description format i.e., as interacting components that describe volumes, concentrations, amounts, rates. On the other side it was designed to be easily transformed into ODEs or other formats that can be run in simulation software tools. 

The most important features of the Heta formats:
-	Human-readable/writable code can be used for model creation, modification, or integration.
- Any format from the list must be represented in other forms: code can be translated to tables ans so on.
-	Easy code parsing and transformation for potential implementation into different tools and frameworks.
-	Modularity: QSP/SB platform can be subdivided into several files and spaces for better project management.
-	Reusability: modeling platforms should be easily extended for other projects.
-	Reach annotation capabilities for better model code revision and reporting.
-	Simple transformation to popular modeling formats or general purpose ODEs.

The Heta language specification also includes the rules of translation from/into a SBML notation [@Hucka2003] which is another popular modeling format.

## Example

There is an example of the Heta code describing a simple one-compartment model. The metabolic scheme of the model can be found in \autoref{fig:model-scheme}.

```heta
/*
  Simple model
*/
comp1 @Compartment .= 1;
A @Species { compartment: comp1 };
B @Species { compartment: comp1 };
r1 @Reaction { actors: A => 2B };

// math
A .= 10;
B .= 0;
r1 := k1 * A * comp1;

k1 @Const = 1e-3;

#export { format: SBML, filepath: sbml };
#export { format: Mrgsolve, filepath: mrgsolve };
```

![One compartment model with two metabolites and one reaction.\label{fig:model-scheme}](model-scheme.png){ width=60% }

When the size of a model code is large it is recommended to subdivide it into modules but this model is small an can be placed into a single file, e.g `index.heta`. To build the platform with `Heta compiler` one can run the compilation with the following command in a command terminal.

```sh
> heta build
```

# Features overview

`Heta compiler` includes parser of the Heta formats and support all features of the [Heta specifications](https://hetalang.github.io/#/specifications/) of version 0.4.1. 
It was designed to support exporting to different popular modeling formats. The current version supports the following:
-	DBSolveOptimum .SLV files
-	SBML of levels 2 and 3
-	mrgsolve .CPP files
-	Simbiology’s .M files
-	Matlab describing ODEs file
-	Julia language code
-	JSON/YAML
-	Excel sheets

`Heta compiler` can work in two modes: as an command line tool for a model development or as a library to be incorporated into third-party applications. 
The source code is written in pure JavaScript and can be run in the Node environment or in a browser.
It can be used for both: server-side and frontend applications.

The typical usage of `Heta compiler` in a modeling project implies that a user should follow the specific formats and agreements.
Project files i.e. model code, datasets, figures etc. should be stored in the same directory.
This directory typically include also `platform.json` declaration file that stores the supplementary information of a platform as well as specific parameters for platform compilation.
`platform.json` is optional and can be skipped in simple cases.
The alternative way to set the options of compiler is to use command line arguments.
The list of them can be shown with `heta build -h` command in a shell.

![A typical workflow of `heta compiler` in a modeling project.\label{fig:workflow}](workflow.png)

# Results and discussion

`Heta compiler` can be used as the framework for a QSP modeling project of any size and complexity. It allows integrate the dynamical models and data as modules and transform the modeling code to different popular formats. The Heta-based formats are friendly for version control systems like Git and SVN because of the modular structure and the text-based representation. Usage of a version control system add benefits to the modeling workflow:
-	Storing of a platform history and results with important steps.
-	Controllable and manageable code sharing with the remote synchronization.
-	Working tasks distribution and delegation.
-	Usage of automatization facilities (CI/CD) like GitHub actions, GitLab runner, etc.
-	Delivery of results to users/clients.
Heta compiler can easily be integrated with existed modeling infrastructure, workflows or used as a part of the CI/CD strategy.

Currently `Heta compiler` is intensively utilized for the development and maintenance of variety of commercial and open-source modeling projects [@faah; @covid]. It was tested and demonstrates its effective especially for the large-scale models (1000 dynamic components and more).

`Heta compiler` has also been used for the development of web applications like the Immune Response Template navigator [@irt] and "PK/RO simulator" R-Shiny application [@mAb-app].

`Heta compiler` is a part of the Heta project which is an initiative for the development of full-cycle infrastructure for modeling in pharmacology and biology: <https://hetalang.github.io>.

# References
