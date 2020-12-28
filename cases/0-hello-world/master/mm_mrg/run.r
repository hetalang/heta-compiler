# preamble
library('mrgsolve')

# load model
mm_model <- mrgsolve::mread(model = 'mm', file = 'model.cpp')

# run model
sim <- mm_model %>%
  mrgsim(
    delta = 1,
    hmax = 0,
    maxsteps = 1e9,
    atol = 1e-7,
    rtol = 1e-4,
    end = 120
  )

# plot results
plot <- sim %>%
    plot(type='l')

# show
plot