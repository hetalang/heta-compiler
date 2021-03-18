#=
  default run
=#
using SimSolver, Plots

model = load_jlmodel("./model.jl")

### default simulations
simulate(model, tspan = (0,100)) |> plot
