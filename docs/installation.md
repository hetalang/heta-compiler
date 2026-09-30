# Installation

## In Windows

### MSI Installer (recommended)

On the [release page](https://github.com/hetalang/heta-compiler/releases/latest), download `heta-compiler-<version>-win-x64-installer.msi` and run it to install or update Heta Compiler.

### Chocolatey

If you have [Chocolatey](https://chocolatey.org/) installed, you can install Heta compiler using the following commands:
```ps
choco install heta-compiler
```

Or install a specific version:
```ps
choco install heta-compiler --version=0.9.5
```

Update Heta compiler
```ps
choco upgrade heta-compiler
```

Uninstall Heta compiler
```ps
choco uninstall heta-compiler
```

## In Linux

### Ubuntu/Debian package (recommended)

Install/Update as .deb package
```bash
wget https://github.com/hetalang/heta-compiler/releases/latest/download/heta-compiler-x64.deb
sudo dpkg -i heta-compiler-x64.deb
```

Uninstall .deb package
```bash
sudo dpkg -r heta-compiler
```

### Other Linux systems (x64)

Install/Update for all users (requires sudo privileges)
```bash
sudo wget -O /usr/local/bin/heta https://github.com/hetalang/heta-compiler/releases/latest/download/heta-compiler-linux-x64 && sudo chmod +x /usr/local/bin/heta
```

Uninstall for all users
```bash
sudo rm /usr/local/bin/heta
```

Install/Update for single user without sudo privileges
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

## In macOS

Standalone packages and the Homebrew formula are available for Apple Silicon (arm64) only on macOS 13.5 or later.

### Homebrew package manager (recommended)

If you have [Homebrew installed](https://brew.sh/), you can install Heta compiler using the following commands:
```bash
brew tap hetalang/heta-compiler
brew trust --formula hetalang/heta-compiler/heta-compiler
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

### Manual installation on Apple Silicon

Install/Update for all users (requires sudo privileges)
```bash
sudo curl -L -o /usr/local/bin/heta https://github.com/hetalang/heta-compiler/releases/latest/download/heta-compiler-macos-arm64 && sudo chmod +x /usr/local/bin/heta
```

Uninstall for all users
```bash
sudo rm /usr/local/bin/heta
```

Install/Update for single user without sudo privileges
```bash
mkdir -p ~/bin
curl -L -o ~/bin/heta https://github.com/hetalang/heta-compiler/releases/latest/download/heta-compiler-macos-arm64
chmod +x ~/bin/heta
echo "export PATH=$PATH:~/bin" >> ~/.bashrc
source ~/.bashrc
```

Uninstall for single user
```bash
rm ~/bin/heta
```

### Older macOS versions and Intel Macs

For other supported Macs, install the indicated Node.js version and then run:

```bash
npm i -g heta-compiler
```

| Mac and macOS version | Installation method | Node.js version |
| --- | --- | --- |
| Apple Silicon, macOS 11.0–13.4 | npm | Node.js 22.x |
| Intel, macOS 11.0–13.4 | npm | Node.js 22.x |
| Intel, macOS 10.15 | npm | Node.js 20.x |

The standalone binary and Homebrew formula do not support Intel Macs or macOS before 13.5; macOS 10.14 and earlier are unsupported.

## In Node environment

[NodeJS](https://nodejs.org/en/) must be installed prior to Heta compiler installation. The recommended version is **NodeJS v24**.

The next steps should be taken using console (shell): **cmd**, **PowerShell**, **sh**, **bash** depending on your operating system.

1. Check Node version.
    ```bash
    node -v
    # must be v18.0.0 or newer
    ```

2. The latest stable version of Heta compiler can be installed from npm
    ```bash
    npm i -g heta-compiler
    ```
    **OR** The development version can be installed directly from GitHub
    ```bash
    npm i -g git+https://github.com/hetalang/heta-compiler.git
    ```
