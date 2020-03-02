# setwd("Y:\\PLATFORMS\\dermatitis-lilly")
# filename <- "y:/heta-compiler/test/cases/1/dist/mm_mrg.cpp"
# results_folder <- "simulations"

message('Reading model. ', appendLF = FALSE)
with_dir(getwd(), {
  model <- mread(model = 'test', file = filename)
})
message('OK')

message('Default run...', appendLF = FALSE)
plot <- model %>%
  mrgsim %>%
  plot
message('OK')

message('Default plot...', appendLF = FALSE)
lattice::trellis.device(device = pdf, file =  paste(results_folder, 'output.pdf', sep='/'))
print(plot)
dev.off()
message('OK')
