using HetaSimulator
using Plots

p = load_platform("cases/34-atStart")
m = models(p)[:nameless]

# threeshold: 2.5 - wrong, 1.5 - wrong, 0.5 - wrong
res1 = Scenario(m, (0., 1200.); parameters = [:threeshold => 0.5]) |> sim
plot(res1; vars = [:s3, :s4])
plot(res1; vars = [:s5, :s6])
