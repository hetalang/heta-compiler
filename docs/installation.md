# Installation

## In Windows

### MSI Installer (recommended)

[Download -win-x64-installer.msi from release page](https://github.com/hetalang/heta-compiler/releases/latest) and install or update.

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

### Other Linux systems

Install/Update for all users (requires sudo privileges)
```bash
sudo wget -O /usr/local/bin/heta https://github.com/hetalang/heta-compiler/releases/latest/download/heta-compiler-linux-x64 && sudo chmod +x /usr/local/bin/heta
```

Uninstall for all users
```bash
sudo rm /usr/local/bin/heta
```

Install/Update for single user without sudo previleges
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

## In MacOS

### Homebrew package manager (recommended)

If you have [Homebrew installed](https://brew.sh/), you can install Heta compiler using the following commands:
```bash
brew tap hetalang/heta-compiler
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

### Other MacOS systems

Install/Update for all users (requires sudo privileges)
```bash
sudo wget -O /usr/local/bin/heta https://github.com/hetalang/heta-compiler/releases/latest/download/heta-compiler-macos-x64 && sudo chmod +x /usr/local/bin/heta
```

Uninstall for all users
```bash
sudo rm /usr/local/bin/heta
```

Install/Update for single user without sudo previleges
```bash
mkdir -p ~/bin
wget -O ~/bin/heta https://github.com/hetalang/heta-compiler/releases/latest/download/heta-compiler-macos-x64
chmod +x ~/bin/heta
echo "export PATH=$PATH:~/bin" >> ~/.bashrc
source ~/.bashrc
```

Uninstall for single user
```bash
rm ~/bin/heta
```

**Troubleshooting:**

In some cases you may need to install Rosetta to run the tool on MacOS. To install Rosetta, run the following command in the terminal:

```bash
softwareupdate --install-rosetta
```

## In NodeJS environment

[NodeJS](https://nodejs.org/en/) must be installed prior to Heta compiler installation. Currently the recommended version is **NodeJS v18 and newer**.

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
