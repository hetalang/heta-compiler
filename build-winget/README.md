# WinGet manifest preparation

`prepare-manifests.ps1` generates the three WinGet multi-file manifests for
`heta-compiler` and validates them locally. It does not upload release assets,
create a pull request, or publish anything to the WinGet repository.

## Prerequisites

- A Windows x64 ZIP release asset at `dist/heta-compiler-windows-x64.zip`.
  The archive must contain exactly one file: `heta-compiler.exe`.
- `winget` available on `PATH` for validation.

## Local release preparation

After producing the Windows ZIP asset, run:

```powershell
.\build-winget\prepare-manifests.ps1
```

The script reads the version from `package.json`, calculates the ZIP SHA-256,
and writes the result to:

```text
dist/build-winget/manifests/h/HetaProject/HetaCompiler/<version>/
```

Use `-ReleaseTag` when the GitHub release tag differs from `v<version>`, and
`-InstallerPath` when the ZIP is in another location.

## Release workflow

The Windows release job runs this script after producing the ZIP asset. The
generated manifests are retained as the `winget-manifests-<version>` workflow
artifact for 30 days. Download that artifact and submit its contents manually
to `microsoft/winget-pkgs` after the matching ZIP asset is published.
