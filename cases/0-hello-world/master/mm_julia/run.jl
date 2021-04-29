#=
  default run
=#
using HetaSimulator, Plots

model = load_jlmodel("./model.jl")

### default simulations
sim(model, tspan = (0,100)) |> plot
