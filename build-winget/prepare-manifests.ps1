[CmdletBinding()]
param(
    [string]$InstallerPath = 'dist/heta-compiler-windows-x64.zip',
    [string]$OutputRoot = 'dist/build-winget/manifests',
    [string]$Version,
    [string]$ReleaseTag,
    [switch]$SkipValidation
)

$ErrorActionPreference = 'Stop'

function Assert-LastExitCode {
    param([string]$Operation)

    if ($LASTEXITCODE -ne 0) {
        throw "$Operation failed with exit code $LASTEXITCODE."
    }
}

if ([string]::IsNullOrWhiteSpace($Version)) {
    $Version = node -p "require('./package.json').version"
    Assert-LastExitCode 'Reading package version'
}

if ([string]::IsNullOrWhiteSpace($ReleaseTag)) {
    $ReleaseTag = "v$Version"
}

$installer = Get-Item -LiteralPath $InstallerPath -ErrorAction Stop
if ($installer.Extension -ne '.zip') {
    throw "WinGet portable manifests require a ZIP asset; received '$installer'."
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::OpenRead($installer)
try {
    $files = @($archive.Entries | Where-Object { -not $_.FullName.EndsWith('/') })
    if ($files.Count -ne 1 -or $files[0].FullName -ne 'heta-compiler.exe') {
        $actualFiles = $files.FullName -join ', '
        throw "The ZIP must contain only 'heta-compiler.exe'; found: $actualFiles"
    }
}
finally {
    $archive.Dispose()
}

$installerSha256 = (Get-FileHash -LiteralPath $installer -Algorithm SHA256).Hash
$manifestDirectory = Join-Path $OutputRoot ("h/HetaProject/HetaCompiler/$Version")
$templateDirectory = Join-Path $PSScriptRoot 'templates'
New-Item -ItemType Directory -Path $manifestDirectory -Force | Out-Null

$replacements = @{
    '$PACKAGE_VERSION' = $Version
    '$RELEASE_TAG' = $ReleaseTag
    '$INSTALLER_SHA256' = $installerSha256
}

Get-ChildItem -LiteralPath $templateDirectory -Filter '*.template' -File | ForEach-Object {
    $content = Get-Content -LiteralPath $_.FullName -Raw
    foreach ($placeholder in $replacements.Keys) {
        $content = $content.Replace($placeholder, $replacements[$placeholder])
    }

    $outputName = $_.Name -replace '\.template$', ''
    Set-Content -LiteralPath (Join-Path $manifestDirectory $outputName) -Value $content -NoNewline
}

if (-not $SkipValidation) {
    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
        throw 'winget was not found. Install Windows Package Manager or rerun with -SkipValidation.'
    }

    & winget validate --manifest $manifestDirectory --disable-interactivity
    Assert-LastExitCode 'WinGet manifest validation'
}

Write-Host "WinGet manifests prepared: $manifestDirectory"
Write-Host "Installer SHA-256: $installerSha256"
