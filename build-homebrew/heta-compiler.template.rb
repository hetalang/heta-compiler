class HetaCompiler < Formula
    desc "CLI for Heta Compiler"
    homepage "https://hetalang.github.io/hetacompiler/"
    license "Apache-2.0"
    version "$VERSION"

    on_macos do
      on_arm do
        url "https://github.com/hetalang/heta-compiler/releases/download/$VERSION/heta-compiler-macos-arm64.tar.gz"
        sha256 "$SHA256ARM64"
      end

      on_intel do
        url "https://github.com/hetalang/heta-compiler/releases/download/$VERSION/heta-compiler-macos-x64.tar.gz"
        sha256 "$SHA256X64"
      end
    end
  
    def install
      # mv "heta-compiler", "heta" # Rename the file
      bin.install "heta-compiler" => "heta"
    end
  
    test do
      system "#{bin}/heta", "-v"
    end

    livecheck do
      url :stable
      strategy :github_latest
    end
end
