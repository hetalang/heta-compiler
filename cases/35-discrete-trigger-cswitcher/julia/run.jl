using HetaSimulator
using Plots

p = load_platform("cases/35-discrete-trigger-cswitcher")
m = models(p)[:nameless]

# XXX: do not work
res1 = Scenario(m, (0., 1200.)) |> sim
plot(res1; vars = [:xxx])
plot(res1; vars = [:s7])
