$ErrorActionPreference = 'Stop'

# install wix from PowerShell with admin rights (only when tools are missing)
if (!(Test-Path "${env:WIX}bin\candle.exe") -or !(Test-Path "${env:WIX}bin\light.exe")) {
	choco install wixtoolset -y --no-progress
	Assert-LastExitCode "choco install wixtoolset"
}

# build .exe file for windows
npx --yes pkg . -t node18-win-x64 --compress GZip
Assert-LastExitCode "pkg build"

# get version
$version = node -p "require('./package.json').version"
$VERSION = $version
$msiVersion = $version -replace '^(\d+\.\d+\.\d+).*$','$1'
if ($msiVersion -eq $version -and $version -notmatch '^\d+\.\d+\.\d+$') {
	Write-Error "Cannot convert package version '$version' to MSI/EXE version"
	exit 1
}
$exeVersion = "$msiVersion.0"

if (!(Test-Path "build-win-installer/logo.ico")) {
	Write-Error "Missing MSI icon file: build-win-installer/logo.ico"
	exit 1
}

if (!(Test-Path "${env:WIX}bin\candle.exe") -or !(Test-Path "${env:WIX}bin\light.exe")) {
	Write-Error "WiX tools not found. Ensure wixtoolset is installed and WIX env var is set"
	exit 1
}

# override PE metadata so Windows shows heta version instead of embedded Node runtime version
try {
	npx rcedit dist/heta-compiler.exe --set-file-version "$exeVersion" --set-product-version "$exeVersion" --set-version-string "ProductVersion" "$VERSION"
	Assert-LastExitCode "rcedit"
}
catch {
	Write-Warning "Skipping rcedit metadata update: $($_.Exception.Message)"
}
Copy-Item -Force dist/heta-compiler.exe dist/heta-compiler-win-x64.exe

# get new id
#$guid = [guid]::NewGuid().ToString()
#$NewGUID = $guid

# update version and id in .wxs file
#echo "GUID: $NewGUID"
$pathToWxs = "build-win-installer/perUser.wxs"
$content = Get-Content $pathToWxs -Raw
#$newContent1 = $content -replace '(?<=Product\s+Id=")[^"]*', "$NewGUID"
#$newContent2 = $newContent1 -replace '(?<=Version\s*=\s*")[^"]+', "$VERSION"
$versionReplacement = '${1}' + $msiVersion + '${2}'
$newContent2 = $content -replace '(?s)(<Product\b[^>]*\bVersion\s*=\s*")[^"]+(")', $versionReplacement

$newContent2 | Set-Content $pathToWxs

# build .msi file for windows
& ${env:WIX}bin\candle.exe -o dist/ build-win-installer/perUser.wxs
Assert-LastExitCode "candle"
& ${env:WIX}bin\light.exe -o dist/heta-compiler-win-x64-installer.msi dist/perUser.wixobj -ext WixUIExtension
Assert-LastExitCode "light"