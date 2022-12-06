#=
  default run
=#
using HetaSimulator, Plots

model = load_jlmodel("./model.jl")

### default simulations

Scenario(model, (0, 100)) |> sim |> plot
