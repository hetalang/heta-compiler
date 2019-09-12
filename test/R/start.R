#!/usr/bin/env Rscript

# script should be started from console:
# Rscript.exe ./diagnostics/mrgsolve_sim/start.R "model file" "output folder"

args = commandArgs(trailingOnly = TRUE)
if (length(args) < 1) {
  stop("At least one argument must be supplied (model file).cpp", call.=FALSE)
}
filename <- args[1]
results_folder <- args[2]

# library(mrgsolve, warn.conflicts = FALSE) # simple but not stable way
if(!require(mrgsolve, warn.conflicts = FALSE)){
  install.packages("mrgsolve")
  library(mrgsolve, warn.conflicts = FALSE)
}

if(!require(lattice, warn.conflicts = FALSE)){
  install.packages("lattice")
  library(lattice, warn.conflicts = FALSE)
}

if(!require(withr, warn.conflicts = FALSE)){
  install.packages("withr")
  library(withr, warn.conflicts = FALSE)
}

res <- try({
  source('test/R/simulate.R')
})
if(inherits(res, "try-error")) q(status=1) else message("All done.")

quit(save = 'no')
