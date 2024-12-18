# README

## Publishing

- find the directlink to new archive in releases
    https://github.com/hetalang/heta-compiler/releases/download/v0.9.2/heta-compiler-macos.tar.gz

- calculate checksum
    ```sh
    shasum -a 256 heta-compiler-macos.tar.gz
    ```
- update url and sha256 in Formula/heta-compiler.rb

- testing
    ```sh
    brew install --build-from-source Formula/heta-compiler.rb
    ```

## Installation

```sh
brew tap hetalang/heta-compiler
brew install heta-compiler
```

## Update

```sh
brew update
brew upgrade heta-compiler
```

## Uninstall

```sh
brew uninstall heta-compiler
```
