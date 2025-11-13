# install wix from PowerShell with admin rights
choco install wixtoolset

# build .exe file for windows
npx pkg . -t win --compress GZip
cp -Force dist/heta-compiler.exe dist/heta-compiler-win-x64.exe

# get version
$version = node -p "require('./package.json').version"
$VERSION = $version

# get new id
#$guid = [guid]::NewGuid().ToString()
#$NewGUID = $guid

# update version and id in .wxs file
#echo "GUID: $NewGUID"
$pathToWxs = "build-win-installer/perUser.wxs"
$content = Get-Content $pathToWxs -Raw
#$newContent1 = $content -replace '(?<=Product\s+Id=")[^"]*', "$NewGUID"
#$newContent2 = $newContent1 -replace '(?<=Version\s*=\s*")0\.0\.0', "$VERSION"
$newContent2 = $content -replace '(?<=Version\s*=\s*")0\.0\.0', "$VERSION"

$newContent2 | Set-Content $pathToWxs

# build .msi file for windows
& ${env:WIX}bin\candle.exe -o dist/ build-win-installer/perUser.wxs
& ${env:WIX}bin\light.exe -o dist/heta-compiler-win-x64-installer.msi dist/perUser.wixobj -ext WixUIExtension