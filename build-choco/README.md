# README

## Publishing

copy generated `heta-compiler.exe` to `tools/heta.exe`

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
choco push heta-compiler.0.9.2.nupkg --source https://push.chocolatey.org/
```
