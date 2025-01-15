# README

## Publishing

copy generated `heta-compiler.exe` to `tools/heta.exe`
copy LICENSE to `tools/LICENSE.txt`

Generate checksum and update tools/VERIFICATION.txt
```ps1
Get-FileHash -Path .\tools\heta.exe -Algorithm SHA256
```

Update version in `heta-compiler.nuspec`

Build and test

```ps1
choco pack
choco install heta-compiler --pre -s .
choco uninstall heta-compiler
```

Get API key from https://community.chocolatey.org/account

```ps1
choco apikey --key <your-api-key> --source https://push.chocolatey.org/
choco push heta-compiler.0.9.3.nupkg --source https://push.chocolatey.org/
#choco push heta-compiler.0.9.3.nupkg --source=https://push.chocolatey.org/ --api-key=<your-api-key>
```

## Installation

```ps1
choco install heta-compiler
```

## Update

```ps1
choco upgrade heta-compiler
```

## Uninstall

```ps1
choco uninstall heta-compiler
```
