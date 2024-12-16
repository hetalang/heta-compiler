$packageName = 'heta-compiler'
$toolsDir = "$(Split-Path -Parent $MyInvocation.MyCommand.Definition)"
$exePath = Join-Path $toolsDir 'heta.exe'

# Destination for the executable to be globally accessible
$destinationDir = [Environment]::GetEnvironmentVariable('ChocolateyToolsLocation', 'Machine')
if (-not $destinationDir) {
    $destinationDir = "$env:ProgramData\chocolatey\bin"
}

# Copy executable to the destination directory
Copy-Item -Path $exePath -Destination $destinationDir -Force

# Add the destination directory to PATH (if not already there)
$path = [Environment]::GetEnvironmentVariable('PATH', 'Machine')
if ($path -notlike "*$destinationDir*") {
    [Environment]::SetEnvironmentVariable('PATH', "$path;$destinationDir", 'Machine')
    Write-Output "Added $destinationDir to PATH"
}

Write-Output "$packageName installed and added to PATH"
