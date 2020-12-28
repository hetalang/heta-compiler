#=
  default run
=#
using SimSolver, Plots

include("./model.jl"); # if working directory includes model.jl
models, _ = Platform();

### default simulations for nameless namespace
SimpleSTask(models.nameless) |>
  solve_task |> 
  plot
