# Quality, security, and reproducibility

Heta Compiler is engineering infrastructure for quantitative systems pharmacology (QSP) and systems biology model development. It applies industrial software-quality practices designed to make compiler behavior reviewable, changes detectable, releases traceable, and model transformations reproducible.

[![Autotests](https://github.com/hetalang/heta-compiler/actions/workflows/nodejs.yml/badge.svg?branch=master)](https://github.com/hetalang/heta-compiler/actions/workflows/nodejs.yml)
[![Coverage Status](https://coveralls.io/repos/github/hetalang/heta-compiler/badge.svg?branch=master)](https://coveralls.io/github/hetalang/heta-compiler?branch=master)
[![CodeQL](https://github.com/hetalang/heta-compiler/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/hetalang/heta-compiler/actions/workflows/github-code-scanning/codeql)
[![GitHub release](https://img.shields.io/github/v/release/hetalang/heta-compiler?display_name=tag&sort=semver)](https://github.com/hetalang/heta-compiler/releases/latest)

## Quality assurance and quality control

### Automated verification

- **Unit, integration, and regression tests** cover parsing, semantic checks, dependency resolution, units, model composition, command-line behavior, and supported import and export formats.
- **Reference-output tests** compile representative models and compare generated Canonical, SBML, and DynMS artifacts with version-controlled expected outputs. Unexpected output changes are therefore visible during development.
- **Schema-focused test suites** check generated DynMS, Heta JSON, and SBML documents against their corresponding schemas.
- **Cross-platform continuous integration** runs the automated test suite on Ubuntu, macOS, and Windows across multiple Node.js versions. The same dependency graph is installed from `package-lock.json` with `npm ci`.
- **Public test coverage** is collected automatically and published through [Coveralls](https://coveralls.io/github/hetalang/heta-compiler?branch=master).

The test definitions, reference cases, expected outputs, and CI configuration are maintained in the public repository. Quality evidence can therefore be inspected independently rather than relying on a product claim.

### Release controls and traceability

- Releases are identified by versioned Git tags and documented in the [Change Log](https://github.com/hetalang/heta-compiler/blob/master/CHANGELOG.md).
- Release automation builds platform-specific artifacts. Stable-release executables are installed and their reported versions are checked on macOS arm64, Linux x64, Linux arm64, and Windows x64 before downstream package publication.
- The npm lockfile records the resolved dependency graph used by automated builds and tests.
- Compiler errors stop the build for invalid Heta input. Known unsupported constructs covered by validation are rejected explicitly rather than silently discarded during conversion.

Together, the source revision, release tag, change log, locked dependencies, CI logs, and generated reports provide an auditable chain from source to released behavior.

## Reproducibility

### Deterministic model transformation

Heta Compiler separates a model's source representation from target-specific generated code. Given the same source files, platform configuration, compiler version, and dependency environment, compilation is designed to produce stable model transformations. Regression tests detect unintended changes in generated artifacts.

For long-lived or regulated workflows, record at minimum:

- the Heta Compiler version or Git commit;
- all model source files and the platform declaration file;
- the selected export format and its options;
- the runtime, solver, and dependency versions used after compilation.

Compiler reproducibility does not by itself guarantee bitwise-identical simulation results. Numerical results may also depend on the target simulator, solver configuration, tolerances, runtime, operating system, and hardware.

### DynMS as a reproducible intermediate representation

[DynMS](./dynms/description) is a lightweight, portable intermediate representation for executable dynamic models. It contributes to reproducible workflows through:

- a versioned document format and published JSON Schema;
- solver-independent model structure;
- canonical MathJSON expressions produced by Heta Compiler;
- explicit constants, states, assignments, events, and observables;
- defined validation rules and deterministic simulation semantics;
- a common artifact for testing code generation and conversion across simulation backends.

DynMS makes the transformed model inspectable without relying on the syntax of a specific solver. Its schema version and the Heta Compiler version should be retained with the model artifacts.

### Reproducibility reports for the latest stable release

The following reports run Heta Compiler against the independent [SBML Test Suite](https://github.com/sbmlteam/sbml-test-suite). Each case is imported from SBML and transformed into canonical JSON and DynMS.

| Test set | Conversion check | Latest stable release |
| --- | --- | --- |
| SBML Test Suite | SBML L3V2 → canonical JSON + DynMS | [![SBML L3V2 conversion](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fhetalang%2Fheta-compiler%2Freports%2Fsbml-report%2Freleases%2Flatest%2Fl3v2%2Fbadge.json)](https://hetalang.github.io/format-conversion-test-suite/report/?ref=https%3A%2F%2Fraw.githubusercontent.com%2Fhetalang%2Fheta-compiler%2Freports%2Fsbml-report%2Freleases%2Flatest%2Fl3v2%2Freport.json) |
| SBML Test Suite | SBML L3V1 → canonical JSON + DynMS | [![SBML L3V1 conversion](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fhetalang%2Fheta-compiler%2Freports%2Fsbml-report%2Freleases%2Flatest%2Fl3v1%2Fbadge.json)](https://hetalang.github.io/format-conversion-test-suite/report/?ref=https%3A%2F%2Fraw.githubusercontent.com%2Fhetalang%2Fheta-compiler%2Freports%2Fsbml-report%2Freleases%2Flatest%2Fl3v1%2Freport.json) |
| SBML Test Suite | SBML L2V5 → canonical JSON + DynMS | [![SBML L2V5 conversion](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fhetalang%2Fheta-compiler%2Freports%2Fsbml-report%2Freleases%2Flatest%2Fl2v5%2Fbadge.json)](https://hetalang.github.io/format-conversion-test-suite/report/?ref=https%3A%2F%2Fraw.githubusercontent.com%2Fhetalang%2Fheta-compiler%2Freports%2Fsbml-report%2Freleases%2Flatest%2Fl2v5%2Freport.json) |

The report records successful, failed, and not-evaluated cases. The exact exclusions for unsupported SBML features are declared in the public [verification workflow](https://github.com/hetalang/heta-compiler/blob/master/.github/workflows/verify-format-conversion.yml), so the scope of the result is explicit.

## Security controls

### Vulnerability management

- The repository maintains a [Security Policy](https://github.com/hetalang/heta-compiler/security/policy) with supported release lines, a private reporting channel, response expectations, and the remediation process.
- Dependency vulnerabilities are reviewed with `npm audit` and GitHub Dependabot alerts. Known dependency vulnerabilities are addressed during release maintenance.
- [GitHub Security and quality](https://github.com/hetalang/heta-compiler/security) is enabled for private vulnerability reporting, Dependabot alerts, code scanning, secret scanning, security advisories, and code-quality findings.
- CodeQL static analysis runs automatically and publishes its status through GitHub Actions.
- Security-sensitive fixes are tested through the same automated regression and cross-platform CI controls as other changes.

Potential vulnerabilities should not be disclosed in a public issue. Follow the private process in the [Security Policy](https://github.com/hetalang/heta-compiler/security/policy).

## Scope for regulated use

These controls provide objective evidence for software assessment and can support an organization's qualification process. They do not, by themselves, certify Heta Compiler for every intended use and do not validate the scientific content of a pharmacological model.

An organization using Heta Compiler in a regulated process remains responsible for its intended-use definition, risk assessment, environment qualification, model verification and validation, change control, access control, record retention, and applicable regulatory requirements. This distinction is consistent with the risk-based, intended-use approach described in the [FDA guidance on Computer Software Assurance](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/computer-software-assurance-production-and-quality-management-system-software).

## Public evidence

| Control | Evidence |
| --- | --- |
| Automated tests and platform matrix | [Autotests workflow](https://github.com/hetalang/heta-compiler/actions/workflows/nodejs.yml) |
| Test coverage | [Coveralls report](https://coveralls.io/github/hetalang/heta-compiler?branch=master) |
| Static security analysis | [CodeQL workflow](https://github.com/hetalang/heta-compiler/actions/workflows/github-code-scanning/codeql) |
| Security features and findings | [Security and quality](https://github.com/hetalang/heta-compiler/security) |
| Vulnerability reporting and supported versions | [Security Policy](https://github.com/hetalang/heta-compiler/security/policy) |
| Released versions and artifacts | [GitHub Releases](https://github.com/hetalang/heta-compiler/releases) |
| Change traceability | [Change Log](https://github.com/hetalang/heta-compiler/blob/master/CHANGELOG.md) |
| Format-conversion evidence | [Verification workflow](https://github.com/hetalang/heta-compiler/blob/master/.github/workflows/verify-format-conversion.yml) |
| DynMS specification and schema | [DynMS description](./dynms/description) |
